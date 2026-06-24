import { AuthSession, ExpenseReport, MobileExpensePayload } from '../types'

const REQUEST_TIMEOUT_MS = 15000

function normalizeApiBaseUrl(value?: string) {
  return value?.trim().replace(/\/+$/, '') || ''
}

const API_BASE_URL = normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL)

function assertApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error(
      'Configuration API manquante: ajoute EXPO_PUBLIC_API_BASE_URL dans .env puis relance Expo avec --clear.'
    )
  }

  if (/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(API_BASE_URL)) {
    throw new Error(
      `URL API invalide pour un téléphone physique: ${API_BASE_URL}. Utilise l'adresse IP du Mac, par exemple http://10.26.135.24:3000.`
    )
  }

  if (!/^https?:\/\//i.test(API_BASE_URL)) {
    throw new Error(`URL API invalide: ${API_BASE_URL}. Elle doit commencer par http:// ou https://.`)
  }
}

function describeNetworkFailure(error: unknown, url: string) {
  const detail = error instanceof Error ? error.message : String(error)

  if (API_BASE_URL.startsWith('http://')) {
    return `Impossible de joindre le backend (${url}). Vérifie que le téléphone est sur le même Wi-Fi que le Mac, que le backend est lancé avec -H 0.0.0.0 et que EXPO_PUBLIC_API_BASE_URL pointe vers l'IP du Mac. Détail: ${detail}`
  }

  return `Impossible de joindre le backend (${url}). Vérifie l'URL, le certificat HTTPS et la connexion réseau. Détail: ${detail}`
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    console.log('[API REQUEST]', options.method || 'GET', url)
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    console.log('[API RESPONSE]', response.status, url)
    return response
  } catch (error) {
    console.log('[API NETWORK ERROR]', url, error)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Délai dépassé: le backend ne répond pas après ${REQUEST_TIMEOUT_MS / 1000}s (${url}).`)
    }
    throw new Error(describeNetworkFailure(error, url))
  } finally {
    clearTimeout(timeout)
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  assertApiBaseUrl()
  const url = `${API_BASE_URL}${path}`
  const response = await fetchWithTimeout(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  let payload: ApiResponse<T> | null = null
  try {
    payload = await response.json() as ApiResponse<T>
  } catch {
    throw new Error(response.ok ? 'Réponse serveur invalide' : 'Erreur serveur')
  }

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error || 'Erreur serveur')
  }

  return payload.data
}

export function login(email: string, password: string) {
  return request<AuthSession>('/api/mobile/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function register(input: { nom: string; prenom: string; email: string; password: string }) {
  return request<AuthSession>('/api/mobile/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function forgotPassword(email: string) {
  assertApiBaseUrl()
  const url = `${API_BASE_URL}/api/auth/forgot-password`
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  let payload: ApiResponse<never> | null = null
  try {
    payload = await response.json() as ApiResponse<never>
  } catch {
    throw new Error(response.ok ? 'Réponse serveur invalide' : 'Erreur serveur')
  }

  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Erreur serveur')
  }

  return payload.message || 'Si cet email existe, un lien de réinitialisation a été envoyé.'
}

export function listReports(token: string) {
  return request<ExpenseReport[]>('/api/mobile/expenses', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function listAdminReports(token: string, statut = 'all') {
  const query = statut === 'all' ? '' : `?statut=${encodeURIComponent(statut)}`
  return request<ExpenseReport[]>(`/api/mobile/admin/expenses${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function updateAdminReport(
  token: string,
  reportId: string,
  input: {
    action: 'approve' | 'reject' | 'paid'
    commentaire?: string
  }
) {
  return request<{ statut: ExpenseReport['statut'] }>(`/api/mobile/admin/expenses/${reportId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  })
}

export function createReport(token: string | null, input: MobileExpensePayload) {
  return request<ExpenseReport>('/api/mobile/expenses', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(input),
  })
}

export function generatePdf(reportId: string) {
  return request<{ pdf_url: string }>(`/api/pdf/${reportId}`)
}

export async function uploadJustificatif(file: { uri: string; name: string; type: string }) {
  assertApiBaseUrl()
  const formData = new FormData()
  formData.append('file', file as unknown as Blob)

  const url = `${API_BASE_URL}/api/upload`
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    body: formData,
  })

  let payload: ApiResponse<{ url: string }> | null = null
  try {
    payload = await response.json() as ApiResponse<{ url: string }>
  } catch {
    throw new Error(response.ok ? 'Réponse serveur invalide' : 'Erreur serveur upload')
  }

  if (!response.ok || !payload.success || !payload.data?.url) {
    throw new Error(payload.error || 'Erreur serveur upload')
  }

  return payload.data.url
}
