# Biométrico Web para GitHub Pages

Proyecto en React + Vite para registrar:
- Ingreso
- Salida al almuerzo
- Regreso del almuerzo
- Salida a casa

Usa cámara del navegador y guarda los datos en Google Sheets por medio de Google Apps Script.

## 1. Crear la hoja en Google Sheets
Crea una hoja con el nombre exacto:

`Registros`

Usa estas columnas en la fila 1:

| ID | Nombre Completo | Fecha | Hora | Evento | Estado | Timestamp ISO | Foto Base64 |

## 2. Configurar Google Apps Script
1. Abre tu Google Sheet.
2. Ve a **Extensiones > Apps Script**.
3. Pega el contenido del archivo `google-apps-script.gs`.
4. Guarda el proyecto.
5. Ve a **Implementar > Nueva implementación**.
6. Tipo: **Aplicación web**.
7. Ejecutar como: **Tú mismo**.
8. Acceso: **Cualquier persona**.
9. Copia la URL que se genera.

## 3. Colocar la URL en React
Abre el archivo:

`src/App.jsx`

Busca esta línea:

```js
const APPS_SCRIPT_URL = 'PEGAR_AQUI_TU_URL_DE_APPS_SCRIPT'
```

Y reemplázala por tu URL real.

## 4. Cambiar usuario y nombre del repositorio
### package.json
Cambiar:
```json
"homepage": "https://TU_USUARIO.github.io/biometrico-web/"
```

### vite.config.js
Si tu repo tiene otro nombre, cambia:
```js
base: '/biometrico-web/'
```

Por el nombre real de tu repositorio.

## 5. Instalar y probar localmente
```bash
npm install
npm run dev
```

## 6. Publicar en GitHub Pages
```bash
npm run deploy
```

## 7. Importante
- La cámara requiere HTTPS.
- GitHub Pages funciona con HTTPS.
- Si pruebas localmente, acepta permisos del navegador.
- Si deseas más personas, edita el arreglo `teamMembers` en `src/App.jsx`.

## 8. Personalización
Puedes cambiar:
- nombres del personal
- colores
- horarios
- mensajes
- validaciones

## 9. Próximas mejoras posibles
- reconocimiento facial real
- evitar doble registro por evento
- panel administrativo
- historial diario
- exportación a Excel o PDF
