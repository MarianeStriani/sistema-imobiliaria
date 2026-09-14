"use client"

import Link from "next/link"

export default function Home() {
  return (
    <main style={{ padding: "40px" }}>
      <h1>Sistema de Administração de Imóveis</h1>

      <p>
        Bem-vindo ao sistema de gestão imobiliária.
      </p>

      <div style={{ marginTop: "30px" }}>
        <Link href="/dashboard">
          <button>Entrar no Dashboard</button>
        </Link>
      </div>
    </main>
  )
}