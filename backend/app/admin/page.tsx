'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'

interface Expense {
  id: string
  categorie: string
  description: string
  montant: string
  montant_retenu: string
  date_depense: string
  justificatif_url: string | null
  km?: number | null
}

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
  commentaire: string | null
  expenses: Expense[]
  user: {
    nom: string
    prenom: string
    email: string
  } | null
}

const CATEGORIE_LABELS: Record<string, string> = {
  voiture: 'Voiture',
  moto: 'Moto',
  train: 'Train',
  bus: 'Bus',
  avion: 'Avion',
  hotel: 'Hôtel',
  repas: 'Repas',
  autre: 'Autre',
}

function parseJustificatifs(url: string | null): string[] {
  if (!url) return []
  try {
    const parsed = JSON.parse(url)
    if (Array.isArray(parsed)) return parsed
  } catch {}
  return [url]
}

const STATUT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Brouillon',  color: '#5a6e3a', bg: '#e4f0b8' },
  submitted: { label: 'En attente', color: '#92400e', bg: '#fef3c7' },
  approved:  { label: 'Validée',    color: '#166534', bg: '#dcfce7' },
  rejected:  { label: 'Rejetée',    color: '#991b1b', bg: '#fee2e2' },
  paid:      { label: 'Remboursée', color: '#1e40af', bg: '#dbeafe' },
}

