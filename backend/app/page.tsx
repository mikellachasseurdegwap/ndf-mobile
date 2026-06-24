import Link from 'next/link'
import Header from './components/Header'
import Footer from './components/Footer'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <section style={{ background: '#f4f8e8', padding: '48px 24px', borderBottom: '0.5px solid #d8e4a8' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ display: 'inline-flex', background: '#e4f0b8', border: '0.5px solid #A6C630', color: '#4a5c14', fontSize: '11px', fontWeight: '500', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
                Barèmes officiels FFS 2026
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: '500', color: '#1a2e0a', lineHeight: '1.2', marginBottom: '12px' }}>
                Gérez vos <span style={{ color: '#7a9420' }}>notes de frais</span><br />en toute simplicité
              </h1>
              <p style={{ fontSize: '14px', color: '#5a6e3a', lineHeight: '1.6', marginBottom: '24px', maxWidth: '380px' }}>
                Soumettez vos frais en ligne et suivez vos remboursements. Calcul automatique selon les barèmes FFS/EFS en vigueur.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link href="/nouvelle-ndf" style={{ background: '#A6C630', color: '#1a2e0a', padding: '12px 22px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>+ Nouvelle note de frais</Link>
                <Link href="/login" style={{ background: 'white', color: '#4a5c14', padding: '12px 22px', borderRadius: '8px', fontSize: '14px', border: '0.5px solid #A6C630', textDecoration: 'none' }}>Se connecter →</Link>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', minWidth: '220px' }}>
              {[
                { val: '0,36 €', lbl: 'km voiture', accent: '#A6C630' },
                { val: '0,14 €', lbl: 'km moto', accent: '#A6C630' },
                { val: '25,00 €', lbl: 'plafond repas', accent: '#B3D280' },
                { val: '100,00 €', lbl: 'plafond hôtel', accent: '#B3D280' },
              ].map((b, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '8px', padding: '12px 14px', border: '0.5px solid #d8e4a8', borderLeft: `3px solid ${b.accent}` }}>
                  <div style={{ fontSize: '17px', fontWeight: '500', color: '#1a2e0a' }}>{b.val}</div>
                  <div style={{ fontSize: '11px', color: '#5a6e3a', marginTop: '2px' }}>{b.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section style={{ background: 'white', padding: '32px 24px' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#7a9420', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>Comment ça fonctionne</div>
            {[
              { n: '1', t: 'Remplissez votre note de frais', s: 'Ajoutez chaque dépense — sans compte requis' },
              { n: '2', t: 'Soumission automatique au trésorier', s: 'Notification email instantanée' },
              { n: '3', t: 'Suivez votre remboursement', s: 'Statut en temps réel depuis votre espace membre' },
            ].map((step) => (
              <div key={step.n} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#A6C630', color: '#1a2e0a', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{step.n}</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a2e0a' }}>{step.t}</div>
                  <div style={{ fontSize: '12px', color: '#5a6e3a', marginTop: '2px' }}>{step.s}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}