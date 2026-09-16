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
    reajuste: "",
    observacoes: "",
  })

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
          .select(`
            *,
            clientes (
              id,
              nome,
              cpf,
              telefone,
              email
            ),
            imoveis (
              id,
              codigo,
              titulo,
              endereco
            )
          `)
          .order("id", { ascending: false }),

        supabase
          .from("clientes")
          .select("*")
          .order("nome", { ascending: true }),

        supabase
          .from("imoveis")
          .select("*")
          .order("id", { ascending: false }),
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

  function limparMensagens() {
    setErro("")
    setSucesso("")
  }

  function fecharMensagemSucesso() {
    setSucesso("")
  }

  function acessarPagina(url) {
    window.location.href = url
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
      reajuste: "",
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
        contrato.cliente_id?.toString() || "",

      imovel_id:
        contrato.imovel_id?.toString() || "",

      tipo:
        contrato.tipo || "Aluguel",

      status:
        contrato.status || "ativo",

      data_inicio:
        contrato.data_inicio || "",

      data_fim:
        contrato.data_fim || "",

      valor:
        contrato.valor ?? "",

      dia_vencimento:
        contrato.dia_vencimento?.toString() || "10",

      reajuste:
        contrato.reajuste ?? "",

      observacoes:
        contrato.observacoes || "",
    })

    setModalAberto(true)
  }

  function fecharModal() {
    if (salvando) return

    setModalAberto(false)
    setEditando(null)
  }

  function alterarCampo(campo, valor) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }

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

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  function obterNomeCliente(contrato) {
    return (
      contrato.clientes?.nome ||
      clientes.find(
        (cliente) =>
          String(cliente.id) ===
          String(contrato.cliente_id)
      )?.nome ||
      "Cliente não informado"
    )
  }

  function obterNomeImovel(contrato) {
    const imovel =
      contrato.imoveis ||
      imoveis.find(
        (item) =>
          String(item.id) ===
          String(contrato.imovel_id)
      )

    if (!imovel) {
      return "Imóvel não informado"
    }

    return (
      imovel.titulo ||
      imovel.codigo ||
      imovel.endereco ||
      "Imóvel"
    )
  }

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
      renovacao: "bg-warning text-dark",
    }

    return (
      classMap[status] ||
      "bg-secondary"
    )
  }

  const contratosFiltrados = useMemo(() => {
    const termo = busca
      .trim()
      .toLowerCase()

    if (!termo) {
      return contratos
    }

    return contratos.filter((contrato) => {
      const cliente =
        obterNomeCliente(contrato)
          .toLowerCase()

      const imovel =
        obterNomeImovel(contrato)
          .toLowerCase()

      const tipo = String(
        contrato.tipo || ""
      ).toLowerCase()

      const status = String(
        contrato.status || ""
      ).toLowerCase()

      const valor = String(
        contrato.valor || ""
      ).toLowerCase()

      return (
        cliente.includes(termo) ||
        imovel.includes(termo) ||
        tipo.includes(termo) ||
        status.includes(termo) ||
        valor.includes(termo)
      )
    })
  }, [
    contratos,
    clientes,
    imoveis,
    busca,
  ])

  const resumo = useMemo(() => {
    const ativos = contratos.filter(
      (contrato) =>
        contrato.status === "ativo"
    ).length

    const valorAtivo = contratos
      .filter(
        (contrato) =>
          contrato.status === "ativo"
      )
      .reduce(
        (total, contrato) =>
          total +
          Number(contrato.valor || 0),
        0
      )

    return {
      total: contratos.length,
      resultados:
        contratosFiltrados.length,
      ativos,
      valorAtivo,
    }
  }, [
    contratos,
    contratosFiltrados,
  ])

  async function salvarContrato(e) {
    e.preventDefault()

    limparMensagens()

    if (!form.cliente_id) {
      setErro("Selecione um cliente.")
      return
    }

    if (!form.imovel_id) {
      setErro("Selecione um imóvel.")
      return
    }

    if (!form.data_inicio) {
      setErro("Informe a data de início.")
      return
    }

    if (!form.valor) {
      setErro("Informe o valor do contrato.")
      return
    }

    setSalvando(true)

    try {
      const dados = {
        cliente_id:
          Number(form.cliente_id),

        imovel_id:
          Number(form.imovel_id),

        tipo:
          form.tipo,

        status:
          form.status,

        data_inicio:
          form.data_inicio,

        data_fim:
          form.data_fim || null,

        valor:
          Number(form.valor),

        dia_vencimento:
          Number(
            form.dia_vencimento || 10
          ),

        reajuste:
          form.reajuste === ""
            ? null
            : Number(form.reajuste),

        observacoes:
          form.observacoes.trim() ||
          null,
      }

      if (editando?.id) {
        const { error } =
          await supabase
            .from("contratos")
            .update(dados)
            .eq("id", editando.id)

        if (error) {
          throw error
        }

        setSucesso(
          "Contrato atualizado com sucesso."
        )
      } else {
        const { error } =
          await supabase
            .from("contratos")
            .insert([dados])

        if (error) {
          throw error
        }

        setSucesso(
          "Contrato cadastrado com sucesso."
        )
      }

      await carregarDados()

      setModalAberto(false)
      setEditando(null)
      setForm(formularioInicial())
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

  async function excluirContrato(contrato) {
    const confirmar =
      window.confirm(
        `Deseja realmente excluir o contrato de ${obterNomeCliente(
          contrato
        )}?`
      )

    if (!confirmar) {
      return
    }

    limparMensagens()

    try {
      const { error } =
        await supabase
          .from("contratos")
          .delete()
          .eq("id", contrato.id)

      if (error) {
        throw error
      }

      setSucesso(
        "Contrato excluído com sucesso."
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
  return (
    <div className="container-fluid py-4">

      {/* CABEÇALHO */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Contratos
          </h2>

          <p className="text-muted mb-0">
            Gerencie os contratos da imobiliária
          </p>
        </div>

        <div className="d-flex gap-2 mt-3 mt-md-0">

          <button
            className="btn btn-outline-primary"
            onClick={carregarDados}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Atualizar
          </button>

          <button
            className="btn btn-primary"
            onClick={abrirNovoContrato}
          >
            <i className="bi bi-file-earmark-plus me-2"></i>
            Novo contrato
          </button>

        </div>

      </div>

      {/* ERRO */}
      {erro && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle me-2"></i>

          {erro}

          <button
            type="button"
            className="btn-close"
            onClick={() => setErro("")}
          ></button>
        </div>
      )}

      {/* SUCESSO */}
      {sucesso && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-check-circle me-2"></i>

          {sucesso}

          <button
            type="button"
            className="btn-close"
            onClick={fecharMensagemSucesso}
          ></button>
        </div>
      )}

      {/* ACESSO RÁPIDO */}
      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex align-items-center mb-3">

            <div
              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
              style={{
                width: "38px",
                height: "38px",
              }}
            >
              <i className="bi bi-lightning-charge text-primary"></i>
            </div>

            <div>
              <h5 className="fw-bold mb-0">
                Acesso rápido
              </h5>

              <small className="text-muted">
                Acesse rapidamente as principais áreas
              </small>
            </div>

          </div>

          <div className="row g-2">

            {/* DASHBOARD */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/")
                }
              >
                <i className="bi bi-speedometer2 d-block fs-5 mb-1"></i>
                Dashboard
              </button>

            </div>

            {/* CLIENTES */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/clientes")
                }
              >
                <i className="bi bi-people d-block fs-5 mb-1"></i>
                Clientes
              </button>

            </div>

            {/* IMÓVEIS */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/imoveis")
                }
              >
                <i className="bi bi-house-door d-block fs-5 mb-1"></i>
                Imóveis
              </button>

            </div>

            {/* CONTRATOS */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                className="btn btn-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/contratos")
                }
              >
                <i className="bi bi-file-earmark-text d-block fs-5 mb-1"></i>
                Contratos
              </button>

            </div>

            {/* RECEBIMENTOS */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/recebimentos")
                }
              >
                <i className="bi bi-cash-coin d-block fs-5 mb-1"></i>
                Recebimentos
              </button>

            </div>

            {/* DESPESAS */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/despesas")
                }
              >
                <i className="bi bi-wallet2 d-block fs-5 mb-1"></i>
                Despesas
              </button>

            </div>

            {/* FINANCEIRO */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/financeiro")
                }
              >
                <i className="bi bi-bar-chart-line d-block fs-5 mb-1"></i>
                Financeiro
              </button>

            </div>

            {/* MANUTENÇÕES */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/manutencoes")
                }
              >
                <i className="bi bi-tools d-block fs-5 mb-1"></i>
                Manutenções
              </button>

            </div>

            {/* VISITAS */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/visitas")
                }
              >
                <i className="bi bi-calendar-check d-block fs-5 mb-1"></i>
                Visitas
              </button>

            </div>

            {/* COMUNICAÇÃO */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/comunicacao")
                }
              >
                <i className="bi bi-whatsapp d-block fs-5 mb-1"></i>
                Comunicação
              </button>

            </div>

            {/* RELATÓRIOS */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/relatorios")
                }
              >
                <i className="bi bi-file-earmark-bar-graph d-block fs-5 mb-1"></i>
                Relatórios
              </button>

            </div>

            {/* CONFIGURAÇÕES */}
            <div className="col-6 col-md-3 col-lg-2">

              <button
                className="btn btn-outline-primary w-100 py-2"
                onClick={() =>
                  acessarPagina("/configuracoes")
                }
              >
                <i className="bi bi-gear d-block fs-5 mb-1"></i>
                Configurações
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* RESUMO */}
      <div className="row g-3 mb-4">

        {/* TOTAL DE CONTRATOS */}
        <div className="col-12 col-md-4">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>

                  <p className="text-muted mb-1">
                    Total de contratos
                  </p>

                  <h3 className="fw-bold mb-0">
                    {resumo.total}
                  </h3>

                </div>

                <div
                  className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-file-earmark-text text-primary fs-4"></i>
                </div>

              </div>

              <small className="text-muted d-block mt-3">
                Contratos cadastrados no sistema
              </small>

            </div>

          </div>

        </div>

        {/* RESULTADOS */}
        <div className="col-12 col-md-4">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>

                  <p className="text-muted mb-1">
                    Resultados
                  </p>

                  <h3 className="fw-bold mb-0">
                    {resumo.resultados}
                  </h3>

                </div>

                <div
                  className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-search text-info fs-4"></i>
                </div>

              </div>

              <small className="text-muted d-block mt-3">
                Contratos encontrados na pesquisa
              </small>

            </div>

          </div>

        </div>

        {/* ATIVOS */}
        <div className="col-12 col-md-4">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start">

                <div>

                  <p className="text-muted mb-1">
                    Contratos ativos
                  </p>

                  <h3 className="fw-bold mb-0">
                    {resumo.ativos}
                  </h3>

                </div>

                <div
                  className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <i className="bi bi-check-circle text-success fs-4"></i>
                </div>

              </div>

              <small className="text-muted d-block mt-3">
                Contratos atualmente ativos
              </small>

            </div>

          </div>

        </div>

      </div>
      {/* LISTA DE CONTRATOS */}
      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          {/* CABEÇALHO DA LISTA */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">

            <div>
              <h5 className="fw-bold mb-1">
                Contratos cadastrados
              </h5>

              <small className="text-muted">
                Consulte e gerencie os contratos da imobiliária
              </small>
            </div>

            <button
              type="button"
              className="btn btn-primary mt-3 mt-md-0"
              onClick={abrirNovoContrato}
            >
              <i className="bi bi-file-earmark-plus me-2"></i>
              Novo contrato
            </button>

          </div>

          {/* PESQUISA */}
          <div className="row g-2 mb-3">

            <div className="col-12 col-md-9">

              <div className="input-group">

                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por cliente, imóvel, tipo ou status..."
                  value={busca}
                  onChange={(e) =>
                    setBusca(e.target.value)
                  }
                />

                {busca && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setBusca("")}
                    title="Limpar pesquisa"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}

              </div>

            </div>

            <div className="col-12 col-md-3">

              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={carregarDados}
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Atualizando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Atualizar lista
                  </>
                )}

              </button>

            </div>

          </div>

          {/* INFORMAÇÕES DA PESQUISA */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">

            <small className="text-muted">

              {busca ? (
                <>
                  Exibindo{" "}
                  <strong>
                    {contratosFiltrados.length}
                  </strong>{" "}
                  de{" "}
                  <strong>
                    {contratos.length}
                  </strong>{" "}
                  contratos
                </>
              ) : (
                <>
                  <strong>
                    {contratos.length}
                  </strong>{" "}
                  contrato(s) cadastrado(s)
                </>
              )}

            </small>

            {busca && (
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none"
                onClick={() => setBusca("")}
              >
                Limpar pesquisa
              </button>
            )}

          </div>

          {/* CARREGANDO */}
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

            /* ESTADO VAZIO */
            <div className="text-center py-5">

              <div
                className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "64px",
                  height: "64px",
                }}
              >
                <i className="bi bi-file-earmark-text text-primary fs-3"></i>
              </div>

              <h5 className="fw-bold">
                Nenhum contrato encontrado
              </h5>

              <p className="text-muted mb-3">

                {busca
                  ? "Nenhum contrato corresponde à pesquisa."
                  : "Ainda não existem contratos cadastrados."}

              </p>

              {busca ? (

                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => setBusca("")}
                >
                  <i className="bi bi-arrow-counterclockwise me-2"></i>
                  Limpar pesquisa
                </button>

              ) : (

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={abrirNovoContrato}
                >
                  <i className="bi bi-file-earmark-plus me-2"></i>
                  Novo contrato
                </button>

              )}

            </div>

          ) : (

            /* TABELA */
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

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
                      Vencimento
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

                      <tr key={contrato.id}>

                        {/* CLIENTE */}
                        <td>

                          <div className="d-flex align-items-center">

                            <div
                              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                              style={{
                                width: "40px",
                                height: "40px",
                              }}
                            >
                              <i className="bi bi-person text-primary"></i>
                            </div>

                            <div>

                              <div className="fw-semibold">
                                {obterNomeCliente(
                                  contrato
                                )}
                              </div>

                              {contrato.clientes?.cpf && (
                                <small className="text-muted">
                                  CPF:{" "}
                                  {contrato.clientes.cpf}
                                </small>
                              )}

                            </div>

                          </div>

                        </td>

                        {/* IMÓVEL */}
                        <td>

                          <div className="d-flex align-items-center">

                            <div
                              className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                              style={{
                                width: "40px",
                                height: "40px",
                              }}
                            >
                              <i className="bi bi-house-door text-success"></i>
                            </div>

                            <div>

                              <div className="fw-semibold">
                                {obterNomeImovel(
                                  contrato
                                )}
                              </div>

                              {contrato.imoveis?.codigo && (
                                <small className="text-muted">
                                  Código:{" "}
                                  {contrato.imoveis.codigo}
                                </small>
                              )}

                            </div>

                          </div>

                        </td>

                        {/* TIPO */}
                        <td>

                          <span className="badge bg-light text-dark border">

                            {contrato.tipo || "-"}

                          </span>

                        </td>

                        {/* PERÍODO */}
                        <td>

                          <div>

                            <small className="text-muted">
                              Início
                            </small>

                            <div className="fw-semibold">
                              {formatarData(
                                contrato.data_inicio
                              )}
                            </div>

                          </div>

                          <div className="mt-1">

                            <small className="text-muted">
                              Término
                            </small>

                            <div>
                              {formatarData(
                                contrato.data_fim
                              )}
                            </div>

                          </div>

                        </td>

                        {/* VALOR */}
                        <td>

                          <div className="fw-semibold text-success">
                            {formatarMoeda(
                              contrato.valor
                            )}
                          </div>

                          {contrato.reajuste !==
                            null &&
                            contrato.reajuste !==
                              undefined &&
                            contrato.reajuste !==
                              "" && (

                              <small className="text-muted">
                                Reajuste:{" "}
                                {contrato.reajuste}%
                              </small>

                            )}

                        </td>

                        {/* VENCIMENTO */}
                        <td>

                          <div className="fw-semibold">
                            Dia{" "}
                            {contrato.dia_vencimento ||
                              "-"}
                          </div>

                          <small className="text-muted">
                            vencimento
                          </small>

                        </td>

                        {/* STATUS */}
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

                        {/* AÇÕES */}
                        <td className="text-end">

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
      {/* MODAL NOVO / EDITAR CONTRATO */}
      {modalAberto && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >

          <div
            className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
            role="document"
          >

            <div className="modal-content border-0 shadow">

              {/* CABEÇALHO DO MODAL */}
              <div className="modal-header">

                <div>

                  <h5 className="modal-title fw-bold">

                    <i className="bi bi-file-earmark-text me-2 text-primary"></i>

                    {editando
                      ? "Editar contrato"
                      : "Novo contrato"}

                  </h5>

                  <small className="text-muted">

                    {editando
                      ? "Atualize os dados do contrato."
                      : "Cadastre um novo contrato."}

                  </small>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={fecharModal}
                  disabled={salvando}
                ></button>

              </div>

              {/* FORMULÁRIO */}
              <form onSubmit={salvarContrato}>

                <div className="modal-body">

                  {/* DADOS DO CONTRATO */}
                  <div className="card border-0 bg-light mb-4">

                    <div className="card-body">

                      <h6 className="fw-bold mb-3">

                        <i className="bi bi-file-earmark-text me-2 text-primary"></i>

                        Dados do contrato

                      </h6>

                      <div className="row g-3">

                        {/* CLIENTE */}
                        <div className="col-12 col-md-6">

                          <label className="form-label fw-semibold">
                            Cliente *
                          </label>

                          <select
                            className="form-select"
                            value={form.cliente_id}
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
                                  key={cliente.id}
                                  value={cliente.id}
                                >
                                  {cliente.nome}
                                </option>
                              )
                            )}

                          </select>

                          <small className="text-muted">
                            Selecione o cliente relacionado ao contrato.
                          </small>

                        </div>

                        {/* IMÓVEL */}
                        <div className="col-12 col-md-6">

                          <label className="form-label fw-semibold">
                            Imóvel *
                          </label>

                          <select
                            className="form-select"
                            value={form.imovel_id}
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
                                  key={imovel.id}
                                  value={imovel.id}
                                >
                                  {imovel.codigo
                                    ? `${imovel.codigo} - `
                                    : ""}
                                  {imovel.titulo ||
                                    imovel.endereco ||
                                    "Imóvel"}
                                </option>
                              )
                            )}

                          </select>

                          <small className="text-muted">
                            Selecione o imóvel relacionado ao contrato.
                          </small>

                        </div>

                        {/* TIPO */}
                        <div className="col-12 col-md-6">

                          <label className="form-label fw-semibold">
                            Tipo de contrato
                          </label>

                          <select
                            className="form-select"
                            value={form.tipo}
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

                            <option value="Temporada">
                              Temporada
                            </option>

                            <option value="Comercial">
                              Comercial
                            </option>

                            <option value="Residencial">
                              Residencial
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
                            value={form.status}
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

                  {/* VALORES E PERÍODO */}
                  <div className="card border-0 bg-light mb-4">

                    <div className="card-body">

                      <h6 className="fw-bold mb-3">

                        <i className="bi bi-cash-stack me-2 text-success"></i>

                        Valores e período

                      </h6>

                      <div className="row g-3">

                        {/* DATA DE INÍCIO */}
                        <div className="col-12 col-md-6">

                          <label className="form-label fw-semibold">
                            Data de início *
                          </label>

                          <input
                            type="date"
                            className="form-control"
                            value={form.data_inicio}
                            onChange={(e) =>
                              alterarCampo(
                                "data_inicio",
                                e.target.value
                              )
                            }
                            required
                          />

                        </div>

                        {/* DATA DE TÉRMINO */}
                        <div className="col-12 col-md-6">

                          <label className="form-label fw-semibold">
                            Data de término
                          </label>

                          <input
                            type="date"
                            className="form-control"
                            value={form.data_fim}
                            onChange={(e) =>
                              alterarCampo(
                                "data_fim",
                                e.target.value
                              )
                            }
                          />

                        </div>

                        {/* VALOR */}
                        <div className="col-12 col-md-6">

                          <label className="form-label fw-semibold">
                            Valor do contrato *
                          </label>

                          <div className="input-group">

                            <span className="input-group-text">
                              R$
                            </span>

                            <input
                              type="number"
                              className="form-control"
                              min="0"
                              step="0.01"
                              value={form.valor}
                              onChange={(e) =>
                                alterarCampo(
                                  "valor",
                                  e.target.value
                                )
                              }
                              placeholder="0,00"
                              required
                            />

                          </div>

                        </div>

                        {/* DIA DE VENCIMENTO */}
                        <div className="col-12 col-md-3">

                          <label className="form-label fw-semibold">
                            Dia de vencimento
                          </label>

                          <input
                            type="number"
                            className="form-control"
                            min="1"
                            max="31"
                            value={form.dia_vencimento}
                            onChange={(e) =>
                              alterarCampo(
                                "dia_vencimento",
                                e.target.value
                              )
                            }
                          />

                        </div>

                        {/* REAJUSTE */}
                        <div className="col-12 col-md-3">

                          <label className="form-label fw-semibold">
                            Reajuste
                          </label>

                          <div className="input-group">

                            <input
                              type="number"
                              className="form-control"
                              min="0"
                              step="0.01"
                              value={form.reajuste}
                              onChange={(e) =>
                                alterarCampo(
                                  "reajuste",
                                  e.target.value
                                )
                              }
                              placeholder="0"
                            />

                            <span className="input-group-text">
                              %
                            </span>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* OBSERVAÇÕES */}
                  <div className="card border-0 bg-light">

                    <div className="card-body">

                      <h6 className="fw-bold mb-3">

                        <i className="bi bi-chat-left-text me-2 text-primary"></i>

                        Observações

                      </h6>

                      <textarea
                        className="form-control"
                        rows="5"
                        value={form.observacoes}
                        onChange={(e) =>
                          alterarCampo(
                            "observacoes",
                            e.target.value
                          )
                        }
                        placeholder="Digite informações adicionais sobre o contrato..."
                      ></textarea>

                    </div>

                  </div>

                </div>

                {/* RODAPÉ */}
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