export default function Admin() {
  const [expenses, setExpenses] = useState<ExpenseReport[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filtre, setFiltre] = useState('all')
  const [commentaire, setCommentaire] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({})
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.success || data.data.role !== 'admin') {
          router.push('/')
        }
      })
      .catch(() => router.push('/'))

    loadExpenses()
  }, [router])

  function loadExpenses() {
    fetch('/api/admin/expenses')
      .then(res => res.json())
      .then(data => {
        if (data.success) setExpenses(data.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  async function handleAction(id: string, action: 'approve' | 'reject' | 'paid', comment?: string) {
    setActionLoading(id + action)
    try {
      const res = await fetch(`/api/admin/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          commentaire: comment || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        loadExpenses()
        setSelectedId(null)
        setCommentaire('')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  async function generatePDF(id: string) {
    setActionLoading(id + 'pdf')
    setPdfError(null)
    try {
      const res = await fetch(`/api/pdf/${id}`)
      const data = await res.json()
      if (data.success) {
        setPdfUrls(prev => ({ ...prev, [id]: data.data.pdf_url }))
      } else {
        setPdfError(data.error || 'Erreur lors de la génération du PDF')
      }
    } catch {
      setPdfError('Erreur réseau, réessayez')
    } finally {
      setActionLoading(null)
    }
  }

  const expensesFiltrees = filtre === 'all'
    ? expenses
    : expenses.filter(e => e.statut === filtre)

  const btnStyle = (color: string, bg: string) => ({
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500' as const,
    border: 'none',
    cursor: 'pointer',
    background: bg,
    color: color,
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, background: '#f4f8e8', padding: '32px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Titre */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#1a2e0a', margin: 0 }}>
              Administration — Notes de frais
            </h1>
            <p style={{ fontSize: '13px', color: '#5a6e3a', marginTop: '4px' }}>
              Gérez les remboursements des membres FFS/EFS
            </p>
          </div>

          {/* Filtres */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {[
              { val: 'all', label: 'Toutes' },
              { val: 'submitted', label: 'En attente' },
              { val: 'approved', label: 'Validées' },
              { val: 'rejected', label: 'Rejetées' },
              { val: 'paid', label: 'Remboursées' },
            ].map(f => (
              <button
                key={f.val}
                onClick={() => setFiltre(f.val)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  border: '0.5px solid #d8e4a8',
                  cursor: 'pointer',
                  background: filtre === f.val ? '#A6C630' : 'white',
                  color: filtre === f.val ? '#1a2e0a' : '#5a6e3a',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Erreur PDF */}
          {pdfError && (
            <div style={{ background: '#fef2f2', border: '0.5px solid #fca5a5', color: '#dc2626', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Erreur PDF : {pdfError}</span>
              <button onClick={() => setPdfError(null)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}>×</button>
            </div>
          )}

          {/* Liste */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#5a6e3a' }}>Chargement...</div>
          ) : expensesFiltrees.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #d8e4a8', padding: '60px', textAlign: 'center' }}>
              <p style={{ color: '#5a6e3a', fontSize: '14px' }}>Aucune note de frais trouvée</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {expensesFiltrees.map(expense => {
                const statut = STATUT_LABELS[expense.statut] || { label: expense.statut, color: '#5a6e3a', bg: '#e4f0b8' }
                return (
                  <div key={expense.id} style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #d8e4a8', padding: '20px 24px' }}>

                    {/* Header carte */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '500', color: '#1a2e0a', marginBottom: '4px' }}>
                          {expense.objet_action}
                        </div>
                        <div style={{ fontSize: '12px', color: '#5a6e3a' }}>
                          {expense.user
                            ? `${expense.user.prenom} ${expense.user.nom} — ${expense.user.email}`
                            : 'Membre non connecté'
                          }
                        </div>
                        <div style={{ fontSize: '12px', color: '#5a6e3a', marginTop: '2px' }}>
                          {expense.commission} — {expense.ville_depart} → {expense.ville_arrivee}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '20px', fontWeight: '500', color: '#1a2e0a', marginBottom: '6px' }}>
                          {Number(expense.montant_total).toFixed(2)} €
                        </div>
                        <span style={{ background: statut.bg, color: statut.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>
                          {statut.label}
                        </span>
                      </div>
                    </div>

                    {/* Date */}
                    <div style={{ fontSize: '12px', color: '#7a9420', marginBottom: '12px' }}>
                      Action du {new Date(expense.date_action).toLocaleDateString('fr-FR')}
                      {expense.submitted_at && ` — Soumise le ${new Date(expense.submitted_at).toLocaleDateString('fr-FR')}`}
                    </div>

                    {/* Bouton détail */}
                    <button
                      onClick={() => setExpandedId(expandedId === expense.id ? null : expense.id)}
                      style={{ background: 'none', border: '0.5px solid #d8e4a8', borderRadius: '6px', padding: '5px 14px', fontSize: '12px', color: '#5a6e3a', cursor: 'pointer', marginBottom: '12px' }}
                    >
                      {expandedId === expense.id ? '▲ Masquer le détail' : '▼ Voir le détail'}
                    </button>

                    {/* Panneau de détail */}
                    {expandedId === expense.id && (
                      <div style={{ background: '#f4f8e8', borderRadius: '10px', border: '0.5px solid #d8e4a8', padding: '16px', marginBottom: '12px' }}>

                        {/* Section membre */}
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ fontSize: '11px', fontWeight: '500', color: '#7a9420', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                            Informations du membre
                          </div>
                          <div style={{ background: 'white', borderRadius: '8px', border: '0.5px solid #d8e4a8', padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                              <div style={{ fontSize: '10px', color: '#7a9420', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Nom complet</div>
                              <div style={{ fontSize: '13px', color: '#1a2e0a' }}>
                                {expense.user ? `${expense.user.prenom} ${expense.user.nom}` : <span style={{ color: '#92400e', fontStyle: 'italic' }}>Soumission anonyme</span>}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '10px', color: '#7a9420', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Email</div>
                              <div style={{ fontSize: '13px', color: '#1a2e0a' }}>
                                {expense.user ? expense.user.email : '—'}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '10px', color: '#7a9420', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Commission</div>
                              <div style={{ fontSize: '13px', color: '#1a2e0a' }}>{expense.commission}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '10px', color: '#7a9420', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Date de soumission</div>
                              <div style={{ fontSize: '13px', color: '#1a2e0a' }}>
                                {expense.submitted_at ? new Date(expense.submitted_at).toLocaleDateString('fr-FR') : '—'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section action */}
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ fontSize: '11px', fontWeight: '500', color: '#7a9420', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                            Informations de l'action
                          </div>
                          <div style={{ background: 'white', borderRadius: '8px', border: '0.5px solid #d8e4a8', padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                              <div style={{ fontSize: '10px', color: '#7a9420', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Objet / Action</div>
                              <div style={{ fontSize: '13px', color: '#1a2e0a', fontWeight: '500' }}>{expense.objet_action}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '10px', color: '#7a9420', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Date de l'action</div>
                              <div style={{ fontSize: '13px', color: '#1a2e0a' }}>{new Date(expense.date_action).toLocaleDateString('fr-FR')}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '10px', color: '#7a9420', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Trajet</div>
                              <div style={{ fontSize: '13px', color: '#1a2e0a' }}>{expense.ville_depart} → {expense.ville_arrivee}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '10px', color: '#7a9420', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Montant total retenu</div>
                              <div style={{ fontSize: '15px', fontWeight: '500', color: '#1a2e0a' }}>{Number(expense.montant_total).toFixed(2)} €</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '10px', color: '#7a9420', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Statut</div>
                              <span style={{ background: statut.bg, color: statut.color, padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>
                                {statut.label}
                              </span>
                            </div>
                            {expense.commentaire && (
                              <div style={{ gridColumn: '1 / -1' }}>
                                <div style={{ fontSize: '10px', color: '#7a9420', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Commentaire trésorier</div>
                                <div style={{ fontSize: '13px', color: '#92400e', background: '#fef3c7', padding: '6px 10px', borderRadius: '6px' }}>{expense.commentaire}</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Section dépenses */}
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '500', color: '#7a9420', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                            Dépenses ({expense.expenses.length})
                          </div>

                          {expense.expenses.map((dep) => {
                            const justifs = parseJustificatifs(dep.justificatif_url)
                            const isKm = dep.categorie === 'voiture' || dep.categorie === 'moto'
                            return (
                              <div key={dep.id} style={{ background: 'white', borderRadius: '8px', border: '0.5px solid #d8e4a8', padding: '12px 16px', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                  <div>
                                    <span style={{ background: '#e4f0b8', color: '#4a5c14', fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px', marginRight: '8px' }}>
                                      {CATEGORIE_LABELS[dep.categorie] || dep.categorie}
                                    </span>
                                    <span style={{ fontSize: '13px', color: '#1a2e0a', fontWeight: '500' }}>{dep.description}</span>
                                  </div>
                                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a2e0a' }}>{Number(dep.montant_retenu).toFixed(2)} €</div>
                                    {Number(dep.montant) !== Number(dep.montant_retenu) && (
                                      <div style={{ fontSize: '11px', color: '#92400e', textDecoration: 'line-through' }}>{Number(dep.montant).toFixed(2)} € (plafonné)</div>
                                    )}
                                  </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px', color: '#5a6e3a', marginBottom: justifs.length ? '8px' : 0 }}>
                                  <div><span style={{ color: '#7a9420' }}>Date : </span>{new Date(dep.date_depense).toLocaleDateString('fr-FR')}</div>
                                  {isKm && dep.km && <div><span style={{ color: '#7a9420' }}>Kilométrage : </span>{dep.km} km</div>}
                                  <div><span style={{ color: '#7a9420' }}>Montant déclaré : </span>{Number(dep.montant).toFixed(2)} €</div>
                                  <div><span style={{ color: '#7a9420' }}>Montant retenu : </span>{Number(dep.montant_retenu).toFixed(2)} €</div>
                                </div>

                                {justifs.length > 0 && (
                                  <div>
                                    <div style={{ fontSize: '10px', color: '#7a9420', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Justificatifs</div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                      {justifs.map((url, ji) => {
                                        const isPdf = url.toLowerCase().endsWith('.pdf')
                                        return isPdf ? (
                                          <a key={ji} href={url} target="_blank" rel="noreferrer"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e4f0b8', border: '0.5px solid #A6C630', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', color: '#4a5c14', textDecoration: 'none' }}>
                                            📄 {justifs.length > 1 ? `Justificatif ${ji + 1}` : 'Justificatif'}
                                          </a>
                                        ) : (
                                          <a key={ji} href={url} target="_blank" rel="noreferrer"
                                            style={{ display: 'block', borderRadius: '6px', overflow: 'hidden', border: '0.5px solid #d8e4a8' }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={url} alt={`Justificatif ${ji + 1}`}
                                              style={{ width: '80px', height: '80px', objectFit: 'cover', display: 'block' }} />
                                          </a>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}
                                {justifs.length === 0 && (
                                  <div style={{ fontSize: '11px', color: '#92400e' }}>Aucun justificatif joint</div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Commentaire rejet */}
                    {selectedId === expense.id && (
                      <div style={{ marginBottom: '12px' }}>
                        <input
                          value={commentaire}
                          onChange={e => setCommentaire(e.target.value)}
                          placeholder="Motif du rejet (obligatoire)"
                          style={{ width: '100%', padding: '10px 12px', border: '0.5px solid #fca5a5', borderRadius: '8px', fontSize: '13px', background: '#fef2f2', outline: 'none' }}
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '0.5px solid #d8e4a8', paddingTop: '14px' }}>

                      {expense.statut === 'submitted' && (
                        <>
                          <button
                            onClick={() => handleAction(expense.id, 'approve')}
                            disabled={actionLoading === expense.id + 'approve'}
                            style={btnStyle('#166534', '#dcfce7')}
                          >
                            {actionLoading === expense.id + 'approve' ? '...' : '✓ Valider'}
                          </button>

                          {selectedId === expense.id ? (
                            <button
                              onClick={() => {
                                if (!commentaire.trim()) return
                                handleAction(expense.id, 'reject', commentaire)
                              }}
                              style={btnStyle('#991b1b', '#fee2e2')}
                            >
                              Confirmer le rejet
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedId(expense.id)}
                              style={btnStyle('#991b1b', '#fee2e2')}
                            >
                              ✗ Rejeter
                            </button>
                          )}
                        </>
                      )}

                      {expense.statut === 'approved' && (
                        <button
                          onClick={() => handleAction(expense.id, 'paid')}
                          disabled={actionLoading === expense.id + 'paid'}
                          style={btnStyle('#1e40af', '#dbeafe')}
                        >
                          {actionLoading === expense.id + 'paid' ? '...' : '€ Marquer payé'}
                        </button>
                      )}

                      <button
                        onClick={() => generatePDF(expense.id)}
                        disabled={actionLoading === expense.id + 'pdf'}
                        style={btnStyle('#4a5c14', '#e4f0b8')}
                      >
                        {actionLoading === expense.id + 'pdf' ? 'Génération...' : '📄 Générer PDF'}
                      </button>

                      {pdfUrls[expense.id] && (
                        <a
                          href={pdfUrls[expense.id]}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', background: '#dbeafe', color: '#1e40af', textDecoration: 'none', border: '0.5px solid #93c5fd' }}
                        >
                          ↗ Ouvrir le PDF
                        </a>
                      )}

                    </div>
                  </div>
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