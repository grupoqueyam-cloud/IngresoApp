const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw4w0DHTxC9odT1QrrjaEJjJPxKGDyVSD8gZK4aD1Y5oUnhzuTRKyhbkmfKWpU7mBCMGQ/exec'

const teamMembers = [
  'Kevin Aldas',
  'Sandra Chiluiza',
  'Vanessa Duran',
  'Daniel Guizado',
  'Keyla Lara',
  'Jose Ojeda',
  'Fernando Ortiz',
  'Edwin Ramos',
  'Yajaira Ruiz',
  'Andersson Sanchez',
  'Pamela Sanchez',
  'Belen Vilcacundo'
]

const video = document.getElementById('video')
const canvas = document.getElementById('canvas')
const memberSelect = document.getElementById('memberSelect')
const messageBox = document.getElementById('messageBox')
const lastLogContent = document.getElementById('lastLogContent')
const previewWrapper = document.getElementById('previewWrapper')
const previewImage = document.getElementById('previewImage')
const clockText = document.getElementById('clockText')
const buttons = document.querySelectorAll('button[data-event]')

function pad(n) {
  return String(n).padStart(2, '0')
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatTime(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function getMinutesNow(date) {
  return date.getHours() * 60 + date.getMinutes()
}

function getStatusByEvent(eventName, now) {
  const current = getMinutesNow(now)

  switch (eventName) {
    case 'Ingreso': {
      const start = 8 * 60
      const max = 8 * 60 + 10
      if (current < start) return 'Anticipado'
      if (current <= max) return 'A tiempo'
      return 'Atrasado'
    }
    case 'Salida al almuerzo': {
      const expected = 13 * 60 + 10
      if (current < expected) return 'Salida anticipada a almuerzo'
      if (current === expected) return 'En horario'
      return 'Salida almuerzo registrada'
    }
    case 'Regreso del almuerzo': {
      const start = 15 * 60
      const max = 15 * 60 + 10
      if (current < start) return 'Anticipado'
      if (current <= max) return 'A tiempo'
      return 'Atrasado'
    }
    case 'Salida a casa': {
      const expected = 18 * 60 + 10
      if (current < expected) return 'Salida anticipada'
      if (current === expected) return 'En horario'
      return 'Salida registrada'
    }
    default:
      return 'Registrado'
  }
}

function showMessage(text, type) {
  messageBox.innerHTML = `<div class="alert ${type}">${text}</div>`
}

function loadMembers() {
  teamMembers.forEach(member => {
    const option = document.createElement('option')
    option.value = member
    option.textContent = member
    memberSelect.appendChild(option)
  })
}

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      },
      audio: false
    })

    video.srcObject = stream
  } catch (err) {
    console.error(err)
    showMessage('No se pudo acceder a la cámara. Verifica permisos y que el sitio esté publicado en HTTPS.', 'error')
  }
}

function capturePhoto() {
  canvas.width = video.videoWidth || 640
  canvas.height = video.videoHeight || 480
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  const image = canvas.toDataURL('image/jpeg', 0.8)
  previewImage.src = image
  previewWrapper.classList.remove('hidden')
  return image
}

function setButtonsDisabled(disabled) {
  buttons.forEach(btn => {
    btn.disabled = disabled
  })
}

function updateLastLog(payload) {
  lastLogContent.innerHTML = `
    <p><strong>Persona:</strong> ${payload.nombreCompleto}</p>
    <p><strong>Hoja:</strong> ${payload.hojaDestino || sanitizeSheetName(payload.nombreCompleto)}</p>
    <p><strong>Fecha:</strong> ${payload.fecha}</p>
    <p><strong>Hora:</strong> ${payload.hora}</p>
    <p><strong>Evento:</strong> ${payload.evento}</p>
    <p><strong>Estado:</strong> ${payload.estado}</p>
  `
}

function updateClock() {
  const now = new Date()
  clockText.textContent = `${formatDate(now)} ${formatTime(now)}`
}

function sanitizeSheetName(name) {
  return name
    .replace(/[\\/?*\[\]:]/g, '')
    .substring(0, 99)
    .trim()
}

function getDailyLocalKey(member, date) {
  return `biometric-control-${member}-${date}`
}

function getDailyLocalEvents(member, date) {
  const data = localStorage.getItem(getDailyLocalKey(member, date))
  if (!data) return {}

  try {
    return JSON.parse(data)
  } catch {
    return {}
  }
}

function saveDailyLocalEvent(member, date, eventName, payload) {
  const current = getDailyLocalEvents(member, date)
  current[eventName] = payload
  localStorage.setItem(getDailyLocalKey(member, date), JSON.stringify(current))
}

function isDuplicateLocal(member, date, eventName) {
  const current = getDailyLocalEvents(member, date)
  return Boolean(current[eventName])
}

async function registerEvent(eventName) {
  messageBox.innerHTML = ''

  if (!memberSelect.value) {
    showMessage('Debes seleccionar un miembro del equipo.', 'error')
    return
  }

  if (APPS_SCRIPT_URL === 'PEGAR_AQUI_TU_URL_DE_APPS_SCRIPT') {
    showMessage('Debes configurar la URL de Google Apps Script en app.js antes de registrar.', 'error')
    return
  }

  const now = new Date()
  const today = formatDate(now)
  const member = memberSelect.value

  if (isDuplicateLocal(member, today, eventName)) {
    showMessage(`Control bloqueado: ${member} ya registró hoy el evento "${eventName}".`, 'error')
    return
  }

  try {
    setButtonsDisabled(true)

    const payload = {
      nombreCompleto: member,
      hojaDestino: sanitizeSheetName(member),
      fecha: today,
      hora: formatTime(now),
      evento: eventName,
      estado: getStatusByEvent(eventName, now),
      timestampIso: now.toISOString(),
      fotoBase64: capturePhoto()
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (result.success) {
      showMessage(`Registro exitoso: ${payload.nombreCompleto} - ${payload.evento} - Hoja: ${payload.hojaDestino}`, 'success')
      updateLastLog(payload)
      localStorage.setItem('lastBiometricLog', JSON.stringify(payload))
      saveDailyLocalEvent(member, today, eventName, payload)
    } else {
      showMessage(result.message || 'No se pudo registrar en Google Sheets.', 'error')
    }
  } catch (error) {
    console.error(error)
    showMessage('Error al enviar la información a Google Sheets.', 'error')
  } finally {
    setButtonsDisabled(false)
  }
}

function loadLastLog() {
  const saved = localStorage.getItem('lastBiometricLog')
  if (!saved) return

  try {
    const payload = JSON.parse(saved)
    updateLastLog(payload)
  } catch (e) {
    console.error(e)
  }
}

buttons.forEach(button => {
  button.addEventListener('click', () => {
    registerEvent(button.dataset.event)
  })
})

loadMembers()
loadLastLog()
updateClock()
setInterval(updateClock, 1000)
startCamera()
