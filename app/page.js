"use client"

import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"

export default function Home() {
  const [contratos, setContratos] = useState([])

  useEffect(() => {
    buscarContratos()
  }, [])

  async function buscarContratos() {
    const { data, error } = await supabase
      .from("contratos")
      .select("*")

    if (error) {
      console.error("Erro ao buscar contratos:", error)
      return
    }

    setContratos(data || [])
  }

  const alugueisAtivos = contratos.filter(
    contrato =>
      contrato.categoria === "Aluguel" &&
      contrato.status === "Ativo"
  )

  const vendas = contratos.filter(
    contrato => contrato.categoria === "Venda"
  )

  const temporadas = contratos.filter(
    contrato => contrato.categoria === "Temporada"
  )

  const totalAlugueis = alugueisAtivos.reduce(
    (total, contrato) =>
      total + Number(
        contrato.valor_aluguel ||
        contrato.valor ||
        0
      ),
    0
  )

  const totalVendas = vendas.reduce(
    (total, contrato) =>
      total + Number(
        contrato.valor ||
        contrato.valor_venda ||
        0
      ),
    0
  )

  const totalTemporadas = temporadas.reduce(
    (total, contrato) =>
      total + Number(
        contrato.valor ||
        contrato.valor_temporada ||
        0
      ),
    0
  )

  const totalRecebido =
    totalAlugueis +
    totalVendas +
    totalTemporadas

  return (
    <main style={{ padding: "30px" }}>

      <h1>Dashboard</h1>

      <p>
        Sistema de Administração de Imóveis
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "30px"
        }}
      >

        <div className="card">
          <h3>Aluguéis Ativos</h3>

          <h2>
            {alugueisAtivos.length}
          </h2>

          <p>
            R${" "}
            {totalAlugueis.toLocaleString(
              "pt-BR",
              {
                minimumFractionDigits: 2
              }
            )}
          </p>
        </div>

        <div className="card">
          <h3>Vendas</h3>

          <h2>
            {vendas.length}
          </h2>

          <p>
            R${" "}
            {totalVendas.toLocaleString(
              "pt-BR",
              {
                minimumFractionDigits: 2
              }
            )}
          </p>
        </div>

        <div className="card">
          <h3>Temporadas</h3>

          <h2>
            {temporadas.length}
          </h2>

          <p>
            R${" "}
            {totalTemporadas.toLocaleString(
              "pt-BR",
              {
                minimumFractionDigits: 2
              }
            )}
          </p>
        </div>

        <div className="card">
          <h3>Valores Recebidos</h3>

          <h2>
            R${" "}
            {totalRecebido.toLocaleString(
              "pt-BR",
              {
                minimumFractionDigits: 2
              }
            )}
          </h2>
        </div>

      </div>

    </main>
  )
}