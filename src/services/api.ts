import { AuthSession, ExpenseReport, MobileExpensePayload } from '../types'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000'

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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

export function listReports(token: string) {
  return request<ExpenseReport[]>('/api/mobile/expenses', {
    headers: { Authorization: `Bearer ${token}` },
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
  const formData = new FormData()
  formData.append('file', file as unknown as Blob)

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
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
