'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => { if (data.success) setUser(data.data) })
      .catch(() => setUser(null))
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
  }

  return (
    <header style={{ background: 'white', borderBottom: '0.5px solid #d8e4a8' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', background: '#A6C630', borderRadius: '8px' }}>
            <span style={{ color: '#1a2e0a', fontSize: '14px', fontWeight: '500', lineHeight: '1' }}>FFS</span>
            <div style={{ width: '28px', height: '1px', background: 'rgba(26,46,10,0.4)', margin: '2px 0' }}></div>
            <span style={{ color: '#1a2e0a', fontSize: '7px', fontWeight: '500', letterSpacing: '0.04em', lineHeight: '1' }}>EFS</span>
          </div>
          <div>
            <div style={{ color: '#1a2e0a', fontSize: '14px', fontWeight: '500' }}>Notes de Frais</div>
            <div style={{ color: '#7a9420', fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Fédération Française de Spéléologie</div>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          {user && (
            <Link href="/dashboard" style={{ color: '#5a6e3a', fontSize: '13px', textDecoration: 'none' }}>Mon espace</Link>
          )}
          {pathname !== '/' && pathname !== '/login' && pathname !== '/nouvelle-ndf' && (
            <Link href="/nouvelle-ndf" style={{ color: '#5a6e3a', fontSize: '13px', textDecoration: 'none' }}>Nouvelle NDF</Link>
          )}
          {user?.role === 'admin' && (
            <Link href="/admin" style={{ color: '#5a6e3a', fontSize: '13px', textDecoration: 'none' }}>Admin</Link>
          )}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(!menuOpen)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#A6C630', color: '#1a2e0a', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                {user.prenom?.[0]?.toUpperCase() || 'U'}
              </button>
              {menuOpen && (
                <div style={{ position: 'absolute', right: 0, top: '44px', background: 'white', border: '0.5px solid #d8e4a8', borderRadius: '10px', padding: '8px 0', minWidth: '160px', zIndex: 50 }}>
                  <div style={{ padding: '8px 16px 10px', color: '#5a6e3a', fontSize: '12px', borderBottom: '0.5px solid #d8e4a8' }}>{user.prenom} {user.nom}</div>
                  <Link href="/dashboard" style={{ display: 'block', padding: '8px 16px', color: '#1a2e0a', fontSize: '13px', textDecoration: 'none' }}>Mon espace</Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" style={{ display: 'block', padding: '8px 16px', color: '#1a2e0a', fontSize: '13px', textDecoration: 'none' }}>Administration</Link>
                  )}
                  <button onClick={logout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', color: '#1a2e0a', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}>Déconnexion</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" style={{ background: '#A6C630', color: '#1a2e0a', padding: '8px 18px', borderRadius: '7px', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}>Connexion</Link>
          )}
        </div>
      </div>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #4a5c14 0%, #A6C630 45%, #B3D280 80%, #e8e060 100%)' }}></div>
    </header>
  )
}