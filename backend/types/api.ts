// Format de réponse uniforme pour toutes les routes API
export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

// Types des entités
export type UserRole = 'user' | 'admin'

export type Statut =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'paid'

export type Categorie =
  | 'voiture'
  | 'moto'
  | 'train'
  | 'bus'
  | 'avion'
  | 'hotel'
  | 'repas'
  | 'autre'

export type User = {
  id: string
  nom: string
  prenom: string
  email: string
  role: UserRole
  created_at: string
}

export type Expense = {
  id: string
  report_id: string
  categorie: Categorie
  description: string
  montant: number
  montant_retenu: number
  justificatif_url?: string
  date_depense: string
  created_at: string
}

export type ExpenseReport = {
  id: string
  user_id?: string
  commission: string
  objet_action: string
  date_action: string
  ville_depart: string
  ville_arrivee: string
  montant_total: number
  statut: Statut
  compte_analytique?: string
  ligne_objectif?: string
  piece_comptable?: string
  commentaire?: string
  submitted_at?: string
  paid_at?: string
  created_at: string
  expenses: Expense[]
  user?: User
}