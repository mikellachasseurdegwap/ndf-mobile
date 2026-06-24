'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const ref     = searchParams.get('ref') || ''
  const montant = searchParams.get('montant') || '0'
  const email   = searchParams.get('email') || ''
  const prenom  = searchParams.get('prenom') || ''
  const nom     = searchParams.get('nom') || ''

  const [pdfUrl, setPdfUrl]         = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError]     = useState('')

  const [form, setForm] = useState({ prenom, nom, email, password: '' })
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError]     = useState('')

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '0.5px solid #d8e4a8',
    borderRadius: '8px',
    fontSize: '13px',
    background: '#f4f8e8',
    color: '#1a2e0a',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '500' as const,
    color: '#5a6e3a',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '6px',
  }

  async function handleDownloadPDF() {
    if (!ref) return
    setPdfLoading(true)
    setPdfError('')
    try {
      const res  = await fetch(`/api/pdf/${ref}`)
      const data = await res.json()
      if (data.success) {
        setPdfUrl(data.data.pdf_url)
      } else {
        setPdfError(data.error || 'Erreur lors de la génération du PDF')
      }
    } catch {
      setPdfError('Erreur réseau, réessayez')
    } finally {
      setPdfLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegisterLoading(true)
    setRegisterError('')
    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom: form.prenom,
          nom: form.nom,
          email: form.email,
          password: form.password,
          expense_report_id: ref,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setRegisterError(data.error || 'Erreur lors de l\'inscription')
        return
      }
      router.push('/dashboard')
    } catch {
      setRegisterError('Erreur serveur, réessayez')
    } finally {
      setRegisterLoading(false)
    }
  }

  if (!ref) {
    router.push('/')
    return null
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, background: '#f4f8e8', padding: '32px 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Succès */}
          <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #d8e4a8', padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ width: '52px', height: '52px', background: '#A6C630', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '22px' }}>✓</div>
            <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a2e0a', marginBottom: '6px' }}>Note de frais soumise !</h1>
            <p style={{ fontSize: '13px', color: '#5a6e3a', marginBottom: '16px' }}>Le trésorier a été notifié et traitera votre demande.</p>
            <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px', background: '#f4f8e8', border: '0.5px solid #d8e4a8', borderRadius: '8px', padding: '10px 20px' }}>
              <span style={{ fontSize: '10px', color: '#7a9420', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Référence</span>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#1a2e0a' }}>{ref}</span>
            </div>
            {Number(montant) > 0 && (
              <div style={{ marginTop: '12px', fontSize: '15px', color: '#1a2e0a' }}>
                Montant estimé : <strong>{Number(montant).toFixed(2)} €</strong>
              </div>
            )}
          </div>

          {/* PDF */}
          <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #d8e4a8', padding: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#7a9420', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Récapitulatif PDF</div>
            <p style={{ fontSize: '13px', color: '#5a6e3a', marginBottom: '14px' }}>Téléchargez le récapitulatif complet de votre note de frais.</p>

            {pdfError && (
              <div style={{ background: '#fef2f2', border: '0.5px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>
                {pdfError}
              </div>
            )}

            {pdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#A6C630', color: '#1a2e0a', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}
              >
                📄 Ouvrir le PDF
              </a>
            ) : (
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                style={{ background: pdfLoading ? '#B3D280' : '#A6C630', color: '#1a2e0a', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', border: 'none', cursor: pdfLoading ? 'not-allowed' : 'pointer' }}
              >
                {pdfLoading ? 'Génération...' : '📄 Générer et télécharger le PDF'}
              </button>
            )}
          </div>

          {/* Création de compte */}
          <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #d8e4a8', padding: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#7a9420', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Suivre votre remboursement</div>
            <p style={{ fontSize: '13px', color: '#5a6e3a', marginBottom: '18px' }}>Créez un compte pour accéder à votre espace membres et suivre l'état de votre remboursement en temps réel.</p>

            <form onSubmit={handleRegister}>
              {registerError && (
                <div style={{ background: '#fef2f2', border: '0.5px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                  {registerError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={labelStyle}>Prénom</label>
                  <input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} required placeholder="Jean" style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#A6C630')} onBlur={e => (e.target.style.borderColor = '#d8e4a8')} />
                </div>
                <div>
                  <label style={labelStyle}>Nom</label>
                  <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required placeholder="Dupont" style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#A6C630')} onBlur={e => (e.target.style.borderColor = '#d8e4a8')} />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="jean.dupont@exemple.com" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#A6C630')} onBlur={e => (e.target.style.borderColor = '#d8e4a8')} />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Mot de passe</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Minimum 8 caractères" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#A6C630')} onBlur={e => (e.target.style.borderColor = '#d8e4a8')} />
              </div>

              <button
                type="submit"
                disabled={registerLoading}
                style={{ width: '100%', background: registerLoading ? '#B3D280' : '#A6C630', color: '#1a2e0a', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', border: 'none', cursor: registerLoading ? 'not-allowed' : 'pointer' }}
              >
                {registerLoading ? 'Création...' : 'Créer mon compte'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '14px', paddingTop: '14px', borderTop: '0.5px solid #d8e4a8', fontSize: '13px', color: '#5a6e3a' }}>
              Déjà un compte ?{' '}
              <Link href="/login" style={{ color: '#7a9420', fontWeight: '500', textDecoration: 'none' }}>Se connecter</Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function Confirmation() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  )
}
