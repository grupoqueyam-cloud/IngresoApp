function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const data = JSON.parse(e.postData.contents);

    const memberName = data.nombreCompleto || 'Sin nombre';
    const sheetName = sanitizeSheetName(data.hojaDestino || memberName);
    const fecha = data.fecha || '';
    const evento = data.evento || '';

    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['ID', 'Nombre Completo', 'Fecha', 'Hora', 'Evento', 'Estado', 'Timestamp ISO', 'Foto Base64']);
    }

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const values = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
      const duplicate = values.some(row => {
        const rowFecha = String(row[2] || '').trim();
        const rowEvento = String(row[4] || '').trim();
        return rowFecha === fecha && rowEvento === evento;
      });

      if (duplicate) {
        return ContentService
          .createTextOutput(JSON.stringify({
            success: false,
            message: 'Registro bloqueado: esta persona ya registró hoy este mismo evento.'
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    const id = new Date().getTime();

    sheet.appendRow([
      id,
      memberName,
      data.fecha || '',
      data.hora || '',
      data.evento || '',
      data.estado || '',
      data.timestampIso || '',
      data.fotoBase64 || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Registro guardado correctamente',
        hoja: sheetName
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sanitizeSheetName(name) {
  return String(name)
    .replace(/[\\/?*\[\]:]/g, '')
    .substring(0, 99)
    .trim();
}
