'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Identifiants incorrects')
        return
      }

      if (data.data.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Erreur serveur, réessayez')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, background: '#f4f8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #d8e4a8', padding: '32px', width: '100%', maxWidth: '400px' }}>

          <div style={{ marginBottom: '22px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a2e0a', margin: 0 }}>Connexion</h1>
            <p style={{ fontSize: '13px', color: '#5a6e3a', marginTop: '4px', marginBottom: 0 }}>Accédez à votre espace membres FFS/EFS</p>
            <div style={{ height: '2px', background: 'linear-gradient(90deg, #A6C630, #B3D280)', borderRadius: '2px', marginTop: '14px' }}></div>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: '#fef2f2', border: '0.5px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#5a6e3a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                style={{ width: '100%', padding: '10px 12px', border: '0.5px solid #d8e4a8', borderRadius: '8px', fontSize: '13px', background: '#f4f8e8', color: '#1a2e0a', outline: 'none' }}
                onFocus={e => (e.target.style.borderColor = '#A6C630')}
                onBlur={e => (e.target.style.borderColor = '#d8e4a8')}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#5a6e3a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 12px', border: '0.5px solid #d8e4a8', borderRadius: '8px', fontSize: '13px', background: '#f4f8e8', color: '#1a2e0a', outline: 'none' }}
                onFocus={e => (e.target.style.borderColor = '#A6C630')}
                onBlur={e => (e.target.style.borderColor = '#d8e4a8')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', background: loading ? '#B3D280' : '#A6C630', color: '#1a2e0a', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '18px', paddingTop: '16px', borderTop: '0.5px solid #d8e4a8', fontSize: '13px', color: '#5a6e3a', lineHeight: '2' }}>
            <Link href="/mot-de-passe-oublie" style={{ color: '#7a9420', textDecoration: 'none' }}>Mot de passe oublié ?</Link>
            <br />
            Pas encore de compte ?{' '}
            <Link href="/register" style={{ color: '#7a9420', fontWeight: '500', textDecoration: 'none' }}>S&apos;inscrire</Link>
            <br />
            <Link href="/nouvelle-ndf" style={{ color: '#7a9420', textDecoration: 'none' }}>Accès sans compte → Nouvelle NDF</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}