"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Dashboard() {
const [clientes, setClientes] = useState([])
const [contratos, setContratos] = useState([])
const [recebimentos, setRecebimentos] = useState([])
const [despesas, setDespesas] = useState([])

const [carregando, setCarregando] = useState(true)
const [erro, setErro] = useState("")

const hoje = new Date()

const [mes, setMes] = useState(hoje.getMonth() + 1)
const [ano, setAno] = useState(hoje.getFullYear())

const nomesMeses = [
"Janeiro",
"Fevereiro",
"Março",
"Abril",
"Maio",
"Junho",
"Julho",
"Agosto",
"Setembro",
"Outubro",
"Novembro",
"Dezembro"
]

useEffect(() => {
carregarDados()
}, [])

async function carregarDados() {
setCarregando(true)
setErro("")

try {
  const [
    clientesResult,
    contratosResult,
    recebimentosResult,
    despesasResult
  ] = await Promise.all([
    supabase
      .from("clientes")
      .select("*"),

    supabase
      .from("contratos")
      .select("*")
      .order("id", { ascending: false }),

    supabase
      .from("recebimentos")
      .select(`
        *,
        clientes (
          nome
        ),
        contratos (
          numero,
          imovel
        )
      `)
      .order("data_recebimento", {
        ascending: false
      }),

    supabase
      .from("despesas")
      .select("*")
      .order("data_despesa", {
        ascending: false
      })
  ])

  if (clientesResult.error) {
    throw new Error(
      "Erro ao carregar clientes: " +
      clientesResult.error.message
    )
  }

  if (contratosResult.error) {
    throw new Error(
      "Erro ao carregar contratos: " +
      contratosResult.error.message
    )
  }

  if (recebimentosResult.error) {
    throw new Error(
      "Erro ao carregar recebimentos: " +
      recebimentosResult.error.message
    )
  }

  if (despesasResult.error) {
    throw new Error(
      "Erro ao carregar despesas: " +
      despesasResult.error.message
    )
  }

  setClientes(clientesResult.data || [])
  setContratos(contratosResult.data || [])
  setRecebimentos(recebimentosResult.data || [])
  setDespesas(despesasResult.data || [])
} catch (error) {
  console.error(error)
  setErro(error.message)
} finally {
  setCarregando(false)
}

}

const recebimentosDoMes = useMemo(() => {
return recebimentos.filter((item) => {
if (!item.data_recebimento) return false

  const data = new Date(
    item.data_recebimento + "T00:00:00"
  )

  return (
    data.getMonth() + 1 === Number(mes) &&
    data.getFullYear() === Number(ano)
  )
})

}, [recebimentos, mes, ano])

const despesasDoMes = useMemo(() => {
return despesas.filter((item) => {
if (!item.data_despesa) return false

  const data = new Date(
    item.data_despesa + "T00:00:00"
  )

  return (
    data.getMonth() + 1 === Number(mes) &&
    data.getFullYear() === Number(ano)
  )
})

}, [despesas, mes, ano])

const recebimentosPagos = useMemo(() => {
return recebimentosDoMes.filter(
(item) =>
String(item.status || "").toLowerCase() ===
"pago"
)
}, [recebimentosDoMes])

const despesasPagas = useMemo(() => {
return despesasDoMes.filter(
(item) =>
String(item.status || "").toLowerCase() ===
"pago"
)
}, [despesasDoMes])

function somar(lista) {
return lista.reduce(
(total, item) =>
total + Number(item.valor || 0),
0
)
}

const totalRecebido = somar(recebimentosPagos)

const totalDespesas = somar(despesasPagas)

const saldoFinanceiro =
totalRecebido - totalDespesas

const quantidadeClientes = clientes.length

const quantidadeContratos = contratos.length

const quantidadeRecebimentos =
recebimentosPagos.length

const quantidadeDespesas =
despesasPagas.length

const ultimosRecebimentos = recebimentosPagos
.slice()
.sort((a, b) => {
return (
new Date(b.data_recebimento) -
new Date(a.data_recebimento)
)
})
.slice(0, 5)

const ultimasDespesas = despesasPagas
.slice()
.sort((a, b) => {
return (
new Date(b.data_despesa) -
new Date(a.data_despesa)
)
})
.slice(0, 5)

function moeda(valor) {
return Number(valor || 0).toLocaleString(
"pt-BR",
{
style: "currency",
currency: "BRL"
}
)
}

function formatarData(data) {
if (!data) return "-"

return new Date(
  data + "T00:00:00"
).toLocaleDateString("pt-BR")

}

