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

  const payload = await response.json() as ApiResponse<T>
  if (!payload.success || !payload.data) {
    throw new Error(payload.error || 'Erreur API')
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

export function createReport(token: string, input: MobileExpensePayload) {
  return request<ExpenseReport>('/api/mobile/expenses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  })
}
