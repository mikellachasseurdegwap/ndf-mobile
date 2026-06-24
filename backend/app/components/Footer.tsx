export default function Footer() {
  return (
    <footer style={{ background: '#f4f8e8', borderTop: '0.5px solid #d8e4a8', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: '#7a9420', fontSize: '11px' }}>© 2026 Fédération Française de Spéléologie</span>
      <a href="https://ffspeleo.fr" target="_blank" rel="noopener noreferrer" style={{ color: '#A6C630', fontSize: '11px', fontWeight: '500', textDecoration: 'none' }}>ffspeleo.fr</a>
    </footer>
  )
}