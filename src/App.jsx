import { useEffect, useRef, useState } from 'react'

const teamMembers = [
  'Edwin Ramos',
  'Belen Vilcacundo',
  'Sandra Chiluiza',
  'Andersson Sanchez',
  'Dani Muzo',
  'Kevin Aldas',
  'Pamela Sanchez',
  'Yamilet Zambrano',
  'Alexander Cardenas',
  'Paola Argüello',
  'Nolasco Ramirez',
  'Gabriela Castro',
  'Liliana Acurio',
  'Julio Garcia',
  'Daniel Rebelo',
  'Esteban Lopez'
]

const APPS_SCRIPT_URL = 'PEGAR_AQUI_TU_URL_DE_APPS_SCRIPT'

function App() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [selectedUser, setSelectedUser] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [lastLog, setLastLog] = useState(null)
  const [loading, setLoading] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState('')
  const [clock, setClock] = useState(new Date())

  useEffect(() => {
    startCamera()
    const timer = setInterval(() => setClock(new Date()), 1000)
    return () => {
      clearInterval(timer)
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error(err)
      setError('No se pudo acceder a la cámara. Verifica permisos del navegador y que el sitio esté en HTTPS.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return null

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const image = canvas.toDataURL('image/jpeg', 0.8)
    setPreviewPhoto(image)
    return image
  }

  const pad = (n) => String(n).padStart(2, '0')

  const formatDate = (date) => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  }

  const formatTime = (date) => {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  }

  const getMinutesNow = (date) => date.getHours() * 60 + date.getMinutes()

  const getStatusByEvent = (eventName, now) => {
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
        const expected = 13 * 60
        if (current < expected) return 'Salida anticipada a almuerzo'
        if (current === expected) return 'En horario'
        return 'Salida almuerzo registrada'
      }
      case 'Regreso del almuerzo': {
        const start = 15 * 60
        const max = 15 * 60 + 5
        if (current < start) return 'Anticipado'
        if (current <= max) return 'A tiempo'
        return 'Atrasado'
      }
      case 'Salida a casa': {
        const expected = 18 * 60
        if (current < expected) return 'Salida anticipada'
        if (current === expected) return 'En horario'
        return 'Salida registrada'
      }
      default:
        return 'Registrado'
    }
  }

  const registerEvent = async (eventName) => {
    setMessage('')
    setError('')

    if (!selectedUser) {
      setError('Debes seleccionar un miembro del equipo.')
      return
    }

    if (APPS_SCRIPT_URL === 'PEGAR_AQUI_TU_URL_DE_APPS_SCRIPT') {
      setError('Debes configurar la URL de Google Apps Script antes de registrar.')
      return
    }

    try {
      setLoading(true)
      const now = new Date()
      const photo = capturePhoto()
      const payload = {
        nombreCompleto: selectedUser,
        fecha: formatDate(now),
        hora: formatTime(now),
        evento: eventName,
        estado: getStatusByEvent(eventName, now),
        timestampIso: now.toISOString(),
        fotoBase64: photo || ''
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
        setMessage(`Registro exitoso: ${selectedUser} - ${eventName}`)
        setLastLog(payload)
      } else {
        setError(result.message || 'No se pudo registrar en Google Sheets.')
      }
    } catch (err) {
      console.error(err)
      setError('Error al enviar la información a Google Sheets.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <div className="card">
        <div className="header">
          <div>
            <h1>Control Biométrico de Asistencia</h1>
            <p className="subtitle">Ingreso, almuerzo y salida del personal</p>
          </div>
          <div className="clock-box">
            <span className="clock-label">Hora actual</span>
            <strong>{formatDate(clock)} {formatTime(clock)}</strong>
          </div>
        </div>

        <div className="schedule-box">
          <div><strong>Ingreso:</strong> 08:00 a 08:10</div>
          <div><strong>Salida almuerzo:</strong> 13:00</div>
          <div><strong>Regreso almuerzo:</strong> 15:00 a 15:05</div>
          <div><strong>Salida a casa:</strong> 18:00</div>
        </div>

        <div className="grid">
          <div className="camera-section">
            <video ref={videoRef} autoPlay playsInline muted className="camera" />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {previewPhoto && (
              <div className="preview-wrapper">
                <p className="preview-title">Última captura</p>
                <img src={previewPhoto} alt="Última captura" className="preview-image" />
              </div>
            )}
          </div>

          <div className="control-section">
            <label htmlFor="member">Miembro del equipo</label>
            <select
              id="member"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Seleccione una persona</option>
              {teamMembers.map((member) => (
                <option key={member} value={member}>
                  {member}
                </option>
              ))}
            </select>

            <div className="button-grid">
              <button onClick={() => registerEvent('Ingreso')} disabled={loading}>Ingreso</button>
              <button onClick={() => registerEvent('Salida al almuerzo')} disabled={loading}>Salida almuerzo</button>
              <button onClick={() => registerEvent('Regreso del almuerzo')} disabled={loading}>Regreso almuerzo</button>
              <button onClick={() => registerEvent('Salida a casa')} disabled={loading}>Salida a casa</button>
            </div>

            {message && <div className="alert success">{message}</div>}
            {error && <div className="alert error">{error}</div>}

            <div className="last-log-box">
              <h3>Último registro</h3>
              {lastLog ? (
                <div>
                  <p><strong>Persona:</strong> {lastLog.nombreCompleto}</p>
                  <p><strong>Fecha:</strong> {lastLog.fecha}</p>
                  <p><strong>Hora:</strong> {lastLog.hora}</p>
                  <p><strong>Evento:</strong> {lastLog.evento}</p>
                  <p><strong>Estado:</strong> {lastLog.estado}</p>
                </div>
              ) : (
                <p>No existe ningún registro todavía.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
