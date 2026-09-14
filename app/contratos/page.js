"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Contratos() {
  const contratoInicial = {
    numero: "",
    imovel: "",
    cliente: "",
    tipo: "Locação",
    inicio: "",
    termino: "",
    valor: "",
    status: "Ativo",
    periodicidade: "Mensal",
    quantidade_dias: "",
    observacoes: "",
  }

  const [contratos, setContratos] = useState([])
  const [form, setForm] = useState(contratoInicial)
  const [editando, setEditando] = useState(null)
  const [visualizando, setVisualizando] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [mensagem, setMensagem] = useState("")

  useEffect(() => {
    buscarContratos()
  }, [])

  async function buscarContratos() {
    setCarregando(true)

    const { data, error } = await supabase
      .from("contratos")
      .select("*")
      .order("id", { ascending: false })

    if (error) {
      console.error(error)
      setMensagem("Erro ao carregar contratos.")
    } else {
      setContratos(data || [])
    }

    setCarregando(false)
  }

  function alterarCampo(e) {
    const { name, value } = e.target

    setForm((anterior) => ({
      ...anterior,
      [name]: value,
    }))
  }

  function alterarTipo(e) {
    const tipo = e.target.value

    let periodicidade = "Mensal"

    if (tipo === "Compra e Venda") {
      periodicidade = "Única"
    }

    if (tipo === "Temporada") {
      periodicidade = "Diária"
    }

    if (tipo === "Administração") {
      periodicidade = "Mensal"
    }

    setForm((anterior) => ({
      ...anterior,
      tipo,
      periodicidade,
      quantidade_dias: tipo === "Temporada" ? anterior.quantidade_dias : "",
    }))
  }

  async function salvarContrato(e) {
    e.preventDefault()

    setMensagem("")

    if (!form.numero || !form.imovel || !form.cliente || !form.valor) {
      setMensagem("Preencha os campos obrigatórios.")
      return
    }

    if (
      form.tipo === "Temporada" &&
      (!form.quantidade_dias || Number(form.quantidade_dias) <= 0)
    ) {
      setMensagem("Informe a quantidade de dias da temporada.")
      return
    }

    const dados = {
      numero: form.numero,
      imovel: form.imovel,
      cliente: form.cliente,
      tipo: form.tipo,
      inicio: form.inicio || null,
      termino: form.termino || null,
      valor: Number(form.valor),
      status: form.status,
      periodicidade: form.periodicidade,
      quantidade_dias:
        form.tipo === "Temporada"
          ? Number(form.quantidade_dias)
          : null,
      observacoes: form.observacoes,
    }

    if (editando) {
      const { error } = await supabase
        .from("contratos")
        .update(dados)
        .eq("id", editando)

      if (error) {
        console.error(error)
        setMensagem("Erro ao atualizar contrato.")
        return
      }

      setMensagem("Contrato atualizado com sucesso.")
    } else {
      const { error } = await supabase
        .from("contratos")
        .insert([dados])

      if (error) {
        console.error(error)
        setMensagem("Erro ao cadastrar contrato.")
        return
      }

      setMensagem("Contrato cadastrado com sucesso.")
    }

    limparFormulario()
    buscarContratos()
  }

  function editarContrato(contrato) {
    setEditando(contrato.id)

    setForm({
      numero: contrato.numero || "",
      imovel: contrato.imovel || "",
      cliente: contrato.cliente || "",
      tipo: contrato.tipo || "Locação",
      inicio: contrato.inicio || "",
      termino: contrato.termino || "",
      valor: contrato.valor || "",
      status: contrato.status || "Ativo",
      periodicidade: contrato.periodicidade || "Mensal",
      quantidade_dias: contrato.quantidade_dias || "",
      observacoes: contrato.observacoes || "",
    })

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  async function excluirContrato(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este contrato?"
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("contratos")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
      setMensagem("Erro ao excluir contrato.")
      return
    }

    setMensagem("Contrato excluído com sucesso.")
    buscarContratos()
  }

  function limparFormulario() {
    setForm(contratoInicial)
    setEditando(null)
  }

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  function formatarData(data) {
    if (!data) return "-"

    const [ano, mes, dia] = data.split("-")

    return `${dia}/${mes}/${ano}`
  }

  function descricaoVencimento(contrato) {
    if (contrato.tipo === "Locação") {
      return "Mensal"
    }

    if (contrato.tipo === "Administração") {
      return contrato.periodicidade || "Mensal"
    }

    if (contrato.tipo === "Temporada") {
      return `${contrato.quantidade_dias || "-"} dias`
    }

    return "Única"
  }

  return (
    <main className="container py-4">

      {/* TÍTULO */}

      <div className="d-flex justify-content-between align-items-center mb-3">

        <div>
          <h1 className="fw-bold mb-1">
            Contratos
          </h1>

          <p className="text-muted mb-0">
            Administração dos contratos imobiliários
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={buscarContratos}
          disabled={carregando}
        >
          {carregando
            ? "Atualizando..."
            : "🔄 Atualizar"}
        </button>

      </div>

      {/* ACESSO RÁPIDO */}

      <div className="card shadow-sm mb-4">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            ⚡ Acesso rápido
          </h5>

          <div className="d-flex gap-2 flex-wrap">

            <a href="/" className="btn btn-primary">
              🏠 Início
            </a>

            <a href="/clientes" className="btn btn-light border">
              👥 Clientes
            </a>

            <a href="/imoveis" className="btn btn-light border">
              🏢 Imóveis
            </a>

            <a href="/contratos" className="btn btn-light border">
              📄 Contratos
            </a>

            <a href="/recebimentos" className="btn btn-light border">
              💰 Recebimentos
            </a>

            <a href="/despesas" className="btn btn-light border">
              💸 Despesas
            </a>

            <a href="/financeiro" className="btn btn-light border">
              📊 Financeiro
            </a>

          </div>

        </div>

      </div>

      {mensagem && (
        <div className="alert alert-info">
          {mensagem}
        </div>
      )}

      {/* FORMULÁRIO */}

      <div className="card shadow-sm mb-4">
        <div className="card-body">

          <h4 className="mb-4">
            {editando ? "Editar contrato" : "Cadastrar contrato"}
          </h4>

          <form onSubmit={salvarContrato}>

            <div className="row g-3">

              <div className="col-md-3">
                <label className="form-label">
                  Nº do contrato *
                </label>

                <input
                  type="text"
                  name="numero"
                  value={form.numero}
                  onChange={alterarCampo}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-5">
                <label className="form-label">
                  Imóvel *
                </label>

                <input
                  type="text"
                  name="imovel"
                  value={form.imovel}
                  onChange={alterarCampo}
                  className="form-control"
                  placeholder="Ex.: Casa 01 - Centro"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Cliente *
                </label>

                <input
                  type="text"
                  name="cliente"
                  value={form.cliente}
                  onChange={alterarCampo}
                  className="form-control"
                  placeholder="Nome do cliente"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Tipo de contrato *
                </label>

                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={alterarTipo}
                  className="form-select"
                >
                  <option>Locação</option>
                  <option>Compra e Venda</option>
                  <option>Administração</option>
                  <option>Temporada</option>
                </select>
              </div>

              {/* PERIODICIDADE */}

              <div className="col-md-4">
                <label className="form-label">
                  Periodicidade
                </label>

                <select
                  name="periodicidade"
                  value={form.periodicidade}
                  onChange={alterarCampo}
                  className="form-select"
                  disabled={
                    form.tipo === "Locação" ||
                    form.tipo === "Temporada" ||
                    form.tipo === "Compra e Venda"
                  }
                >
                  {form.tipo === "Administração" ? (
                    <>
                      <option value="Mensal">Mensal</option>
                      <option value="Anual">Anual</option>
                    </>
                  ) : (
                    <>
                      <option value={form.periodicidade}>
                        {form.periodicidade}
                      </option>
                    </>
                  )}
                </select>
              </div>

              {/* DIAS DA TEMPORADA */}

              {form.tipo === "Temporada" && (
                <div className="col-md-4">
                  <label className="form-label">
                    Quantidade de dias *
                  </label>

                  <input
                    type="number"
                    name="quantidade_dias"
                    value={form.quantidade_dias}
                    onChange={alterarCampo}
                    className="form-control"
                    min="1"
                    placeholder="Ex.: 7"
                    required
                  />
                </div>
              )}

              <div className="col-md-4">
                <label className="form-label">
                  Data de início
                </label>

                <input
                  type="date"
                  name="inicio"
                  value={form.inicio}
                  onChange={alterarCampo}
                  className="form-control"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Data de término
                </label>

                <input
                  type="date"
                  name="termino"
                  value={form.termino}
                  onChange={alterarCampo}
                  className="form-control"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Valor *
                </label>

                <input
                  type="number"
                  name="valor"
                  value={form.valor}
                  onChange={alterarCampo}
                  className="form-control"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={alterarCampo}
                  className="form-select"
                >
                  <option>Ativo</option>
                  <option>Encerrado</option>
                  <option>Cancelado</option>
                  <option>Pendente</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">
                  Observações
                </label>

                <textarea
                  name="observacoes"
                  value={form.observacoes}
                  onChange={alterarCampo}
                  className="form-control"
                  rows="3"
                />
              </div>

            </div>

            <div className="mt-4 d-flex gap-2">

              <button
                type="submit"
                className="btn btn-primary"
              >
                {editando
                  ? "Salvar alterações"
                  : "Cadastrar contrato"}
              </button>

              {editando && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={limparFormulario}
                >
                  Cancelar
                </button>
              )}

            </div>

          </form>
        </div>
      </div>

      {/* TABELA */}

      <div className="card shadow-sm">

        <div className="card-body">

          <h4 className="mb-3">
            Contratos cadastrados
          </h4>

          {carregando ? (
            <p>Carregando...</p>
          ) : contratos.length === 0 ? (
            <p className="text-muted">
              Nenhum contrato cadastrado.
            </p>
          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>
                  <tr>
                    <th>Nº</th>
                    <th>Imóvel</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Periodicidade</th>
                    <th>Vencimento</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>

                  {contratos.map((contrato) => (

                    <tr key={contrato.id}>

                      <td>{contrato.numero}</td>

                      <td>{contrato.imovel}</td>

                      <td>{contrato.cliente}</td>

                      <td>{contrato.tipo}</td>

                      <td>
                        {descricaoVencimento(contrato)}
                      </td>

                      <td>
                        {formatarData(contrato.termino)}
                      </td>

                      <td>
                        {formatarValor(contrato.valor)}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            contrato.status === "Ativo"
                              ? "bg-success"
                              : contrato.status === "Pendente"
                              ? "bg-warning text-dark"
                              : "bg-secondary"
                          }`}
                        >
                          {contrato.status}
                        </span>
                      </td>

                      <td>

                        <div className="d-flex gap-1">

                          <button
                            className="btn btn-sm btn-info text-white"
                            onClick={() =>
                              setVisualizando(contrato)
                            }
                          >
                            Visualizar
                          </button>

                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() =>
                              editarContrato(contrato)
                            }
                          >
                            Editar
                          </button>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              excluirContrato(contrato.id)
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

      {/* MODAL */}

      {visualizando && (

        <div
          className="modal fade show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >

          <div className="modal-dialog modal-lg">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title">
                  Contrato {visualizando.numero}
                </h5>

                <button
                  className="btn-close"
                  onClick={() =>
                    setVisualizando(null)
                  }
                />

              </div>

              <div className="modal-body">

                <div className="row g-3">

                  <div className="col-md-6">
                    <strong>Imóvel:</strong>
                    <br />
                    {visualizando.imovel}
                  </div>

                  <div className="col-md-6">
                    <strong>Cliente:</strong>
                    <br />
                    {visualizando.cliente}
                  </div>

                  <div className="col-md-4">
                    <strong>Tipo:</strong>
                    <br />
                    {visualizando.tipo}
                  </div>

                  <div className="col-md-4">
                    <strong>Periodicidade:</strong>
                    <br />
                    {descricaoVencimento(visualizando)}
                  </div>

                  <div className="col-md-4">
                    <strong>Valor:</strong>
                    <br />
                    {formatarValor(visualizando.valor)}
                  </div>

                  <div className="col-md-4">
                    <strong>Início:</strong>
                    <br />
                    {formatarData(visualizando.inicio)}
                  </div>

                  <div className="col-md-4">
                    <strong>Término:</strong>
                    <br />
                    {formatarData(visualizando.termino)}
                  </div>

                  <div className="col-md-4">
                    <strong>Status:</strong>
                    <br />
                    {visualizando.status}
                  </div>

                  <div className="col-12">
                    <strong>Observações:</strong>
                    <br />
                    {visualizando.observacoes || "-"}
                  </div>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setVisualizando(null)
                  }
                >
                  Fechar
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  )
}