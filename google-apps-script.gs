function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Registros')
    if (!sheet) {
      throw new Error('No existe una hoja llamada Registros')
    }

    const data = JSON.parse(e.postData.contents)
    const id = new Date().getTime()

    sheet.appendRow([
      id,
      data.nombreCompleto || '',
      data.fecha || '',
      data.hora || '',
      data.evento || '',
      data.estado || '',
      data.timestampIso || '',
      data.fotoBase64 || ''
    ])

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Registro guardado correctamente'
      }))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}
