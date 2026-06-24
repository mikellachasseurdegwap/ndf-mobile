'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

function ResetContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const token        = searchParams.get('token') || ''

  const [password, setPassword]           = useState('')
  const [confirm, setConfirm]             = useState('')
  const [loading, setLoading]             = useState(false)
  const [success, setSuccess]             = useState(false)
  const [error, setError]                 = useState('')

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setLoading(true)
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => router.push('/login'), 3000)
      } else {
        setError(data.error || 'Erreur serveur')
      }
    } catch {
      setError('Erreur réseau, réessayez')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <p style={{ fontSize: '14px', color: '#dc2626', marginBottom: '16px' }}>Lien invalide ou expiré.</p>
        <Link href="/mot-de-passe-oublie" style={{ color: '#7a9420', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}>
          Demander un nouveau lien
        </Link>
      </div>
    )
  }

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #d8e4a8', padding: '32px', width: '100%', maxWidth: '400px' }}>

      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a2e0a', margin: 0 }}>Nouveau mot de passe</h1>
        <p style={{ fontSize: '13px', color: '#5a6e3a', marginTop: '4px', marginBottom: 0 }}>
          Choisissez un nouveau mot de passe pour votre compte.
        </p>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #A6C630, #B3D280)', borderRadius: '2px', marginTop: '14px' }} />
      </div>

      {success ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ width: '48px', height: '48px', background: '#A6C630', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '20px' }}>✓</div>
          <p style={{ fontSize: '14px', color: '#1a2e0a', fontWeight: '500', marginBottom: '6px' }}>Mot de passe mis à jour !</p>
          <p style={{ fontSize: '13px', color: '#5a6e3a' }}>Redirection vers la connexion...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: '#fef2f2', border: '0.5px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#5a6e3a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Minimum 8 caractères"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#A6C630')}
              onBlur={e => (e.target.style.borderColor = '#d8e4a8')}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#5a6e3a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              placeholder="••••••••"
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
            {loading ? 'Mise à jour...' : 'Enregistrer le nouveau mot de passe'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#5a6e3a' }}>
            <Link href="/mot-de-passe-oublie" style={{ color: '#7a9420', textDecoration: 'none' }}>
              Demander un nouveau lien
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}

export default function ReinitialiserMotDePasse() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, background: '#f4f8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <Suspense>
          <ResetContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
