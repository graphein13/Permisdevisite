import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gestion des demandes de permis de visite',
  description: 'Application de gestion des demandes de permis de visite pour les établissements pénitentiaires'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" data-fr-scheme="system">
      <head>
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" href="/favicon/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" type="image/x-icon" />
      </head>
      <body className="fr-m-0">{children}</body>
    </html>
  )
}
