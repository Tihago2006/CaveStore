# Cave Store · página web

Página de Cave Store: planes de streaming, música y anime en Bolivia con pedido por WhatsApp.

## Qué tiene

- **Inicio con la tele que se enciende**: la TV del living se prende y va "cambiando de canal" mostrando cada plataforma con su precio.
- **Marquesina** de plataformas en movimiento.
- **Catálogo con filtros animados** y una luz roja que sigue al cursor en cada tarjeta.
- **Arma tu combo**: el cliente toca las plataformas que quiere y el botón le arma el mensaje de WhatsApp con su elección.
- **Pasos de compra** con una línea que se va llenando al bajar.
- Preguntas frecuentes, botón flotante de WhatsApp, menú para celular.
- Fuentes guardadas dentro del sitio (no depende de Google Fonts).

## Estructura

```
index.html
.htaccess              (caché para Hostinger)
assets/
  css/styles.css
  js/script.js         (configuración: número de WhatsApp, mensajes, canales de la tele)
  fonts/               (Big Shoulders Display y Manrope, licencia OFL)
  images/
```

## Cambiar el número de WhatsApp

En `assets/js/script.js`, al inicio:

```js
whatsappNumber: '59157360383', // 591 + tu número, sin + ni espacios
```

## Cambiar precios

- Tarjetas: en `index.html` busca `price-amount`.
- Tele del inicio: en `script.js`, lista `channels`.
- Arma tu combo: en `index.html`, atributo `data-price` de cada plataforma.

## Probar en tu PC

Doble clic en `index.html`, o con VS Code + Live Server.

## Publicar gratis con GitHub Pages

1. Sube estos archivos al repositorio (en la raíz, junto a `index.html`).
2. En GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**.
3. En 1–2 minutos tu página queda en `https://tihago2006.github.io/CaveStore/`.
