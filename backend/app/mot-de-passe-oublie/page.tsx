'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function MotDePasseOublie() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || 'Erreur serveur')
      }
    } catch {
      setError('Erreur réseau, réessayez')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '0.5px solid #d8e4a8',
    borderRadius: '8px',
    fontSize: '13px',
    background: '#f4f8e8',
    color: '#1a2e0a',
    outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, background: '#f4f8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #d8e4a8', padding: '32px', width: '100%', maxWidth: '400px' }}>

          <div style={{ marginBottom: '22px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a2e0a', margin: 0 }}>Mot de passe oublié</h1>
            <p style={{ fontSize: '13px', color: '#5a6e3a', marginTop: '4px', marginBottom: 0 }}>
              Renseignez votre email pour recevoir un lien de réinitialisation.
            </p>
            <div style={{ height: '2px', background: 'linear-gradient(90deg, #A6C630, #B3D280)', borderRadius: '2px', marginTop: '14px' }} />
          </div>

          {success ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: '48px', height: '48px', background: '#A6C630', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '20px' }}>✓</div>
              <p style={{ fontSize: '14px', color: '#1a2e0a', fontWeight: '500', marginBottom: '6px' }}>Email envoyé !</p>
              <p style={{ fontSize: '13px', color: '#5a6e3a', marginBottom: '20px' }}>
                Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien valable 1 heure.
              </p>
              <Link href="/login" style={{ color: '#7a9420', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}>
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ background: '#fef2f2', border: '0.5px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#5a6e3a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#A6C630')}
                  onBlur={e => (e.target.style.borderColor = '#d8e4a8')}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', background: loading ? '#B3D280' : '#A6C630', color: '#1a2e0a', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#5a6e3a' }}>
                <Link href="/login" style={{ color: '#7a9420', fontWeight: '500', textDecoration: 'none' }}>
                  ← Retour à la connexion
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
