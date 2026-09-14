"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Home() {
  const [imoveis, setImoveis] = useState([])
  const [clientes, setClientes] = useState([])
  const [contratos, setContratos] = useState([])
  const [recebimentos, setRecebimentos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregarDashboard()
  }, [])

  async function carregarDashboard() {
    setCarregando(true)

    const [
      { data: imoveisData, error: imoveisError },
      { data: clientesData, error: clientesError },
      { data: contratosData, error: contratosError },
      { data: recebimentosData, error: recebimentosError }
    ] = await Promise.all([
      supabase
        .from("imoveis")
        .select("*")
        .order("id", { ascending: false }),

      supabase
        .from("clientes")
        .select("*")
        .order("id", { ascending: false }),

      supabase
        .from("contratos")
        .select("*")
        .order("id", { ascending: false }),

      supabase
        .from("recebimentos")
        .select("*")
        .order("data_recebimento", { ascending: false })
    ])

    if (imoveisError) {
      console.error("Erro ao buscar imóveis:", imoveisError)
    }

    if (clientesError) {
      console.error("Erro ao buscar clientes:", clientesError)
    }

    if (contratosError) {
      console.error("Erro ao buscar contratos:", contratosError)
    }

    if (recebimentosError) {
      console.error(
        "Erro ao buscar recebimentos:",
        recebimentosError
      )
    }

    setImoveis(imoveisData || [])
    setClientes(clientesData || [])
    setContratos(contratosData || [])
    setRecebimentos(recebimentosData || [])

    setCarregando(false)
  }

  function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
  }

  const contratosAtivos = contratos.filter(
    (contrato) => contrato.status === "Ativo"
  )

  function contratosPorTipo(tipo) {
    return contratosAtivos.filter(
      (contrato) => contrato.tipo === tipo
    )
  }

  function valorContratosPorTipo(tipo) {
    return contratosPorTipo(tipo).reduce(
      (total, contrato) =>
        total + Number(contrato.valor || 0),
      0
    )
  }

  const alugueis = contratosPorTipo("Locação")
  const vendas = contratosPorTipo("Compra e Venda")
  const temporadas = contratosPorTipo("Temporada")
  const administracao = contratosPorTipo("Administração")

  const valorAlugueis =
    valorContratosPorTipo("Locação")

  const valorVendas =
    valorContratosPorTipo("Compra e Venda")

  const valorTemporadas =
    valorContratosPorTipo("Temporada")

  const valorAdministracao =
    valorContratosPorTipo("Administração")

  const valorTotalContratosAtivos =
    contratosAtivos.reduce(
      (total, contrato) =>
        total + Number(contrato.valor || 0),
      0
    )

  /*
   * RECEBIMENTOS PAGOS
   */

  const recebimentosPagos = recebimentos.filter(
    (recebimento) => recebimento.status === "Pago"
  )

  const recebimentosPendentes = recebimentos.filter(
    (recebimento) =>
      recebimento.status === "Pendente"
  )

  function valorRecebidoPorCategoria(categoria) {
    return recebimentosPagos
      .filter(
        (recebimento) =>
          recebimento.categoria === categoria
      )
      .reduce(
        (total, recebimento) =>
          total + Number(recebimento.valor || 0),
        0
      )
  }

  function valorPendentePorCategoria(categoria) {
    return recebimentosPendentes
      .filter(
        (recebimento) =>
          recebimento.categoria === categoria
      )
      .reduce(
        (total, recebimento) =>
          total + Number(recebimento.valor || 0),
        0
      )
  }

  const recebidoAlugueis =
    valorRecebidoPorCategoria("Locação")

  const recebidoVendas =
    valorRecebidoPorCategoria("Compra e Venda")

  const recebidoTemporadas =
    valorRecebidoPorCategoria("Temporada")

  const recebidoAdministracao =
    valorRecebidoPorCategoria("Administração")

  const totalRecebido =
    recebimentosPagos.reduce(
      (total, recebimento) =>
        total + Number(recebimento.valor || 0),
      0
    )

  const totalPendente =
    recebimentosPendentes.reduce(
      (total, recebimento) =>
        total + Number(recebimento.valor || 0),
      0
    )

  return (
    <main className="container-fluid py-4">

      {/* CABEÇALHO */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h1 className="fw-bold mb-1">
            Dashboard
          </h1>

          <p className="text-muted mb-0">
            Sistema de Administração de Imóveis
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={carregarDashboard}
        >
          Atualizar
        </button>

      </div>

      {carregando ? (

        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
          ></div>

          <p className="mt-3 text-muted">
            Carregando informações...
          </p>
        </div>

      ) : (

        <>

          {/* RESUMO GERAL */}

          <h4 className="fw-bold mb-3">
            Resumo geral
          </h4>

          <div className="row g-3 mb-5">

            <div className="col-md-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">
                    Imóveis
                  </p>

                  <h2 className="fw-bold">
                    {imoveis.length}
                  </h2>

                  <a
                    href="/imoveis"
                    className="btn btn-sm btn-outline-primary"
                  >
                    Ver imóveis
                  </a>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">
                    Clientes
                  </p>

                  <h2 className="fw-bold">
                    {clientes.length}
                  </h2>

                  <a
                    href="/clientes"
                    className="btn btn-sm btn-outline-primary"
                  >
                    Ver clientes
                  </a>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">
                    Contratos ativos
                  </p>

                  <h2 className="fw-bold">
                    {contratosAtivos.length}
                  </h2>

                  <a
                    href="/contratos"
                    className="btn btn-sm btn-outline-primary"
                  >
                    Ver contratos
                  </a>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">
                    Total recebido
                  </p>

                  <h2 className="fw-bold text-success">
                    {moeda(totalRecebido)}
                  </h2>

                  <a
                    href="/recebimentos"
                    className="btn btn-sm btn-outline-success"
                  >
                    Ver recebimentos
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* CONTRATOS POR CATEGORIA */}

          <h4 className="fw-bold mb-3">
            Contratos ativos por categoria
          </h4>

          <div className="row g-3 mb-5">

            <div className="col-md-3">
              <div className="card shadow-sm border-start border-primary border-4 h-100">
                <div className="card-body">

                  <h5 className="fw-bold">
                    Aluguéis
                  </h5>

                  <h3>
                    {alugueis.length}
                  </h3>

                  <p className="text-muted mb-0">
                    Valor dos contratos
                  </p>

                  <strong>
                    {moeda(valorAlugueis)}
                  </strong>

                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm border-start border-success border-4 h-100">
                <div className="card-body">

                  <h5 className="fw-bold">
                    Vendas
                  </h5>

                  <h3>
                    {vendas.length}
                  </h3>

                  <p className="text-muted mb-0">
                    Valor dos contratos
                  </p>

                  <strong>
                    {moeda(valorVendas)}
                  </strong>

                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm border-start border-warning border-4 h-100">
                <div className="card-body">

                  <h5 className="fw-bold">
                    Temporadas
                  </h5>

                  <h3>
                    {temporadas.length}
                  </h3>

                  <p className="text-muted mb-0">
                    Valor dos contratos
                  </p>

                  <strong>
                    {moeda(valorTemporadas)}
                  </strong>

                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm border-start border-info border-4 h-100">
                <div className="card-body">

                  <h5 className="fw-bold">
                    Administração
                  </h5>

                  <h3>
                    {administracao.length}
                  </h3>

                  <p className="text-muted mb-0">
                    Valor dos contratos
                  </p>

                  <strong>
                    {moeda(valorAdministracao)}
                  </strong>

                </div>
              </div>
            </div>

          </div>

          {/* TOTAL CONTRATOS */}

          <div className="card shadow-sm mb-5">
            <div className="card-body">

              <div className="row align-items-center">

                <div className="col-md-8">
                  <h5 className="fw-bold mb-1">
                    Valor total dos contratos ativos
                  </h5>

                  <p className="text-muted mb-0">
                    Soma dos valores cadastrados nos
                    contratos ativos.
                  </p>
                </div>

                <div className="col-md-4 text-md-end">
                  <h2 className="fw-bold mb-0">
                    {moeda(valorTotalContratosAtivos)}
                  </h2>
                </div>

              </div>

            </div>
          </div>

          {/* FINANCEIRO */}

          <h4 className="fw-bold mb-3">
            Financeiro — valores recebidos
          </h4>

          <div className="row g-3 mb-4">

            <div className="col-md-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">

                  <h6 className="text-muted">
                    Aluguéis recebidos
                  </h6>

                  <h3 className="fw-bold text-success">
                    {moeda(recebidoAlugueis)}
                  </h3>

                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">

                  <h6 className="text-muted">
                    Vendas recebidas
                  </h6>

                  <h3 className="fw-bold text-success">
                    {moeda(recebidoVendas)}
                  </h3>

                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">

                  <h6 className="text-muted">
                    Temporadas recebidas
                  </h6>

                  <h3 className="fw-bold text-success">
                    {moeda(recebidoTemporadas)}
                  </h3>

                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">

                  <h6 className="text-muted">
                    Administração recebida
                  </h6>

                  <h3 className="fw-bold text-success">
                    {moeda(recebidoAdministracao)}
                  </h3>

                </div>
              </div>
            </div>

          </div>

          {/* TOTAL RECEBIDO E PENDENTE */}

          <div className="row g-3 mb-5">

            <div className="col-md-6">
              <div className="card shadow-sm bg-success text-white">
                <div className="card-body">

                  <p className="mb-1">
                    Total recebido
                  </p>

                  <h2 className="fw-bold mb-0">
                    {moeda(totalRecebido)}
                  </h2>

                  <small>
                    {recebimentosPagos.length} recebimento(s) pago(s)
                  </small>

                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card shadow-sm bg-warning">
                <div className="card-body">

                  <p className="mb-1">
                    Total pendente
                  </p>

                  <h2 className="fw-bold mb-0">
                    {moeda(totalPendente)}
                  </h2>

                  <small>
                    {recebimentosPendentes.length} recebimento(s) pendente(s)
                  </small>

                </div>
              </div>
            </div>

          </div>

          {/* ATALHOS */}

          <h4 className="fw-bold mb-3">
            Acesso rápido
          </h4>

          <div className="row g-3 mb-5">

            <div className="col-md-3">
              <a
                href="/imoveis"
                className="btn btn-primary w-100 py-3"
              >
                + Cadastrar imóvel
              </a>
            </div>

            <div className="col-md-3">
              <a
                href="/clientes"
                className="btn btn-primary w-100 py-3"
              >
                + Cadastrar cliente
              </a>
            </div>

            <div className="col-md-3">
              <a
                href="/contratos"
                className="btn btn-primary w-100 py-3"
              >
                + Cadastrar contrato
              </a>
            </div>

            <div className="col-md-3">
              <a
                href="/recebimentos"
                className="btn btn-success w-100 py-3"
              >
                + Registrar recebimento
              </a>
            </div>

          </div>

          {/* ÚLTIMOS RECEBIMENTOS */}

          <div className="card shadow-sm mb-5">

            <div className="card-header">
              <h5 className="mb-0">
                Últimos recebimentos
              </h5>
            </div>

            <div className="card-body">

              <div className="table-responsive">

                <table className="table table-hover align-middle">

                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Categoria</th>
                      <th>Valor</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {recebimentos.length === 0 ? (

                      <tr>
                        <td
                          colSpan="4"
                          className="text-center text-muted py-4"
                        >
                          Nenhum recebimento cadastrado.
                        </td>
                      </tr>

                    ) : (

                      recebimentos
                        .slice(0, 5)
                        .map((item) => (

                          <tr key={item.id}>

                            <td>
                              {item.data_recebimento
                                ? new Date(
                                    item.data_recebimento +
                                      "T00:00:00"
                                  ).toLocaleDateString(
                                    "pt-BR"
                                  )
                                : "-"}
                            </td>

                            <td>
                              {item.categoria}
                            </td>

                            <td className="fw-bold">
                              {moeda(item.valor)}
                            </td>

                            <td>

                              <span
                                className={
                                  item.status === "Pago"
                                    ? "badge bg-success"
                                    : "badge bg-warning text-dark"
                                }
                              >
                                {item.status}
                              </span>

                            </td>

                          </tr>

                        ))

                    )}

                  </tbody>

                </table>

              </div>

              {recebimentos.length > 0 && (
                <a
                  href="/recebimentos"
                  className="btn btn-outline-primary"
                >
                  Ver todos os recebimentos
                </a>
              )}

            </div>

          </div>

          {/* ÚLTIMOS CLIENTES */}

          <div className="card shadow-sm">

            <div className="card-header">
              <h5 className="mb-0">
                Clientes cadastrados
              </h5>
            </div>

            <div className="card-body">

              {clientes.length === 0 ? (

                <p className="text-muted mb-0">
                  Nenhum cliente cadastrado.
                </p>

              ) : (

                <div className="table-responsive">

                  <table className="table table-hover">

                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Tipo</th>
                        <th>Telefone</th>
                        <th>Cidade</th>
                      </tr>
                    </thead>

                    <tbody>

                      {clientes
                        .slice(0, 5)
                        .map((cliente) => (

                          <tr key={cliente.id}>

                            <td>
                              {cliente.nome}
                            </td>

                            <td>
                              {cliente.tipo}
                            </td>

                            <td>
                              {cliente.telefone}
                            </td>

                   <td>
                              {cliente.cidade || "-"}
                            </td>

                          </tr>

                        ))}

                    </tbody>

                  </table>

                </div>

              )}

              <a
                href="/clientes"
                className="btn btn-outline-primary"
              >
                Ver todos os clientes
              </a>

            </div>

          </div>

        </>

      )}

    </main>
  )
}