'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'

interface ExpenseReport {
  id: string
  commission: string
  objet_action: string
  date_action: string
  ville_depart: string
  ville_arrivee: string
  montant_total: string
  statut: string
  submitted_at: string
}

const STATUT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Brouillon',  color: '#5a6e3a', bg: '#e4f0b8' },
  submitted: { label: 'En attente', color: '#92400e', bg: '#fef3c7' },
  approved:  { label: 'Validée',    color: '#166534', bg: '#dcfce7' },
  rejected:  { label: 'Rejetée',    color: '#991b1b', bg: '#fee2e2' },
  paid:      { label: 'Remboursée', color: '#1e40af', bg: '#dbeafe' },
}

export default function Dashboard() {
  const [expenses, setExpenses] = useState<ExpenseReport[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          router.push('/login')
          return
        }
        setUser(data.data)
      })
      .catch(() => router.push('/login'))

    fetch('/api/expenses')
      .then(res => res.json())
      .then(data => {
        if (data.success) setExpenses(data.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, background: '#f4f8e8', padding: '32px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* Titre */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#1a2e0a', margin: 0 }}>
                Mes notes de frais
              </h1>
              {user && (
                <p style={{ fontSize: '13px', color: '#5a6e3a', marginTop: '4px' }}>
                  Bonjour {user.prenom} {user.nom}
                </p>
              )}
            </div>
            <Link
              href="/nouvelle-ndf"
              style={{ background: '#A6C630', color: '#1a2e0a', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}
            >
              + Nouvelle NDF
            </Link>
          </div>

          {/* Contenu */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#5a6e3a', fontSize: '14px' }}>
              Chargement...
            </div>
          ) : expenses.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #d8e4a8', padding: '60px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: '16px', color: '#5a6e3a', marginBottom: '20px' }}>
                Vous n'avez pas encore de note de frais
              </p>
              <Link
                href="/nouvelle-ndf"
                style={{ background: '#A6C630', color: '#1a2e0a', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}
              >
                Créer ma première NDF
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {expenses.map(expense => {
                const statut = STATUT_LABELS[expense.statut] || { label: expense.statut, color: '#5a6e3a', bg: '#e4f0b8' }
                return (
                  <Link
                    key={expense.id}
                    href={`/ndf/${expense.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #d8e4a8', padding: '20px 24px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '500', color: '#1a2e0a', marginBottom: '4px' }}>
                            {expense.objet_action}
                          </div>
                          <div style={{ fontSize: '12px', color: '#5a6e3a' }}>
                            {expense.commission} — {expense.ville_depart} → {expense.ville_arrivee}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '18px', fontWeight: '500', color: '#1a2e0a', marginBottom: '6px' }}>
                            {Number(expense.montant_total).toFixed(2)} €
                          </div>
                          <span style={{ background: statut.bg, color: statut.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>
                            {statut.label}
                          </span>
                        </div>
                      </div>
                      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '0.5px solid #d8e4a8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#7a9420' }}>
                          {new Date(expense.date_action).toLocaleDateString('fr-FR')}
                        </span>
                        <span style={{ fontSize: '12px', color: '#A6C630', fontWeight: '500' }}>
                          Voir le détail →
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}