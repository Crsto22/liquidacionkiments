import type { NextRequest } from "next/server";
import { EventType, TikTokLiveClient } from "piratetok-live-js";

type ChatPayload = {
  content?: string;
  user?: {
    nickname?: string;
    uniqueId?: string;
  };
};

export async function GET(request: NextRequest) {
  const username = (request.nextUrl.searchParams.get("username") ?? "kiments.2")
    .replace(/^@/, "")
    .trim();

  if (!username) {
    return new Response("Falta el usuario de TikTok", { status: 400 });
  }

  const encoder = new TextEncoder();
  const client = new TikTokLiveClient(username);

  let controllerRef: ReadableStreamDefaultController<Uint8Array> | null = null;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let closed = false;

  const send = (event: string, payload: unknown) => {
    if (closed || !controllerRef) return;
    try {
      controllerRef.enqueue(
        encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`),
      );
    } catch {
      // El navegador ya cerró la conexión.
    }
  };

  const finish = () => {
    if (closed) return;
    closed = true;
    if (heartbeat) clearInterval(heartbeat);
    try {
      client.disconnect();
    } catch {
      // La conexión ya estaba cerrada.
    }
    try {
      controllerRef?.close();
    } catch {
      // El stream ya estaba cerrado.
    }
  };

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controllerRef = controller;

      heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          finish();
        }
      }, 15000);

      client.on(EventType.chat, (raw) => {
        const data = raw as ChatPayload;
        const comment = (data.content ?? "").trim();
        if (!comment) return;

        send("chat", {
          user: data.user?.nickname ?? data.user?.uniqueId ?? "Anónimo",
          comment,
          time: new Date().toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      });

      client.on(EventType.liveEnded, () => {
        send("status", { status: "ended" });
        finish();
      });

      client.on(EventType.disconnected, () => {
        send("status", { status: "disconnected" });
        finish();
      });

      request.signal.addEventListener("abort", finish);

      client
        .connect()
        .then(() => {
          send("status", { status: "connected", username });
        })
        .catch((error: unknown) => {
          send("live-error", {
            message:
              error instanceof Error
                ? error.message
                : "No se pudo conectar al live de TikTok.",
          });
          finish();
        });
    },
    cancel() {
      finish();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
