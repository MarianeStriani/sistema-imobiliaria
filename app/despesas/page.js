"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Despesas() {
  const [despesas, setDespesas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    buscarDespesas()
  }, [])

  async function buscarDespesas() {
    setCarregando(true)

    const { data, error } = await supabase
      .from("despesas")
      .select("*")
      .order("data", { ascending: false })

    if (error) {
      console.error("Erro ao buscar despesas:", error)
      setDespesas([])
    } else {
      setDespesas(data || [])
    }

    setCarregando(false)
  }

  return (
    <main>
      <h1>Despesas</h1>

      {carregando ? (
        <p>Carregando despesas...</p>
      ) : despesas.length === 0 ? (
        <p>Nenhuma despesa cadastrada.</p>
      ) : (
        despesas.map((despesa) => (
          <div key={despesa.id}>
            <strong>{despesa.descricao}</strong>
            <p>Valor: R$ {Number(despesa.valor || 0).toFixed(2)}</p>
          </div>
        ))
      )}
    </main>
  )
}