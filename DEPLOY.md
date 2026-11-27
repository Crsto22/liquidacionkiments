# Despliegue de Liquidación Kiments (beta) con Docker

## Archivos incluidos

- `Dockerfile`: build multi-etapa con salida `standalone` de Next.js.
- `docker-compose.yml`: servicio `liquidacionkiments`, puerto **3004** en el host.
- `.dockerignore`: evita copiar `node_modules`, `.next`, `.git`, etc.
- `.env.example`: variable opcional `APP_PORT`.

La app **no usa base de datos ni variables de entorno obligatorias**.
Los pedidos se guardan en el `localStorage` del navegador (beta).

## 1. Subir el proyecto al VPS

Desde tu PC (ejecutar en la carpeta del proyecto, no dentro de `liquidacionkiments`):

```bash
scp -r liquidacionkiments usuario@IP_DEL_VPS:/ruta/proyectos/
```

Si el proyecto está en git, puedes clonarlo directamente en el VPS.

## 2. Construir y levantar

En el VPS:

```bash
cd /ruta/proyectos/liquidacionkiments

# Opcional: cambiar el puerto (por defecto 3004)
cp .env.example .env
# editar .env si se desea otro APP_PORT

docker compose up -d --build
docker compose ps
docker compose logs -f
```

Abrir:

```
http://IP_DEL_VPS:3004
```

El contenedor escucha internamente en `3000` y se publica en `3004`.
En tu VPS los puertos `3000`, `3001`, `3002` y `3003` ya están ocupados, por eso se usa `3004`.

## 3. Actualizar la app

```bash
cd /ruta/proyectos/liquidacionkiments
docker compose up -d --build
docker image prune -f
```

## 4. Comandos útiles

```bash
docker compose logs -f liquidacionkiments   # logs
docker compose restart                      # reiniciar
docker compose down                         # detener
docker compose up -d                        # iniciar sin rebuild
```

## 5. Nginx (dominio + SSE del live)

El chat del live usa **Server-Sent Events** (`/api/tiktok-live`), por lo que Nginx
debe desactivar el buffering en esa ruta:

```nginx
server {
    listen 80;
    server_name live.tudominio.com;

    location / {
        proxy_pass http://127.0.0.1:3004;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/tiktok-live {
        proxy_pass http://127.0.0.1:3004;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Connection "";
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 24h;
    }
}
```

Luego `sudo nginx -t && sudo systemctl reload nginx`.

## 6. Alternativa: construir la imagen en tu PC y llevarla al VPS

Si el VPS no tiene memoria suficiente para compilar Next.js:

```bash
# En tu PC
docker build -t liquidacionkiments:latest .
docker save liquidacionkiments:latest | gzip > liquidacionkiments.tar.gz

# Copiar el archivo
scp liquidacionkiments.tar.gz usuario@IP_DEL_VPS:/ruta/proyectos/liquidacionkiments/

# En el VPS
cd /ruta/proyectos/liquidacionkiments
docker load < liquidacionkiments.tar.gz
docker compose up -d
```
