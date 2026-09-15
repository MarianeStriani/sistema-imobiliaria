"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Imoveis() {
  const [imoveis, setImoveis] = useState([])

  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")

  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos")

  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)

  const [form, setForm] = useState({
    codigo: "",
    titulo: "",
    tipo: "casa",
    finalidade: "residencial",
    status: "disponivel",
    valor: "",
    quartos: "",
    banheiros: "",
    vagas: "",
    area: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    descricao: "",
    observacoes: "",
  })

  // ============================================================
  // CARREGAR IMÓVEIS
  // ============================================================

  async function carregarImoveis() {
    setLoading(true)
    setErro("")

    const { data, error } = await supabase
      .from("imoveis")
      .select("*")
      .order("id", { ascending: false })

    if (error) {
      console.error(error)
      setErro(`Erro ao carregar imóveis: ${error.message}`)
      setImoveis([])
    } else {
      setImoveis(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    carregarImoveis()
  }, [])

  // ============================================================
  // NOVO IMÓVEL
  // ============================================================

  function abrirNovoImovel() {
    setEditando(null)

    setForm({
      codigo: "",
      titulo: "",
      tipo: "casa",
      finalidade: "residencial",
      status: "disponivel",
      valor: "",
      quartos: "",
      banheiros: "",
      vagas: "",
      area: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      descricao: "",
      observacoes: "",
    })

    setErro("")
    setSucesso("")
    setModalAberto(true)
  }

  // ============================================================
  // EDITAR IMÓVEL
  // ============================================================

  function abrirEditarImovel(imovel) {
    setEditando(imovel)

    setForm({
      codigo: imovel.codigo || "",
      titulo: imovel.titulo || "",
      tipo: imovel.tipo || "casa",
      finalidade: imovel.finalidade || "residencial",
      status: imovel.status || "disponivel",
      valor: imovel.valor ?? "",
      quartos: imovel.quartos ?? "",
      banheiros: imovel.banheiros ?? "",
      vagas: imovel.vagas ?? "",
      area: imovel.area ?? "",
      endereco: imovel.endereco || "",
      numero: imovel.numero || "",
      complemento: imovel.complemento || "",
      bairro: imovel.bairro || "",
      cidade: imovel.cidade || "",
      estado: imovel.estado || "",
      cep: imovel.cep || "",
      descricao: imovel.descricao || "",
      observacoes: imovel.observacoes || "",
    })

    setErro("")
    setSucesso("")
    setModalAberto(true)
  }

  // ============================================================
  // FECHAR MODAL
  // ============================================================

  function fecharModal() {
    if (salvando) return

    setModalAberto(false)
    setEditando(null)
  }

  // ============================================================
  // ALTERAR FORMULÁRIO
  // ============================================================

  function alterarCampo(campo, valor) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }

  // ============================================================
  // NAVEGAÇÃO
  // ============================================================

  function acessarPagina(url) {
    window.location.href = url
  }

  // ============================================================
  // FILTRO
  // ============================================================

  const imoveisFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    return imoveis.filter((imovel) => {
      const correspondeStatus =
        filtroStatus === "todos" ||
        String(imovel.status || "").toLowerCase() === filtroStatus

      if (!correspondeStatus) {
        return false
      }

      if (!termo) {
        return true
      }

      const texto = [
        imovel.codigo,
        imovel.titulo,
        imovel.tipo,
        imovel.finalidade,
        imovel.endereco,
        imovel.numero,
        imovel.bairro,
        imovel.cidade,
        imovel.estado,
        imovel.cep,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return texto.includes(termo)
    })
  }, [imoveis, busca, filtroStatus])
  // ============================================================
  // SALVAR IMÓVEL
  // ============================================================

  async function salvarImovel(e) {
    e.preventDefault()

    setErro("")
    setSucesso("")

    if (!form.titulo.trim()) {
      setErro("Informe o título do imóvel.")
      return
    }

    if (!form.tipo) {
      setErro("Informe o tipo do imóvel.")
      return
    }

    if (!form.status) {
      setErro("Informe a situação do imóvel.")
      return
    }

    setSalvando(true)

    const dados = {
      codigo: form.codigo.trim() || null,
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      finalidade: form.finalidade,
      status: form.status,

      valor:
        form.valor === "" || form.valor === null
          ? null
          : Number(form.valor),

      quartos:
        form.quartos === "" || form.quartos === null
          ? null
          : Number(form.quartos),

      banheiros:
        form.banheiros === "" || form.banheiros === null
          ? null
          : Number(form.banheiros),

      vagas:
        form.vagas === "" || form.vagas === null
          ? null
          : Number(form.vagas),

      area:
        form.area === "" || form.area === null
          ? null
          : Number(form.area),

      endereco: form.endereco.trim() || null,
      numero: form.numero.trim() || null,
      complemento: form.complemento.trim() || null,
      bairro: form.bairro.trim() || null,
      cidade: form.cidade.trim() || null,
      estado: form.estado.trim() || null,
      cep: form.cep.trim() || null,
      descricao: form.descricao.trim() || null,
      observacoes: form.observacoes.trim() || null,
    }

    let resultado

    if (editando) {
      resultado = await supabase
        .from("imoveis")
        .update(dados)
        .eq("id", editando.id)
    } else {
      resultado = await supabase
        .from("imoveis")
        .insert([dados])
    }

    if (resultado.error) {
      console.error(resultado.error)
      setErro(`Erro ao salvar imóvel: ${resultado.error.message}`)
      setSalvando(false)
      return
    }

    setSucesso(
      editando
        ? "Imóvel atualizado com sucesso!"
        : "Imóvel cadastrado com sucesso!"
    )

    setSalvando(false)
    setModalAberto(false)
    setEditando(null)

    await carregarImoveis()
  }

  // ============================================================
  // EXCLUIR IMÓVEL
  // ============================================================

  async function excluirImovel(imovel) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o imóvel "${imovel.titulo || "sem título"}"?`
    )

    if (!confirmar) {
      return
    }

    setErro("")
    setSucesso("")

    const { error } = await supabase
      .from("imoveis")
      .delete()
      .eq("id", imovel.id)

    if (error) {
      console.error(error)
      setErro(`Erro ao excluir imóvel: ${error.message}`)
      return
    }

    setSucesso("Imóvel excluído com sucesso!")

    await carregarImoveis()
  }

  // ============================================================
  // FORMATADORES
  // ============================================================

  function formatarMoeda(valor) {
    if (valor === null || valor === undefined || valor === "") {
      return "—"
    }

    const numero = Number(valor)

    if (Number.isNaN(numero)) {
      return "—"
    }

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  function classeStatus(status) {
    switch (String(status || "").toLowerCase()) {
      case "disponivel":
        return "bg-success"

      case "alugado":
        return "bg-primary"

      case "vendido":
        return "bg-dark"

      case "manutencao":
        return "bg-warning text-dark"

      case "indisponivel":
        return "bg-secondary"

      default:
        return "bg-secondary"
    }
  }

  function textoStatus(status) {
    switch (String(status || "").toLowerCase()) {
      case "disponivel":
        return "Disponível"

      case "alugado":
        return "Alugado"

      case "vendido":
        return "Vendido"

      case "manutencao":
        return "Manutenção"

      case "indisponivel":
        return "Indisponível"

      default:
        return status || "—"
    }
  }

  function textoTipo(tipo) {
    switch (String(tipo || "").toLowerCase()) {
      case "casa":
        return "Casa"

      case "apartamento":
        return "Apartamento"

      case "terreno":
        return "Terreno"

      case "comercial":
        return "Comercial"

      case "sala":
        return "Sala"

      case "chacara":
        return "Chácara"

      case "sitio":
        return "Sítio"

      case "galpao":
        return "Galpão"

      default:
        return tipo || "—"
    }
  }

  function textoFinalidade(finalidade) {
    switch (String(finalidade || "").toLowerCase()) {
      case "residencial":
        return "Residencial"

      case "comercial":
        return "Comercial"

      case "venda":
        return "Venda"

      case "locacao":
        return "Locação"

      case "venda_locacao":
        return "Venda / Locação"

      default:
        return finalidade || "—"
    }
  }

  // ============================================================
  // RESUMO
  // ============================================================

  const totalImoveis = imoveis.length

  const disponiveis = imoveis.filter(
    (item) => item.status === "disponivel"
  ).length

  const alugados = imoveis.filter(
    (item) => item.status === "alugado"
  ).length

  const manutencao = imoveis.filter(
    (item) => item.status === "manutencao"
  ).length
  return (
    <div className="container-fluid py-4">

      {/* ======================================================
          CABEÇALHO
      ====================================================== */}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Imóveis
          </h2>

          <p className="text-muted mb-0">
            Cadastro e gestão dos imóveis
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={abrirNovoImovel}
        >
          + Novo imóvel
        </button>

      </div>


      {/* ======================================================
          ALERTAS
      ====================================================== */}

      {erro && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {erro}

          <button
            type="button"
            className="btn-close"
            onClick={() => setErro("")}
          />
        </div>
      )}

      {sucesso && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {sucesso}

          <button
            type="button"
            className="btn-close"
            onClick={() => setSucesso("")}
          />
        </div>
      )}


      {/* ======================================================
          ACESSO RÁPIDO
      ====================================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            Acesso Rápido
          </h5>

          <div className="d-flex flex-wrap gap-2">

            <button
              className="btn btn-outline-primary"
              onClick={() => acessarPagina("/")}
            >
              Dashboard
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={() => acessarPagina("/clientes")}
            >
              Clientes
            </button>

            <button
              className="btn btn-primary"
              onClick={() => acessarPagina("/imoveis")}
            >
              Imóveis
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={() => acessarPagina("/contratos")}
            >
              Contratos
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={() => acessarPagina("/recebimentos")}
            >
              Recebimentos
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={() => acessarPagina("/despesas")}
            >
              Despesas
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={() => acessarPagina("/financeiro")}
            >
              Financeiro
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={() => acessarPagina("/manutencoes")}
            >
              Manutenções
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={() => acessarPagina("/visitas")}
            >
              Visitas
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={() => acessarPagina("/comunicacao")}
            >
              Comunicação
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={() => acessarPagina("/relatorios")}
            >
              Relatórios
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={() => acessarPagina("/configuracoes")}
            >
              Configurações
            </button>

          </div>

        </div>

      </div>


      {/* ======================================================
          RESUMO
      ====================================================== */}

      <div className="row g-3 mb-4">

        <div className="col-12 col-sm-6 col-xl-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="text-muted small">
                Total de imóveis
              </div>

              <div className="fs-3 fw-bold">
                {totalImoveis}
              </div>

            </div>

          </div>

        </div>


        <div className="col-12 col-sm-6 col-xl-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="text-muted small">
                Disponíveis
              </div>

              <div className="fs-3 fw-bold text-success">
                {disponiveis}
              </div>

            </div>

          </div>

        </div>


        <div className="col-12 col-sm-6 col-xl-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="text-muted small">
                Alugados
              </div>

              <div className="fs-3 fw-bold text-primary">
                {alugados}
              </div>

            </div>

          </div>

        </div>


        <div className="col-12 col-sm-6 col-xl-3">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <div className="text-muted small">
                Em manutenção
              </div>

              <div className="fs-3 fw-bold text-warning">
                {manutencao}
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          LISTAGEM
      ====================================================== */}

      <div className="card shadow-sm border-0">

        <div className="card-body">

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">

            <div>

              <h5 className="fw-bold mb-1">
                Imóveis cadastrados
              </h5>

              <small className="text-muted">
                {imoveisFiltrados.length} imóvel(is) encontrado(s)
              </small>

            </div>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={carregarImoveis}
              disabled={loading}
            >
              Atualizar
            </button>

          </div>


          <div className="row g-3 mb-4">

            <div className="col-12 col-lg-8">

              <label className="form-label fw-semibold">
                Buscar imóvel
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Código, título, endereço, bairro, cidade..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />

            </div>


            <div className="col-12 col-lg-4">

              <label className="form-label fw-semibold">
                Situação
              </label>

              <select
                className="form-select"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >

                <option value="todos">
                  Todos
                </option>

                <option value="disponivel">
                  Disponíveis
                </option>

                <option value="alugado">
                  Alugados
                </option>

                <option value="manutencao">
                  Em manutenção
                </option>

                <option value="vendido">
                  Vendidos
                </option>

                <option value="indisponivel">
                  Indisponíveis
                </option>

              </select>

            </div>

          </div>


          {loading ? (

            <div className="text-center py-5">

              <div
                className="spinner-border text-primary"
                role="status"
              />

              <div className="mt-3 text-muted">
                Carregando imóveis...
              </div>

            </div>

          ) : imoveisFiltrados.length === 0 ? (

            <div className="text-center py-5">

              <div className="fs-1 mb-2">
                🏠
              </div>

              <h5 className="fw-bold">
                Nenhum imóvel encontrado
              </h5>

              <p className="text-muted">
                Cadastre um imóvel ou altere os filtros.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={abrirNovoImovel}
              >
                + Cadastrar imóvel
              </button>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead>

                  <tr>

                    <th>
                      Imóvel
                    </th>

                    <th>
                      Tipo
                    </th>

                    <th>
                      Localização
                    </th>

                    <th>
                      Valor
                    </th>

                    <th>
                      Características
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

                  {imoveisFiltrados.map((imovel) => (

                    <tr key={imovel.id}>

                      <td>

                        <div className="fw-semibold">
                          {imovel.titulo || "Sem título"}
                        </div>

                        {imovel.codigo && (
                          <small className="text-muted">
                            Código: {imovel.codigo}
                          </small>
                        )}

                      </td>


                      <td>

                        <div>
                          {textoTipo(imovel.tipo)}
                        </div>

                        <small className="text-muted">
                          {textoFinalidade(imovel.finalidade)}
                        </small>

                      </td>


                      <td>

                        <div>
                          {imovel.endereco || "—"}
                          {imovel.numero && `, ${imovel.numero}`}
                        </div>

                        <small className="text-muted">
                          {imovel.bairro || ""}
                          {imovel.bairro && imovel.cidade ? " - " : ""}
                          {imovel.cidade || ""}
                        </small>

                      </td>


                      <td>
                        {formatarMoeda(imovel.valor)}
                      </td>


                      <td>

                        <div className="small">

                          {imovel.quartos !== null &&
                            imovel.quartos !== undefined && (
                              <span className="me-2">
                                🛏️ {imovel.quartos}
                              </span>
                            )}

                          {imovel.banheiros !== null &&
                            imovel.banheiros !== undefined && (
                              <span className="me-2">
                                🚿 {imovel.banheiros}
                              </span>
                            )}

                          {imovel.vagas !== null &&
                            imovel.vagas !== undefined && (
                              <span>
                                🚗 {imovel.vagas}
                              </span>
                            )}

                        </div>

                        {imovel.area && (
                          <small className="text-muted">
                            {imovel.area} m²
                          </small>
                        )}

                      </td>


                      <td>

                        <span
                          className={`badge ${classeStatus(
                            imovel.status
                          )}`}
                        >
                          {textoStatus(imovel.status)}
                        </span>

                      </td>


                      <td className="text-end">

                        <div className="d-flex justify-content-end gap-2">

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              abrirEditarImovel(imovel)
                            }
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              excluirImovel(imovel)
                            }
                          >
                            Excluir
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
      {/* ======================================================
          MODAL
      ====================================================== */}

      {modalAberto && (

        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
        >

          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">

            <div className="modal-content">

              <form onSubmit={salvarImovel}>

                <div className="modal-header">

                  <h5 className="modal-title fw-bold">
                    {editando
                      ? "Editar imóvel"
                      : "Novo imóvel"}
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={fecharModal}
                    disabled={salvando}
                  />

                </div>


                <div className="modal-body">

                  {/* DADOS PRINCIPAIS */}

                  <div className="card border-0 bg-light mb-4">

                    <div className="card-body">

                      <h6 className="fw-bold mb-3">
                        Dados do imóvel
                      </h6>

                      <div className="row g-3">

                        <div className="col-12 col-md-3">

                          <label className="form-label fw-semibold">
                            Código
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            value={form.codigo}
                            onChange={(e) =>
                              alterarCampo(
                                "codigo",
                                e.target.value
                              )
                            }
                            placeholder="Ex.: IM001"
                          />

                        </div>


                        <div className="col-12 col-md-6">

                          <label className="form-label fw-semibold">
                            Título *
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            value={form.titulo}
                            onChange={(e) =>
                              alterarCampo(
                                "titulo",
                                e.target.value
                              )
                            }
                            placeholder="Ex.: Casa no centro"
                            required
                          />

                        </div>


                        <div className="col-12 col-md-3">

                          <label className="form-label fw-semibold">
                            Tipo *
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
                            required
                          >

                            <option value="casa">
                              Casa
                            </option>

                            <option value="apartamento">
                              Apartamento
                            </option>

                            <option value="terreno">
                              Terreno
                            </option>

                            <option value="comercial">
                              Comercial
                            </option>

                            <option value="sala">
                              Sala
                            </option>

                            <option value="chacara">
                              Chácara
                            </option>

                            <option value="sitio">
                              Sítio
                            </option>

                            <option value="galpao">
                              Galpão
                            </option>

                          </select>

                        </div>


                        <div className="col-12 col-md-4">

                          <label className="form-label fw-semibold">
                            Finalidade
                          </label>

                          <select
                            className="form-select"
                            value={form.finalidade}
                            onChange={(e) =>
                              alterarCampo(
                                "finalidade",
                                e.target.value
                              )
                            }
                          >

                            <option value="residencial">
                              Residencial
                            </option>

                            <option value="comercial">
                              Comercial
                            </option>

                            <option value="locacao">
                              Locação
                            </option>

                            <option value="venda">
                              Venda
                            </option>

                            <option value="venda_locacao">
                              Venda / Locação
                            </option>

                          </select>

                        </div>


                        <div className="col-12 col-md-4">

                          <label className="form-label fw-semibold">
                            Situação
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

                            <option value="disponivel">
                              Disponível
                            </option>

                            <option value="alugado">
                              Alugado
                            </option>

                            <option value="manutencao">
                              Em manutenção
                            </option>

                            <option value="vendido">
                              Vendido
                            </option>

                            <option value="indisponivel">
                              Indisponível
                            </option>

                          </select>

                        </div>


                        <div className="col-12 col-md-4">

                          <label className="form-label fw-semibold">
                            Valor
                          </label>

                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-control"
                            value={form.valor}
                            onChange={(e) =>
                              alterarCampo(
                                "valor",
                                e.target.value
                              )
                            }
                            placeholder="0,00"
                          />

                        </div>

                      </div>

                    </div>

                  </div>


                  {/* CARACTERÍSTICAS */}

                  <div className="card border-0 bg-light mb-4">

                    <div className="card-body">

                      <h6 className="fw-bold mb-3">
                        Características
                      </h6>

                      <div className="row g-3">

                        <div className="col-6 col-md-3">

                          <label className="form-label fw-semibold">
                            Quartos
                          </label>

                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            value={form.quartos}
                            onChange={(e) =>
                              alterarCampo(
                                "quartos",
                                e.target.value
                              )
                            }
                          />

                        </div>


                        <div className="col-6 col-md-3">

                          <label className="form-label fw-semibold">
                            Banheiros
                          </label>

                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            value={form.banheiros}
                            onChange={(e) =>
                              alterarCampo(
                                "banheiros",
                                e.target.value
                              )
                            }
                          />

                        </div>


                        <div className="col-6 col-md-3">

                          <label className="form-label fw-semibold">
                            Vagas
                          </label>

                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            value={form.vagas}
                            onChange={(e) =>
                              alterarCampo(
                                "vagas",
                                e.target.value
                              )
                            }
                          />

                        </div>


                        <div className="col-6 col-md-3">

                          <label className="form-label fw-semibold">
                            Área (m²)
                          </label>

                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-control"
                            value={form.area}
                            onChange={(e) =>
                              alterarCampo(
                                "area",
                                e.target.value
                              )
                            }
                          />

                        </div>

                      </div>

                    </div>

                  </div>


                  {/* ENDEREÇO */}

                  <div className="card border-0 bg-light mb-4">

                    <div className="card-body">

                      <h6 className="fw-bold mb-3">
                        Endereço
                      </h6>

                      <div className="row g-3">

                        <div className="col-12 col-md-7">

                          <label className="form-label fw-semibold">
                            Endereço
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            value={form.endereco}
                            onChange={(e) =>
                              alterarCampo(
                                "endereco",
                                e.target.value
                              )
                            }
                          />

                        </div>


                        <div className="col-6 col-md-2">

                          <label className="form-label fw-semibold">
                            Número
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            value={form.numero}
                            onChange={(e) =>
                              alterarCampo(
                                "numero",
                                e.target.value
                              )
                            }
                          />

                        </div>


                        <div className="col-6 col-md-3">

                          <label className="form-label fw-semibold">
                            Complemento
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            value={form.complemento}
                            onChange={(e) =>
                              alterarCampo(
                                "complemento",
                                e.target.value
                              )
                            }
                          />

                        </div>


                        <div className="col-12 col-md-4">

                          <label className="form-label fw-semibold">
                            Bairro
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            value={form.bairro}
                            onChange={(e) =>
                              alterarCampo(
                                "bairro",
                                e.target.value
                              )
                            }
                          />

                        </div>


                        <div className="col-12 col-md-4">

                          <label className="form-label fw-semibold">
                            Cidade
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            value={form.cidade}
                            onChange={(e) =>
                              alterarCampo(
                                "cidade",
                                e.target.value
                              )
                            }
                          />

                        </div>


                        <div className="col-6 col-md-2">

                          <label className="form-label fw-semibold">
                            Estado
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            maxLength="2"
                            value={form.estado}
                            onChange={(e) =>
                              alterarCampo(
                                "estado",
                                e.target.value.toUpperCase()
                              )
                            }
                          />

                        </div>


                        <div className="col-6 col-md-2">

                          <label className="form-label fw-semibold">
                            CEP
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            value={form.cep}
                            onChange={(e) =>
                              alterarCampo(
                                "cep",
                                e.target.value
                              )
                            }
                          />

                        </div>

                      </div>

                    </div>

                  </div>


                  {/* DESCRIÇÃO */}

                  <div className="card border-0 bg-light mb-4">

                    <div className="card-body">

                      <h6 className="fw-bold mb-3">
                        Descrição e observações
                      </h6>

                      <div className="row g-3">

                        <div className="col-12">

                          <label className="form-label fw-semibold">
                            Descrição
                          </label>

                          <textarea
                            className="form-control"
                            rows="4"
                            value={form.descricao}
                            onChange={(e) =>
                              alterarCampo(
                                "descricao",
                                e.target.value
                              )
                            }
                            placeholder="Descreva o imóvel..."
                          />

                        </div>


                        <div className="col-12">

                          <label className="form-label fw-semibold">
                            Observações
                          </label>

                          <textarea
                            className="form-control"
                            rows="3"
                            value={form.observacoes}
                            onChange={(e) =>
                              alterarCampo(
                                "observacoes",
                                e.target.value
                              )
                            }
                            placeholder="Informações adicionais..."
                          />

                        </div>

                      </div>

                    </div>

                  </div>

                </div>


                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={fecharModal}
                    disabled={salvando}
                  >
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
                        />

                        Salvando...
                      </>
                    ) : (
                      "Salvar imóvel"
                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}


      {/* ======================================================
          FUNDO DO MODAL
      ====================================================== */}

      {modalAberto && (
        <div
          className="modal-backdrop fade show"
          onClick={fecharModal}
        />
      )}
      {/* ======================================================
          RODAPÉ
      ====================================================== */}

      <div className="text-center text-muted py-3">

        <small>
          Sistema de Gestão Imobiliária
        </small>

        <div className="mt-1">

          <small>
            Gestão de imóveis e locações
          </small>

        </div>

      </div>

    </div>
  )
}