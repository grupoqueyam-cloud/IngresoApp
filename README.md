# Biométrico Web en JavaScript puro

Esta versión no usa React ni build.

Solo necesitas subir estos archivos a GitHub Pages:
- index.html
- styles.css
- app.js

## Qué hace
- usa cámara web
- selector de personal
- 4 botones de registro
- guarda en Google Sheets por Apps Script
- muestra último registro
- guarda último registro también en localStorage

## Configuración rápida

### 1. Crear la hoja de Google Sheets
Crea una hoja llamada:

`Registros`

Y agrega estas columnas:

| ID | Nombre Completo | Fecha | Hora | Evento | Estado | Timestamp ISO | Foto Base64 |

### 2. Configurar Apps Script
1. En tu hoja ve a **Extensiones > Apps Script**
2. Pega el contenido de `google-apps-script.gs`
3. Guarda
4. Ve a **Implementar > Nueva implementación**
5. Elige **Aplicación web**
6. Acceso: **Cualquier persona**
7. Copia la URL terminada en `/exec`

### 3. Pegar la URL
Abre `app.js` y cambia:

```js
const APPS_SCRIPT_URL = 'PEGAR_AQUI_TU_URL_DE_APPS_SCRIPT'
```

por la URL real.

### 4. Publicar en GitHub Pages
Sube estos archivos al repositorio:
- index.html
- styles.css
- app.js

Luego activa GitHub Pages.

## Ventajas de esta versión
- no requiere npm
- no requiere build
- no requiere Visual Studio Code para compilar
- funciona como sitio estático

## Nota importante
La cámara solo funcionará bien cuando el sitio esté publicado en HTTPS.
GitHub Pages usa HTTPS, por lo que está bien para este proyecto.
