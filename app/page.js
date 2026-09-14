"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Home() {
  const [imoveis, setImoveis] = useState([])
  const [clientes, setClientes] = useState([])
  const [contratos, setContratos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    setCarregando(true)

    const [
      resultadoImoveis,
      resultadoClientes,
      resultadoContratos
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
        .order("id", { ascending: false })
    ])

    if (resultadoImoveis.error) {
      console.error(resultadoImoveis.error)
    }

    if (resultadoClientes.error) {
      console.error(resultadoClientes.error)
    }

    if (resultadoContratos.error) {
      console.error(resultadoContratos.error)
    }

    setImoveis(resultadoImoveis.data || [])
    setClientes(resultadoClientes.data || [])
    setContratos(resultadoContratos.data || [])

    setCarregando(false)
  }

  const contratosAtivos = contratos.filter(
    (contrato) => contrato.status === "Ativo"
  )

  const valorContratos = contratosAtivos.reduce(
    (total, contrato) =>
      total + Number(contrato.valor || 0),
    0
  )

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
  }

  function formatarData(data) {
    if (!data) return "-"

    const partes = data.split("-")

    if (partes.length !== 3) return data

    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  return (
    <main className="container py-4">

      {/* CABEÇALHO */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h1 className="fw-bold">
            Sistema Imobiliário
          </h1>

          <p className="text-muted mb-0">
            Painel de administração
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={carregarDados}
        >
          Atualizar
        </button>

      </div>


      {/* CARDS */}

      <div className="row g-4 mb-4">

        <div className="col-md-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <p className="text-muted mb-1">
                Imóveis
              </p>

              <h2 className="fw-bold">
                {carregando ? "..." : imoveis.length}
              </h2>

              <a
                href="/imoveis"
                className="btn btn-sm btn-primary"
              >
                Ver imóveis
              </a>

            </div>

          </div>

        </div>


        <div className="col-md-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <p className="text-muted mb-1">
                Clientes
              </p>

              <h2 className="fw-bold">
                {carregando ? "..." : clientes.length}
              </h2>

              <a
                href="/clientes"
                className="btn btn-sm btn-primary"
              >
                Ver clientes
              </a>

            </div>

          </div>

        </div>


        <div className="col-md-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <p className="text-muted mb-1">
                Contratos
              </p>

              <h2 className="fw-bold">
                {carregando ? "..." : contratos.length}
              </h2>

              <a
                href="/contratos"
                className="btn btn-sm btn-primary"
              >
                Ver contratos
              </a>

            </div>

          </div>

        </div>


        <div className="col-md-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <p className="text-muted mb-1">
                Contratos ativos
              </p>

              <h2 className="fw-bold">
                {carregando ? "..." : contratosAtivos.length}
              </h2>

              <p className="text-success mb-0">
                {formatarValor(valorContratos)}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* RESUMO */}

      <div className="row g-4 mb-4">

        <div className="col-md-6">

          <div className="card shadow-sm h-100">

            <div className="card-body">

              <h4 className="mb-3">
                Resumo dos imóveis
              </h4>

              {imoveis.length === 0 ? (

                <div className="alert alert-info">
                  Nenhum imóvel cadastrado.
                </div>

              ) : (

                <div className="table-responsive">

                  <table className="table table-hover">

                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Tipo</th>
                        <th>Cidade</th>
                        <th>Valor</th>
                      </tr>
                    </thead>

                    <tbody>

                      {imoveis.slice(0, 5).map((imovel) => (

                        <tr key={imovel.id}>

                          <td>
                            <strong>
                              {imovel.codigo}
                            </strong>
                          </td>

                          <td>
                            {imovel.tipo}
                          </td>

                          <td>
                            {imovel.cidade}
                          </td>

                          <td>
                            {formatarValor(imovel.valor)}
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

              <a
                href="/imoveis"
                className="btn btn-outline-primary"
              >
                Ver todos os imóveis
              </a>

            </div>

          </div>

        </div>


        {/* CONTRATOS RECENTES */}

        <div className="col-md-6">

          <div className="card shadow-sm h-100">

            <div className="card-body">

              <h4 className="mb-3">
                Contratos recentes
              </h4>

              {contratos.length === 0 ? (

                <div className="alert alert-info">
                  Nenhum contrato cadastrado.
                </div>

              ) : (

                <div className="table-responsive">

                  <table className="table table-hover">

                    <thead>

                      <tr>
                        <th>Número</th>
                        <th>Cliente</th>
                        <th>Valor</th>
                        <th>Status</th>
                      </tr>

                    </thead>

                    <tbody>

                      {contratos.slice(0, 5).map((contrato) => (

                        <tr key={contrato.id}>

                          <td>
                            <strong>
                              {contrato.numero}
                            </strong>
                          </td>

                          <td>
                            {contrato.cliente}
                          </td>

                          <td>
                            {formatarValor(contrato.valor)}
                          </td>

                          <td>

                            <span
                              className={
                                contrato.status === "Ativo"
                                  ? "badge bg-success"
                                  : "badge bg-secondary"
                              }
                            >
                              {contrato.status}
                            </span>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

              <a
                href="/contratos"
                className="btn btn-outline-primary"
              >
                Ver todos os contratos
              </a>

            </div>

          </div>

        </div>

      </div>


      {/* CLIENTES */}

      <div className="card shadow-sm">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h4 className="mb-0">
              Clientes cadastrados
            </h4>

            <span className="badge bg-primary">
              {clientes.length}
            </span>

          </div>

          {clientes.length === 0 ? (

            <div className="alert alert-info">
              Nenhum cliente cadastrado.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover">

                <thead>

                  <tr>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Telefone</th>
                    <th>E-mail</th>
                    <th>Cidade</th>
                  </tr>

                </thead>

                <tbody>

                  {clientes.slice(0, 5).map((cliente) => (

                    <tr key={cliente.id}>

                      <td>
                        <strong>
                          {cliente.nome}
                        </strong>
                      </td>

                      <td>
                        {cliente.tipo}
                      </td>

                      <td>
                        {cliente.telefone}
                      </td>

                      <td>
                        {cliente.email || "-"}
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

    </main>
  )
          }
