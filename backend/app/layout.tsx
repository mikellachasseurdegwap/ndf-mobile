import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Notes de Frais — FFS/EFS',
  description: 'Gestion des notes de frais de la Fédération Française de Spéléologie',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen" style={{ background: '#f4f8e8' }}>
        {children}
      </body>
    </html>
  )
}