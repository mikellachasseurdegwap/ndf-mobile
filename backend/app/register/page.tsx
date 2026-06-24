'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: form.nom, prenom: form.prenom, email: form.email, password: form.password }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || "Erreur lors de l'inscription")
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Erreur serveur, réessayez')
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
    outline: 'none'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '500' as const,
    color: '#5a6e3a',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '6px'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, background: '#f4f8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #d8e4a8', padding: '32px', width: '100%', maxWidth: '420px' }}>

          <div style={{ marginBottom: '22px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a2e0a', margin: 0 }}>Créer un compte</h1>
            <p style={{ fontSize: '13px', color: '#5a6e3a', marginTop: '4px', marginBottom: 0 }}>Rejoignez l'espace membres FFS/EFS</p>
            <div style={{ height: '2px', background: 'linear-gradient(90deg, #A6C630, #B3D280)', borderRadius: '2px', marginTop: '14px' }}></div>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: '#fef2f2', border: '0.5px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Prénom</label>
                <input
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  required
                  placeholder="Jean"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#A6C630')}
                  onBlur={e => (e.target.style.borderColor = '#d8e4a8')}
                />
              </div>
              <div>
                <label style={labelStyle}>Nom</label>
                <input
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                  placeholder="Dupont"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#A6C630')}
                  onBlur={e => (e.target.style.borderColor = '#d8e4a8')}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Adresse email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="votre@email.com"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#A6C630')}
                onBlur={e => (e.target.style.borderColor = '#d8e4a8')}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Mot de passe</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#A6C630')}
                onBlur={e => (e.target.style.borderColor = '#d8e4a8')}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Confirmer le mot de passe</label>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
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
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '18px', paddingTop: '16px', borderTop: '0.5px solid #d8e4a8', fontSize: '13px', color: '#5a6e3a' }}>
            Déjà un compte ?{' '}
            <Link href="/login" style={{ color: '#7a9420', fontWeight: '500', textDecoration: 'none' }}>Se connecter</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}