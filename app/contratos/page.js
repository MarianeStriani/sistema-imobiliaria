"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Contratos() {
  const [contratos, setContratos] = useState([])
  const [clientes, setClientes] = useState([])
  const [imoveis, setImoveis] = useState([])

  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")
  const [busca, setBusca] = useState("")

  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)

  const [form, setForm] = useState({
    cliente_id: "",
    imovel_id: "",
    tipo: "Aluguel",
    status: "ativo",
    data_inicio: "",
    data_fim: "",
    valor: "",
    dia_vencimento: "10",
    observacoes: "",
  })

  // =========================================================
  // CARREGAR DADOS
  // =========================================================

  async function carregarDados() {
    setLoading(true)
    setErro("")

    try {
      const [
        contratosResult,
        clientesResult,
        imoveisResult,
      ] = await Promise.all([
        supabase
          .from("contratos")
          .select("*")
          .order("id", {
            ascending: false,
          }),

        supabase
          .from("clientes")
          .select("*")
          .order("nome", {
            ascending: true,
          }),

        supabase
          .from("imoveis")
          .select("*")
          .order("id", {
            ascending: false,
          }),
      ])

      if (contratosResult.error) {
        throw contratosResult.error
      }

      if (clientesResult.error) {
        throw clientesResult.error
      }

      if (imoveisResult.error) {
        throw imoveisResult.error
      }

      setContratos(contratosResult.data || [])
      setClientes(clientesResult.data || [])
      setImoveis(imoveisResult.data || [])
    } catch (error) {
      console.error(
        "Erro ao carregar contratos:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível carregar os contratos."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  // =========================================================
  // MENSAGENS
  // =========================================================

  function limparMensagens() {
    setErro("")
    setSucesso("")
  }

  // =========================================================
  // NAVEGAÇÃO
  // =========================================================

  function acessarPagina(url) {
    window.location.href = url
  }

  // =========================================================
  // FORMULÁRIO
  // =========================================================

  function alterarCampo(campo, valor) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }

  function formularioInicial() {
    return {
      cliente_id: "",
      imovel_id: "",
      tipo: "Aluguel",
      status: "ativo",
      data_inicio: "",
      data_fim: "",
      valor: "",
      dia_vencimento: "10",
      observacoes: "",
    }
  }

  function abrirNovoContrato() {
    limparMensagens()

    setEditando(null)
    setForm(formularioInicial())
    setModalAberto(true)
  }

  function abrirEditarContrato(contrato) {
    limparMensagens()

    setEditando(contrato)

    setForm({
      cliente_id:
        contrato.cliente_id
          ? String(contrato.cliente_id)
          : "",

      imovel_id:
        contrato.imovel_id
          ? String(contrato.imovel_id)
          : "",

      tipo:
        contrato.tipo ||
        "Aluguel",

      status:
        contrato.status ||
        "ativo",

      data_inicio:
        contrato.data_inicio ||
        "",

      data_fim:
        contrato.data_fim ||
        "",

      valor:
        contrato.valor !== null &&
        contrato.valor !== undefined
          ? String(contrato.valor)
          : "",

      dia_vencimento:
        contrato.dia_vencimento !== null &&
        contrato.dia_vencimento !== undefined
          ? String(contrato.dia_vencimento)
          : "10",

      observacoes:
        contrato.observacoes ||
        "",
    })

    setModalAberto(true)
  }

  function fecharModal() {
    if (salvando) return

    setModalAberto(false)
    setEditando(null)
  }

  // =========================================================
  // FORMATAÇÕES
  // =========================================================

  function formatarData(data) {
    if (!data) return "-"

    const partes = String(data).split("-")

    if (partes.length !== 3) {
      return data
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  function formatarMoeda(valor) {
    const numero = Number(valor || 0)

    return numero.toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    )
  }

  // =========================================================
  // CLIENTE
  // =========================================================

  function obterCliente(contrato) {
    return clientes.find(
      (cliente) =>
        String(cliente.id) ===
        String(contrato.cliente_id)
    )
  }

  function obterNomeCliente(contrato) {
    const cliente =
      obterCliente(contrato)

    return (
      cliente?.nome ||
      "Cliente não informado"
    )
  }

  // =========================================================
  // IMÓVEL
  // =========================================================

  function obterImovel(contrato) {
    return imoveis.find(
      (imovel) =>
        String(imovel.id) ===
        String(contrato.imovel_id)
    )
  }

  function obterNomeImovel(contrato) {
    const imovel =
      obterImovel(contrato)

    if (!imovel) {
      return "Imóvel não informado"
    }

    return (
      imovel.titulo ||
      imovel.nome ||
      imovel.codigo ||
      imovel.endereco ||
      "Imóvel"
    )
  }

  // =========================================================
  // STATUS
  // =========================================================

  function obterStatusLabel(status) {
    const statusMap = {
      ativo: "Ativo",
      encerrado: "Encerrado",
      vencido: "Vencido",
      cancelado: "Cancelado",
      renovacao: "Em renovação",
    }

    return (
      statusMap[status] ||
      status ||
      "Não informado"
    )
  }

  function obterStatusClass(status) {
    const classMap = {
      ativo: "bg-success",
      encerrado: "bg-secondary",
      vencido: "bg-danger",
      cancelado: "bg-dark",
      renovacao:
        "bg-warning text-dark",
    }

    return (
      classMap[status] ||
      "bg-secondary"
    )
  }
  // =========================================================
  // FILTRO / PESQUISA
  // =========================================================

  const contratosFiltrados =
    useMemo(() => {
      const texto =
        busca
          .trim()
          .toLowerCase()

      return contratos.filter(
        (contrato) => {
          const cliente =
            obterNomeCliente(
              contrato
            ).toLowerCase()

          const imovel =
            obterNomeImovel(
              contrato
            ).toLowerCase()

          const tipo =
            String(
              contrato.tipo || ""
            ).toLowerCase()

          const status =
            String(
              obterStatusLabel(
                contrato.status
              )
            ).toLowerCase()

          const numero =
            String(
              contrato.numero || ""
            ).toLowerCase()

          return (
            !texto ||
            cliente.includes(texto) ||
            imovel.includes(texto) ||
            tipo.includes(texto) ||
            status.includes(texto) ||
            numero.includes(texto)
          )
        }
      )
    }, [
      contratos,
      clientes,
      imoveis,
      busca,
    ])

  // =========================================================
  // RESUMO
  // =========================================================

  const resumo = useMemo(() => {
    const ativos =
      contratos.filter(
        (contrato) =>
          contrato.status ===
          "ativo"
      ).length

    const vencidos =
      contratos.filter(
        (contrato) =>
          contrato.status ===
          "vencido"
      ).length

    const encerrados =
      contratos.filter(
        (contrato) =>
          contrato.status ===
          "encerrado"
      ).length

    const valorAtivo =
      contratos
        .filter(
          (contrato) =>
            contrato.status ===
            "ativo"
        )
        .reduce(
          (total, contrato) =>
            total +
            Number(
              contrato.valor || 0
            ),
          0
        )

    return {
      total: contratos.length,
      ativos,
      vencidos,
      encerrados,
      valorAtivo,
    }
  }, [contratos])

  // =========================================================
  // GERAR NÚMERO DO CONTRATO
  // =========================================================

  function gerarNumeroContrato() {
    const data = new Date()

    const ano =
      data.getFullYear()

    const mes =
      String(
        data.getMonth() + 1
      ).padStart(2, "0")

    const dia =
      String(
        data.getDate()
      ).padStart(2, "0")

    const parteAleatoria =
      Math.floor(
        100000 +
          Math.random() * 900000
      )

    return `CONT-${ano}${mes}${dia}-${parteAleatoria}`
  }

  // =========================================================
  // SALVAR CONTRATO
  // =========================================================

  async function salvarContrato(e) {
    e.preventDefault()

    setSalvando(true)
    setErro("")
    setSucesso("")

    try {
      if (!form.cliente_id) {
        throw new Error(
          "Selecione um cliente."
        )
      }

      if (!form.imovel_id) {
        throw new Error(
          "Selecione um imóvel."
        )
      }

      if (!form.data_inicio) {
        throw new Error(
          "Informe a data de início."
        )
      }

      if (
        form.data_fim &&
        form.data_inicio >
          form.data_fim
      ) {
        throw new Error(
          "A data de término não pode ser anterior à data de início."
        )
      }

      const dadosContrato = {
        cliente_id:
          form.cliente_id
            ? Number(form.cliente_id)
            : null,

        imovel_id:
          form.imovel_id
            ? Number(form.imovel_id)
            : null,

        tipo:
          form.tipo ||
          "Aluguel",

        status:
          form.status ||
          "ativo",

        data_inicio:
          form.data_inicio ||
          null,

        data_fim:
          form.data_fim ||
          null,

        valor:
          form.valor !== ""
            ? Number(form.valor)
            : null,

        dia_vencimento:
          form.dia_vencimento !== ""
            ? Number(
                form.dia_vencimento
              )
            : null,

        observacoes:
          form.observacoes ||
          null,
      }

      let resultado

      // =====================================================
      // EDITAR CONTRATO
      // =====================================================

      if (editando) {
        resultado =
          await supabase
            .from("contratos")
            .update(dadosContrato)
            .eq(
              "id",
              editando.id
            )
            .select()
            .single()
      }

      // =====================================================
      // NOVO CONTRATO
      // =====================================================

      else {
        const novoContrato = {
          ...dadosContrato,

          // CORREÇÃO DO ERRO:
          // A coluna numero é NOT NULL.
          numero:
            gerarNumeroContrato(),
        }

        resultado =
          await supabase
            .from("contratos")
            .insert([
              novoContrato,
            ])
            .select()
            .single()
      }

      if (resultado.error) {
        throw resultado.error
      }

      setSucesso(
        editando
          ? "Contrato atualizado com sucesso!"
          : "Contrato cadastrado com sucesso!"
      )

      setModalAberto(false)
      setEditando(null)
      setForm(
        formularioInicial()
      )

      await carregarDados()
    } catch (error) {
      console.error(
        "Erro ao salvar contrato:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível salvar o contrato."
      )
    } finally {
      setSalvando(false)
    }
  }

  // =========================================================
  // EXCLUIR CONTRATO
  // =========================================================

  async function excluirContrato(
    contrato
  ) {
    const nome =
      obterNomeCliente(
        contrato
      )

    const confirmar =
      window.confirm(
        `Deseja realmente excluir o contrato de ${nome}?`
      )

    if (!confirmar) {
      return
    }

    setErro("")
    setSucesso("")

    try {
      const { error } =
        await supabase
          .from("contratos")
          .delete()
          .eq(
            "id",
            contrato.id
          )

      if (error) {
        throw error
      }

      setSucesso(
        "Contrato excluído com sucesso!"
      )

      await carregarDados()
    } catch (error) {
      console.error(
        "Erro ao excluir contrato:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível excluir o contrato."
      )
    }
  }
  // =========================================================
  // RENDERIZAÇÃO
  // =========================================================

  return (
    <div className="container-fluid py-4">

      {/* =====================================================
          CABEÇALHO
      ===================================================== */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

        <div>
          <h1 className="fw-bold mb-1">
            Contratos
          </h1>

          <p className="text-muted mb-0">
            Gerencie os contratos de locação e venda
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={abrirNovoContrato}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Novo contrato
        </button>

      </div>

      {/* =====================================================
          ACESSO RÁPIDO
      ===================================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            <i className="bi bi-lightning-charge-fill text-warning me-2"></i>
            Acesso rápido
          </h5>

          <div className="row g-2">

            <div className="col-6 col-md-3">

              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() =>
                  acessarPagina("/")}
              >
                <i className="bi bi-house-door me-2"></i>
                Início
              </button>

            </div>

            <div className="col-6 col-md-3">

              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() =>
                  acessarPagina("/clientes")}
              >
                <i className="bi bi-people me-2"></i>
                Clientes
              </button>

            </div>

            <div className="col-6 col-md-3">

              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() =>
                  acessarPagina("/imoveis")}
              >
                <i className="bi bi-building me-2"></i>
                Imóveis
              </button>

            </div>

            <div className="col-6 col-md-3">

              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() =>
                  acessarPagina("/recebimentos")}
              >
                <i className="bi bi-cash-coin me-2"></i>
                Recebimentos
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          ALERTAS
      ===================================================== */}

      {erro && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>

          {erro}

          <button
            type="button"
            className="btn-close"
            onClick={() =>
              setErro("")
            }
          ></button>
        </div>
      )}

      {sucesso && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-check-circle-fill me-2"></i>

          {sucesso}

          <button
            type="button"
            className="btn-close"
            onClick={() =>
              setSucesso("")
            }
          ></button>
        </div>
      )}

      {/* =====================================================
          CARDS DE RESUMO
      ===================================================== */}

      <div className="row g-3 mb-4">

        {/* TOTAL */}

        <div className="col-12 col-sm-6 col-xl-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">
                    Total de contratos
                  </p>

                  <h3 className="fw-bold mb-0">
                    {resumo.total}
                  </h3>

                </div>

                <div className="fs-1 text-primary">
                  <i className="bi bi-file-earmark-text"></i>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ATIVOS */}

        <div className="col-12 col-sm-6 col-xl-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">
                    Contratos ativos
                  </p>

                  <h3 className="fw-bold text-success mb-0">
                    {resumo.ativos}
                  </h3>

                </div>

                <div className="fs-1 text-success">
                  <i className="bi bi-check-circle"></i>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* VENCIDOS */}

        <div className="col-12 col-sm-6 col-xl-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">
                    Vencidos
                  </p>

                  <h3 className="fw-bold text-danger mb-0">
                    {resumo.vencidos}
                  </h3>

                </div>

                <div className="fs-1 text-danger">
                  <i className="bi bi-exclamation-circle"></i>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* VALOR */}

        <div className="col-12 col-sm-6 col-xl-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">
                    Valor dos ativos
                  </p>

                  <h3 className="fw-bold text-primary mb-0">
                    {formatarMoeda(
                      resumo.valorAtivo
                    )}
                  </h3>

                </div>

                <div className="fs-1 text-primary">
                  <i className="bi bi-currency-dollar"></i>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          PESQUISA
      ===================================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="row g-3 align-items-end">

            <div className="col-12 col-md-9">

              <label className="form-label fw-semibold">
                Pesquisar contratos
              </label>

              <div className="input-group">

                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Cliente, imóvel, número, tipo ou status..."
                  value={busca}
                  onChange={(e) =>
                    setBusca(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            <div className="col-12 col-md-3">

              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() =>
                  setBusca("")
                }
              >
                <i className="bi bi-x-circle me-2"></i>
                Limpar pesquisa
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          TABELA
      ===================================================== */}

      <div className="card shadow-sm border-0">

        <div className="card-body">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">

            <div>

              <h5 className="fw-bold mb-1">
                Lista de contratos
              </h5>

              <p className="text-muted mb-0">
                {contratosFiltrados.length} contrato(s) encontrado(s)
              </p>

            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={abrirNovoContrato}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Novo contrato
            </button>

          </div>

          {loading ? (
            <div className="text-center py-5">

              <div
                className="spinner-border text-primary"
                role="status"
              >
                <span className="visually-hidden">
                  Carregando...
                </span>
              </div>

              <p className="text-muted mt-3 mb-0">
                Carregando contratos...
              </p>

            </div>
          ) : contratosFiltrados.length === 0 ? (

            <div className="text-center py-5">

              <i className="bi bi-file-earmark-x fs-1 text-muted"></i>

              <h5 className="mt-3">
                Nenhum contrato encontrado
              </h5>

              <p className="text-muted">
                Cadastre um novo contrato para começar.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={abrirNovoContrato}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Novo contrato
              </button>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th>
                      Número
                    </th>

                    <th>
                      Cliente
                    </th>

                    <th>
                      Imóvel
                    </th>

                    <th>
                      Tipo
                    </th>

                    <th>
                      Período
                    </th>

                    <th>
                      Valor
                    </th>

                    <th>
                      Status
                    </th>

                    <th className="text-end">
                      Ações
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {contratosFiltrados.map(
                    (contrato) => (

                      <tr
                        key={
                          contrato.id
                        }
                      >

                        <td>
                          <span className="fw-semibold">
                            {contrato.numero ||
                              "-"}
                          </span>
                        </td>

                        <td>
                          <div className="fw-semibold">
                            {obterNomeCliente(
                              contrato
                            )}
                          </div>
                        </td>

                        <td>
                          {obterNomeImovel(
                            contrato
                          )}
                        </td>

                        <td>
                          {contrato.tipo ||
                            "-"}
                        </td>

                        <td>

                          <small className="text-muted">
                            {formatarData(
                              contrato.data_inicio
                            )}

                            {" até "}

                            {contrato.data_fim
                              ? formatarData(
                                  contrato.data_fim
                                )
                              : "Indeterminado"}
                          </small>

                        </td>

                        <td className="fw-semibold">
                          {formatarMoeda(
                            contrato.valor
                          )}
                        </td>

                        <td>

                          <span
                            className={`badge ${obterStatusClass(
                              contrato.status
                            )}`}
                          >
                            {obterStatusLabel(
                              contrato.status
                            )}
                          </span>

                        </td>

                        <td>

                          <div className="d-flex justify-content-end gap-1">

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              title="Editar contrato"
                              onClick={() =>
                                abrirEditarContrato(
                                  contrato
                                )
                              }
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              title="Excluir contrato"
                              onClick={() =>
                                excluirContrato(
                                  contrato
                                )
                              }
                            >
                              <i className="bi bi-trash"></i>
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
      {/* =====================================================
          MODAL - NOVO / EDITAR CONTRATO
      ===================================================== */}

      {modalAberto && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.5)",
          }}
        >

          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">

            <div className="modal-content">

              {/* =================================================
                  CABEÇALHO DO MODAL
              ================================================= */}

              <div className="modal-header">

                <div>

                  <h5 className="modal-title fw-bold mb-1">

                    <i className="bi bi-file-earmark-text me-2"></i>

                    {editando
                      ? "Editar contrato"
                      : "Novo contrato"}

                  </h5>

                  <small className="text-muted">

                    {editando
                      ? `Contrato ${editando.numero || ""}`
                      : "Preencha os dados do contrato"}

                  </small>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Fechar"
                  onClick={fecharModal}
                  disabled={salvando}
                ></button>

              </div>

              {/* =================================================
                  FORMULÁRIO
              ================================================= */}

              <form onSubmit={salvarContrato}>

                <div className="modal-body">

                  {/* =============================================
                      INFORMAÇÕES PRINCIPAIS
                  ============================================= */}

                  <div className="card border-0 bg-light mb-4">

                    <div className="card-body">

                      <h6 className="fw-bold mb-3">

                        <i className="bi bi-info-circle me-2"></i>

                        Informações do contrato

                      </h6>

                      <div className="row g-3">

                        {/* CLIENTE */}

                        <div className="col-12 col-md-6">

                          <label className="form-label fw-semibold">
                            Cliente
                            <span className="text-danger">
                              {" "}*
                            </span>
                          </label>

                          <select
                            className="form-select"
                            value={
                              form.cliente_id
                            }
                            onChange={(e) =>
                              alterarCampo(
                                "cliente_id",
                                e.target.value
                              )
                            }
                            required
                          >

                            <option value="">
                              Selecione o cliente
                            </option>

                            {clientes.map(
                              (cliente) => (

                                <option
                                  key={
                                    cliente.id
                                  }
                                  value={
                                    cliente.id
                                  }
                                >
                                  {cliente.nome}
                                </option>

                              )
                            )}

                          </select>

                        </div>

                        {/* IMÓVEL */}

                        <div className="col-12 col-md-6">

                          <label className="form-label fw-semibold">
                            Imóvel
                            <span className="text-danger">
                              {" "}*
                            </span>
                          </label>

                          <select
                            className="form-select"
                            value={
                              form.imovel_id
                            }
                            onChange={(e) =>
                              alterarCampo(
                                "imovel_id",
                                e.target.value
                              )
                            }
                            required
                          >

                            <option value="">
                              Selecione o imóvel
                            </option>

                            {imoveis.map(
                              (imovel) => (

                                <option
                                  key={
                                    imovel.id
                                  }
                                  value={
                                    imovel.id
                                  }
                                >
                                  {obterNomeImovel(
                                    {
                                      imovel_id:
                                        imovel.id,
                                    }
                                  )}
                                </option>

                              )
                            )}

                          </select>

                        </div>

                        {/* TIPO */}

                        <div className="col-12 col-md-6">

                          <label className="form-label fw-semibold">
                            Tipo de contrato
                          </label>

                          <select
                            className="form-select"
                            value={
                              form.tipo
                            }
                            onChange={(e) =>
                              alterarCampo(
                                "tipo",
                                e.target.value
                              )
                            }
                          >

                            <option value="Aluguel">
                              Aluguel
                            </option>

                            <option value="Venda">
                              Venda
                            </option>

                            <option value="Temporada">
                              Temporada
                            </option>

                            <option value="Outro">
                              Outro
                            </option>

                          </select>

                        </div>

                        {/* STATUS */}

                        <div className="col-12 col-md-6">

                          <label className="form-label fw-semibold">
                            Status
                          </label>

                          <select
                            className="form-select"
                            value={
                              form.status
                            }
                            onChange={(e) =>
                              alterarCampo(
                                "status",
                                e.target.value
                              )
                            }
                          >

                            <option value="ativo">
                              Ativo
                            </option>

                            <option value="encerrado">
                              Encerrado
                            </option>

                            <option value="vencido">
                              Vencido
                            </option>

                            <option value="cancelado">
                              Cancelado
                            </option>

                            <option value="renovacao">
                              Em renovação
                            </option>

                          </select>

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* =============================================
                      PERÍODO
                  ============================================= */}

                  <div className="card border-0 bg-light mb-4">

                    <div className="card-body">

                      <h6 className="fw-bold mb-3">

                        <i className="bi bi-calendar3 me-2"></i>

                        Período do contrato

                      </h6>

                      <div className="row g-3">

                        {/* DATA INÍCIO */}

                        <div className="col-12 col-md-6">

                          <label className="form-label fw-semibold">
                            Data de início
                            <span className="text-danger">
                              {" "}*
                            </span>
                          </label>

                          <input
                            type="date"
                            className="form-control"
                            value={
                              form.data_inicio
                            }
                            onChange={(e) =>
                              alterarCampo(
                                "data_inicio",
                                e.target.value
                              )
                            }
                            required
                          />

                        </div>

                        {/* DATA FIM */}

                        <div className="col-12 col-md-6">

                          <label className="form-label fw-semibold">
                            Data de término
                          </label>

                          <input
                            type="date"
                            className="form-control"
                            value={
                              form.data_fim
                            }
                            onChange={(e) =>
                              alterarCampo(
                                "data_fim",
                                e.target.value
                              )
                            }
                            min={
                              form.data_inicio ||
                              undefined
                            }
                          />

                          <div className="form-text">
                            Deixe em branco caso o contrato não tenha data de término definida.
                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* =============================================
                      VALORES
                  ============================================= */}

                  <div className="card border-0 bg-light mb-4">

                    <div className="card-body">

                      <h6 className="fw-bold mb-3">

                        <i className="bi bi-cash-stack me-2"></i>

                        Valores e vencimento

                      </h6>

                      <div className="row g-3">

                        {/* VALOR */}

                        <div className="col-12 col-md-6">

                          <label className="form-label fw-semibold">
                            Valor
                          </label>

                          <div className="input-group">

                            <span className="input-group-text">
                              R$
                            </span>

                            <input
                              type="number"
                              className="form-control"
                              placeholder="0,00"
                              min="0"
                              step="0.01"
                              value={
                                form.valor
                              }
                              onChange={(e) =>
                                alterarCampo(
                                  "valor",
                                  e.target.value
                                )
                              }
                            />

                          </div>

                        </div>

                        {/* DIA VENCIMENTO */}

                        <div className="col-12 col-md-6">

                          <label className="form-label fw-semibold">
                            Dia de vencimento
                          </label>

                          <select
                            className="form-select"
                            value={
                              form.dia_vencimento
                            }
                            onChange={(e) =>
                              alterarCampo(
                                "dia_vencimento",
                                e.target.value
                              )
                            }
                          >

                            {Array.from(
                              {
                                length: 31,
                              },
                              (_, indice) =>
                                indice + 1
                            ).map(
                              (dia) => (

                                <option
                                  key={dia}
                                  value={dia}
                                >
                                  Dia {dia}
                                </option>

                              )
                            )}

                          </select>

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* =============================================
                      OBSERVAÇÕES
                  ============================================= */}

                  <div className="card border-0 bg-light">

                    <div className="card-body">

                      <h6 className="fw-bold mb-3">

                        <i className="bi bi-chat-left-text me-2"></i>

                        Observações

                      </h6>

                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Informações adicionais sobre o contrato..."
                        value={
                          form.observacoes
                        }
                        onChange={(e) =>
                          alterarCampo(
                            "observacoes",
                            e.target.value
                          )
                        }
                      ></textarea>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    RODAPÉ
                ================================================= */}

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={fecharModal}
                    disabled={salvando}
                  >
                    <i className="bi bi-x-lg me-2"></i>
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={salvando}
                  >

                    {salvando ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>

                        Salvando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>

                        {editando
                          ? "Salvar alterações"
                          : "Cadastrar contrato"}
                      </>
                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}
