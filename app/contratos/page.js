"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

const formularioInicial = {
  numero: "",
  imovel: "",
  cliente: "",
  tipo: "Locação",
  inicio: "",
  termino: "",
  valor: "",
  status: "Ativo",
  observacoes: ""
}

export default function ContratosPage() {
  const [contratos, setContratos] = useState([])
  const [form, setForm] = useState(formularioInicial)
  const [editandoId, setEditandoId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [visualizando, setVisualizando] = useState(null)

  useEffect(() => {
    carregarContratos()
  }, [])

  async function carregarContratos() {
    setCarregando(true)

    const { data, error } = await supabase
      .from("contratos")
      .select("*")
      .order("id", { ascending: false })

    if (error) {
      console.error(error)
      alert("Erro ao carregar contratos.")
    } else {
      setContratos(data || [])
    }

    setCarregando(false)
  }

  function alterarCampo(e) {
    const { name, value } = e.target

    setForm((anterior) => ({
      ...anterior,
      [name]: value
    }))
  }

  function prepararEdicao(contrato) {
    setEditandoId(contrato.id)

    setForm({
      numero: contrato.numero || "",
      imovel: contrato.imovel || "",
      cliente: contrato.cliente || "",
      tipo: contrato.tipo || "Locação",
      inicio: contrato.inicio || "",
      termino: contrato.termino || "",
      valor: contrato.valor ?? "",
      status: contrato.status || "Ativo",
      observacoes: contrato.observacoes || ""
    })

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setForm(formularioInicial)
  }

  async function salvarContrato(e) {
    e.preventDefault()

    if (!form.numero || !form.imovel || !form.cliente || !form.valor) {
      alert("Preencha número, imóvel, cliente e valor.")
      return
    }

    setSalvando(true)

    const dados = {
      numero: form.numero,
      imovel: form.imovel,
      cliente: form.cliente,
      tipo: form.tipo,
      inicio: form.inicio || null,
      termino: form.termino || null,
      valor: Number(form.valor),
      status: form.status,
      observacoes: form.observacoes
    }

    if (editandoId) {
      const { data, error } = await supabase
        .from("contratos")
        .update(dados)
        .eq("id", editandoId)
        .select()

      if (error) {
        console.error(error)
        alert("Erro ao atualizar contrato.")
      } else {
        setContratos((anterior) =>
          anterior.map((item) =>
            item.id === editandoId ? data[0] : item
          )
        )

        alert("Contrato atualizado com sucesso!")
        cancelarEdicao()
      }
    } else {
      const { data, error } = await supabase
        .from("contratos")
        .insert([dados])
        .select()

      if (error) {
        console.error(error)
        alert("Erro ao cadastrar contrato.")
      } else {
        setContratos((anterior) => [data[0], ...anterior])
        setForm(formularioInicial)

        alert("Contrato cadastrado com sucesso!")
      }
    }

    setSalvando(false)
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
      alert("Erro ao excluir contrato.")
      return
    }

    setContratos((anterior) =>
      anterior.filter((item) => item.id !== id)
    )

    if (visualizando?.id === id) {
      setVisualizando(null)
    }

    alert("Contrato excluído com sucesso!")
  }

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

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-1">
            Contratos
          </h1>

          <p className="text-muted mb-0">
            Administração de contratos
          </p>
        </div>

        <a href="/" className="btn btn-outline-secondary">
          Voltar
        </a>
      </div>

      <div className="card shadow-sm mb-4">

        <div className="card-body">

          <h4 className="mb-4">
            {editandoId
              ? "Editar contrato"
              : "Cadastrar contrato"}
          </h4>

          <form onSubmit={salvarContrato}>

            <div className="row g-3">

              <div className="col-md-3">
                <label className="form-label">
                  Número do contrato *
                </label>

                <input
                  type="text"
                  name="numero"
                  value={form.numero}
                  onChange={alterarCampo}
                  className="form-control"
                  placeholder="CTR001"
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
                  placeholder="Código ou identificação do imóvel"
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
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Tipo
                </label>

                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={alterarCampo}
                  className="form-select"
                >
                  <option>Locação</option>
                  <option>Compra e Venda</option>
                  <option>Administração</option>
                  <option>Temporada</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Início
                </label>

                <input
                  type="date"
                  name="inicio"
                  value={form.inicio}
                  onChange={alterarCampo}
                  className="form-control"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Término
                </label>

                <input
                  type="date"
                  name="termino"
                  value={form.termino}
                  onChange={alterarCampo}
                  className="form-control"
                />
              </div>

              <div className="col-md-3">
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
                  placeholder="0,00"
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
                  placeholder="Observações do contrato..."
                />
              </div>

            </div>

            <div className="mt-4 d-flex gap-2">

              <button
                type="submit"
                className="btn btn-primary"
                disabled={salvando}
              >
                {salvando
                  ? "Salvando..."
                  : editandoId
                    ? "Salvar alterações"
                    : "Cadastrar contrato"}
              </button>

              {editandoId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelarEdicao}
                >
                  Cancelar
                </button>
              )}

            </div>

          </form>

        </div>

      </div>

      <div className="card shadow-sm">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h4 className="mb-0">
              Contratos cadastrados
            </h4>

            <span className="badge bg-primary">
              {contratos.length}
            </span>

          </div>

          {carregando ? (

            <div className="text-center py-4">
              Carregando contratos...
            </div>

          ) : contratos.length === 0 ? (

            <div className="alert alert-info">
              Nenhum contrato cadastrado.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Imóvel</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>

                  {contratos.map((contrato) => (

                    <tr key={contrato.id}>

                      <td>
                        <strong>
                          {contrato.numero}
                        </strong>
                      </td>

                      <td>
                        {contrato.imovel}
                      </td>

                      <td>
                        {contrato.cliente}
                      </td>

                      <td>
                        {contrato.tipo}
                      </td>

                      <td>
                        <strong>
                          {formatarValor(contrato.valor)}
                        </strong>
                      </td>

                      <td>

                        <span
                          className={`badge ${
                            contrato.status === "Ativo"
                              ? "bg-success"
                              : contrato.status === "Encerrado"
                                ? "bg-secondary"
                                : contrato.status === "Cancelado"
                                  ? "bg-danger"
                                  : "bg-warning text-dark"
                          }`}
                        >
                          {contrato.status}
                        </span>

                      </td>

                      <td>

                        <div className="d-flex gap-2 flex-wrap">

                          <button
                            type="button"
                            className="btn btn-sm btn-info text-white"
                            onClick={() =>
                              setVisualizando(contrato)
                            }
                          >
                            Visualizar
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-warning"
                            onClick={() =>
                              prepararEdicao(contrato)
                            }
                          >
                            Editar
                          </button>

                          <button
                            type="button"
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

      {visualizando && (

        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)"
          }}
        >

          <div className="modal-dialog modal-lg modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title">
                  Contrato {visualizando.numero}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setVisualizando(null)
                  }
                />

              </div>

              <div className="modal-body">

                <div className="row g-3">

                  <div className="col-md-6">
                    <strong>Número:</strong>
                    <div>
                      {visualizando.numero}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <strong>Tipo:</strong>
                    <div>
                      {visualizando.tipo}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <strong>Imóvel:</strong>
                    <div>
                      {visualizando.imovel}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <strong>Cliente:</strong>
                    <div>
                      {visualizando.cliente}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <strong>Início:</strong>
                    <div>
                      {formatarData(visualizando.inicio)}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <strong>Término:</strong>
                    <div>
                      {formatarData(visualizando.termino)}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <strong>Valor:</strong>
                    <div>
                      {formatarValor(visualizando.valor)}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <strong>Status:</strong>
                    <div>
                      {visualizando.status}
                    </div>
                  </div>

                  <div className="col-12">
                    <strong>Observações:</strong>
                    <div>
                      {visualizando.observacoes || "-"}
                    </div>
                  </div>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setVisualizando(null)
                  }
                >
                  Fechar
                </button>

                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={() => {
                    prepararEdicao(visualizando)
                    setVisualizando(null)
                  }}
                >
                  Editar contrato
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