function mesAnterior() {
if (Number(mes) === 1) {
setMes(12)
setAno(Number(ano) - 1)
} else {
setMes(Number(mes) - 1)
}
}

function proximoMes() {
if (Number(mes) === 12) {
setMes(1)
setAno(Number(ano) + 1)
} else {
setMes(Number(mes) + 1)
}
}

function mesAtual() {
setMes(hoje.getMonth() + 1)
setAno(hoje.getFullYear())
}

return (
<main className="container-fluid py-4">

  {/* CABEÇALHO */}

  <div className="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h1 className="fw-bold mb-1">
        Dashboard
      </h1>

      <p className="text-muted mb-0">
        Visão geral da imobiliária
      </p>
    </div>

    <button
      className="btn btn-outline-primary"
      onClick={carregarDados}
      disabled={carregando}
    >
      {carregando ? "Atualizando..." : "🔄 Atualizar"}
    </button>
  </div>

  {/* ACESSO RÁPIDO */}

<div className="card shadow-sm mb-4">
  <div className="card-body">

    <h5 className="fw-bold mb-3">
      ⚡ Acesso rápido
    </h5>

    <div className="d-flex gap-2 flex-wrap">

      <a
        href="/"
        className="btn btn-primary"
      >
        🏠 Início
      </a>

      <a
        href="/clientes"
        className="btn btn-light border"
      >
        👥 Clientes
      </a>

      <a
        href="/imoveis"
        className="btn btn-light border"
      >
        🏢 Imóveis
      </a>

      <a
        href="/contratos"
        className="btn btn-light border"
      >
        📄 Contratos
      </a>

      <a
        href="/recebimentos"
        className="btn btn-light border"
      >
        💰 Recebimentos
      </a>

      <a
        href="/despesas"
        className="btn btn-light border"
      >
        💸 Despesas
      </a>

      <a
        href="/financeiro"
        className="btn btn-light border"
      >
        📊 Financeiro
      </a>

    </div>

  </div>
</div>

  {/* FILTRO */}

  <div className="card shadow-sm mb-4">
    <div className="card-body">

      <div className="row align-items-end g-3">

        <div className="col-md-4">

          <label className="form-label fw-bold">
            Mês
          </label>

          <select
            className="form-select"
            value={mes}
            onChange={(e) =>
              setMes(Number(e.target.value))
            }
          >
            {nomesMeses.map((nome, index) => (
              <option
                key={index + 1}
                value={index + 1}
              >
                {nome}
              </option>
            ))}
          </select>

        </div>

        <div className="col-md-3">

          <label className="form-label fw-bold">
            Ano
          </label>

          <select
            className="form-select"
            value={ano}
            onChange={(e) =>
              setAno(Number(e.target.value))
            }
          >
            {Array.from(
              { length: 11 },
              (_, index) =>
                hoje.getFullYear() - 5 + index
            ).map((valorAno) => (
              <option
                key={valorAno}
                value={valorAno}
              >
                {valorAno}
              </option>
            ))}
          </select>

        </div>

        <div className="col-md-5">

          <div className="d-flex gap-2">

            <button
              className="btn btn-outline-secondary flex-fill"
              onClick={mesAnterior}
            >
              ← Anterior
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={mesAtual}
            >
              Mês atual
            </button>

            <button
              className="btn btn-outline-secondary flex-fill"
              onClick={proximoMes}
            >
              Próximo →
            </button>

          </div>

        </div>

      </div>

      <div className="text-center mt-3">
        <h4 className="fw-bold mb-0">
          {nomesMeses[Number(mes) - 1]} / {ano}
        </h4>
      </div>

    </div>
  </div>

  {/* ERRO */}

  {erro && (
    <div className="alert alert-danger">
      <strong>Erro:</strong> {erro}
    </div>
  )}

  {carregando ? (

    <div className="text-center py-5">

      <div
        className="spinner-border text-primary"
        role="status"
      />

      <p className="text-muted mt-3">
        Carregando dados do Supabase...
      </p>

    </div>

  ) : (

    <>
{/* SALDO */}

      <div className="card shadow-sm mb-5">

        <div className="card-body text-center py-4">

          <h4 className="fw-bold">
            Saldo financeiro de{" "}
            {nomesMeses[Number(mes) - 1]} / {ano}
          </h4>

          <h1
            className={`fw-bold ${
              saldoFinanceiro >= 0
                ? "text-success"
                : "text-danger"
            }`}
          >
            {moeda(saldoFinanceiro)}
          </h1>

          <p className="text-muted mb-0">
            Total recebido: {moeda(totalRecebido)}
            {"  "}−{"  "}
            Total de despesas: {moeda(totalDespesas)}
          </p>

        </div>

      </div>

      {/* RESUMO */}

      <div className="row g-3 mb-4">

        <div className="col-md-3">
          <div className="card shadow-sm h-100 border-success border-3">
            <div className="card-body">
              <p className="text-muted mb-1">
                Valores recebidos
              </p>

              <h3 className="fw-bold text-success">
                {moeda(totalRecebido)}
              </h3>

              <small className="text-muted">
                {quantidadeRecebimentos} recebimento(s)
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm h-100 border-danger border-3">
            <div className="card-body">
              <p className="text-muted mb-1">
                Despesas
              </p>

              <h3 className="fw-bold text-danger">
                {moeda(totalDespesas)}
              </h3>

              <small className="text-muted">
                {quantidadeDespesas} despesa(s)
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm h-100 border-primary border-3">
            <div className="card-body">
              <p className="text-muted mb-1">
                Saldo financeiro
              </p>

              <h3
                className={`fw-bold ${
                  saldoFinanceiro >= 0
                    ? "text-primary"
                    : "text-danger"
                }`}
              >
                {moeda(saldoFinanceiro)}
              </h3>

              <small className="text-muted">
                Recebimentos - despesas
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm h-100 border-secondary border-3">
            <div className="card-body">
              <p className="text-muted mb-1">
                Clientes
              </p>

              <h3 className="fw-bold">
                {quantidadeClientes}
              </h3>

              <small className="text-muted">
                clientes cadastrados
              </small>
            </div>
          </div>
        </div>

      </div>

      {/* CONTADORES */}

      <div className="row g-3 mb-5">

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-1">
                  Clientes
                </h5>
                <span className="text-muted">
                  Cadastros no sistema
                </span>
              </div>

              <span className="badge bg-primary fs-6">
                {quantidadeClientes}
              </span>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-1">
                  Contratos
                </h5>
                <span className="text-muted">
                  Contratos cadastrados
                </span>
              </div>

              <span className="badge bg-dark fs-6">
                {quantidadeContratos}
              </span>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-1">
                  Recebimentos
                </h5>
                <span className="text-muted">
                  Pagos no mês
                </span>
              </div>

              <span className="badge bg-success fs-6">
                {quantidadeRecebimentos}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* RECEBIMENTOS */}

      <div className="card shadow-sm mb-5">

        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">
            💰 Valores recebidos
          </h5>

          <span className="badge bg-success">
            {moeda(totalRecebido)}
          </span>
        </div>

        <div className="card-body">

          {ultimosRecebimentos.length === 0 ? (

            <p className="text-center text-muted py-3 mb-0">
              Nenhum recebimento pago neste mês.
            </p>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Contrato</th>
                    <th>Categoria</th>
                    <th>Valor</th>
                  </tr>
                </thead>

                <tbody>

                  {ultimosRecebimentos.map((item) => (

                    <tr key={item.id}>

                      <td>
                        {formatarData(
                          item.data_recebimento
                        )}
                      </td>

                      <td>
                        {item.clientes?.nome || "-"}
                      </td>

                      <td>
                        {item.contratos?.numero || "-"}
                      </td>

                      <td>
                        {item.categoria || "-"}
                      </td>

                      <td className="fw-bold text-success">
                        {moeda(item.valor)}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

          <a
            href="/recebimentos"
            className="btn btn-outline-success"
          >
            Ver recebimentos
          </a>

        </div>
      </div>

      {/* DESPESAS */}

      <div className="card shadow-sm mb-5">

        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">
            💸 Despesas
          </h5>

          <span className="badge bg-danger">
            {moeda(totalDespesas)}
          </span>
        </div>

        <div className="card-body">

          {ultimasDespesas.length === 0 ? (

            <p className="text-center text-muted py-3 mb-0">
              Nenhuma despesa paga neste mês.
            </p>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Categoria</th>
                    <th>Descrição</th>
                    <th>Forma de pagamento</th>
                    <th>Valor</th>
                  </tr>
                </thead>

                <tbody>

                  {ultimasDespesas.map((item) => (

                    <tr key={item.id}>

                      <td>
                        {formatarData(
                          item.data_despesa
                        )}
                      </td>

                      <td>
                        {item.categoria || "-"}
                      </td>

                      <td>
                        {item.descricao || "-"}
                      </td>

                      <td>
                        {item.forma_pagamento || "-"}
                      </td>

                      <td className="fw-bold text-danger">
                        {moeda(item.valor)}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

          <a
            href="/despesas"
            className="btn btn-outline-danger"
          >
            Ver despesas
          </a>

        </div>
      </div>

      

    </>
  )}

</main>

)
}