export type User = {
  id: string
  nom: string
  prenom: string
  email: string
  role: 'user' | 'admin'
}

export type AuthSession = {
  token: string
  user: User
}

export type ExpenseReport = {
  id: string
  commission: string
  objet_action: string
  date_action: string
  ville_depart?: string
  ville_arrivee?: string
  montant_total: string | number
  statut: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid'
  created_at: string
  submitted_at?: string | null
  commentaire?: string | null
  commentaire_tresorier?: string | null
  user?: Pick<User, 'id' | 'nom' | 'prenom' | 'email'> | null
  expenses?: Array<{
    id: string
    categorie: string
    description: string
    montant: string | number
    montant_retenu?: string | number
    justificatif_url?: string | null
    date_depense: string
  }>
}

export type MobileExpensePayload = {
  nom?: string
  prenom?: string
  email?: string
  commission: string
  objet_action: string
  date_action: string
  ville_depart: string
  ville_arrivee: string
  expenses: Array<{
    categorie: 'voiture' | 'moto' | 'train' | 'bus' | 'avion' | 'hotel' | 'repas' | 'autre'
    description: string
    montant: number
    date_depense: string
    km?: number
    justificatif_urls?: string[]
  }>
}
