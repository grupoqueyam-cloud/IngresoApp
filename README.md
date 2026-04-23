# Biométrico Web en JavaScript puro - Versión por persona

Esta versión incluye dos mejoras principales:

1. Cada persona guarda sus registros en una hoja independiente dentro del mismo Google Sheets.
2. Cada persona solo puede marcar una vez por día cada evento:
   - Ingreso
   - Salida al almuerzo
   - Regreso del almuerzo
   - Salida a casa

## Archivos a subir a GitHub Pages
- index.html
- styles.css
- app.js

## Google Sheets
No necesitas crear previamente una hoja por persona.
El Apps Script las crea automáticamente cuando detecta un nuevo nombre.

## Estructura de cada hoja individual
Cada hoja personal tendrá estas columnas:

| ID | Nombre Completo | Fecha | Hora | Evento | Estado | Timestamp ISO | Foto Base64 |

## Configuración rápida

### 1. Crear una hoja de cálculo vacía
Solo necesitas crear el archivo Google Sheets.

### 2. Configurar Apps Script
1. En la hoja ve a **Extensiones > Apps Script**
2. Pega el contenido de `google-apps-script.gs`
3. Guarda
4. Ve a **Implementar > Nueva implementación**
5. Elige **Aplicación web**
6. Acceso: **Cualquier persona**
7. Copia la URL terminada en `/exec`

### 3. Pegar la URL en la página
Abre `app.js` y cambia:

```js
const APPS_SCRIPT_URL = 'PEGAR_AQUI_TU_URL_DE_APPS_SCRIPT'
```

por la URL real.

### 4. Publicar en GitHub Pages
Sube estos archivos al repositorio y activa GitHub Pages.

## Cómo funciona el control de duplicados
El control se hace en dos niveles:

### Nivel 1: navegador
La página guarda en `localStorage` los eventos del día para bloquear repeticiones rápidas.

### Nivel 2: Google Sheets / Apps Script
Antes de guardar, el script revisa la hoja individual de la persona.
Si en la misma fecha ya existe el mismo evento, lo rechaza.

Esto evita que una persona marque dos veces el mismo tipo de evento el mismo día.

## Importante
La cámara funcionará bien cuando el sitio esté publicado en HTTPS.
GitHub Pages usa HTTPS.
