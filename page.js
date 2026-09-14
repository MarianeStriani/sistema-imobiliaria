"use client"

import Link from "next/link"

export default function Home() {
  return (
    <main>
      <h1>Sistema de Administração de Imóveis</h1>

      <Link href="/dashboard">
        <button>Entrar no Dashboard</button>
      </Link>
    </main>
  )
}