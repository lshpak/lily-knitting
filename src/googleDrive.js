import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID } from './driveConfig'

const SCOPES = 'https://www.googleapis.com/auth/drive.file'

let gapiLoaded = false
let gisLoaded = false
let tokenClient = null
let currentAccessToken = null

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

async function ensureGapiLoaded() {
  if (gapiLoaded) return
  await loadScript('https://apis.google.com/js/api.js')
  await new Promise((resolve) => {
    window.gapi.load('picker', resolve)
  })
  gapiLoaded = true
}

async function ensureGisLoaded() {
  if (gisLoaded) return
  await loadScript('https://accounts.google.com/gsi/client')
  gisLoaded = true
}

function getTokenClient() {
  if (tokenClient) return tokenClient
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: () => {},
  })
  return tokenClient
}

function requestAccessToken() {
  return new Promise((resolve, reject) => {
    const client = getTokenClient()
    client.callback = (response) => {
      if (response.error) {
        reject(new Error(response.error))
        return
      }
      currentAccessToken = response.access_token
      resolve(response.access_token)
    }
    client.error_callback = (err) => {
      reject(new Error(err.type || 'Auth failed'))
    }
    if (currentAccessToken) {
      client.requestAccessToken({ prompt: '' })
    } else {
      client.requestAccessToken({ prompt: 'consent' })
    }
  })
}

function showPicker(accessToken) {
  return new Promise((resolve) => {
    const view = new window.google.picker.PickerBuilder()
      .addView(
        new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
          .setMimeTypes('application/pdf')
          .setMode(window.google.picker.DocsViewMode.LIST)
      )
      .setOAuthToken(accessToken)
      .setDeveloperKey(GOOGLE_API_KEY)
      .setCallback((data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const doc = data.docs[0]
          resolve({
            driveFileId: doc.id,
            fileName: doc.name,
            mimeType: doc.mimeType,
          })
        } else if (data.action === window.google.picker.Action.CANCEL) {
          resolve(null)
        }
      })
      .setTitle('Choose a pattern PDF')
      .build()
    view.setVisible(true)
  })
}

export async function pickFromDrive() {
  if (!GOOGLE_API_KEY || !GOOGLE_CLIENT_ID) {
    throw new Error('Google API credentials not configured')
  }
  await Promise.all([ensureGapiLoaded(), ensureGisLoaded()])
  const token = await requestAccessToken()
  return showPicker(token)
}

export function getDrivePreviewUrl(fileId) {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`
}

export function isConfigured() {
  return Boolean(GOOGLE_API_KEY && GOOGLE_CLIENT_ID)
}
