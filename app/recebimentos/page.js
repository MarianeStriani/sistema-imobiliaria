"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Recebimentos() {
  const [recebimentos, setRecebimentos] = useState([])
  const [clientes, setClientes] = useState([])
  const [contratos, setContratos] = useState([])

  const [editando, setEditando] = useState(null)
  const [visualizando, setVisualizando] = useState(null)

  const [form, setForm] = useState({
    contrato_id: "",
    cliente_id: "",
    categoria: "Locação",
    valor: "",
    data_recebimento: "",
    forma_pagamento: "Pix",
    status: "Pago",
    observacoes: ""
  })

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    const [
      { data: recebimentosData },
      { data: clientesData },
      { data: contratosData }
    ] = await Promise.all([
      supabase
        .from("recebimentos")
        .select(`
          *,
          clientes (
            nome
          ),
          contratos (
            numero,
            imovel,
            cliente,
            tipo
          )
        `)
        .order("data_recebimento", { ascending: false }),

      supabase
        .from("clientes")
        .select("*")
        .order("nome"),

      supabase
        .from("contratos")
        .select("*")
        .order("numero")
    ])

    setRecebimentos(recebimentosData || [])
    setClientes(clientesData || [])
    setContratos(contratosData || [])
  }

  function alterarCampo(e) {
    const { name, value } = e.target

    setForm({
      ...form,
      [name]: value
    })

    if (name === "contrato_id" && value) {
      const contrato = contratos.find(
        (item) => String(item.id) === String(value)
      )

      if (contrato) {
        setForm((atual) => ({
          ...atual,
          contrato_id: value,
          categoria: contrato.tipo
        }))
      }
    }
  }

  function limparForm() {
    setForm({
      contrato_id: "",
      cliente_id: "",
      categoria: "Locação",
      valor: "",
      data_recebimento: "",
      forma_pagamento: "Pix",
      status: "Pago",
      observacoes: ""
    })

    setEditando(null)
  }

  async function salvarRecebimento(e) {
    e.preventDefault()

    if (!form.cliente_id) {
      alert("Selecione um cliente.")
      return
    }

    if (!form.valor) {
      alert("Informe o valor.")
      return
    }

    const dados = {
      contrato_id: form.contrato_id
        ? Number(form.contrato_id)
        : null,

      cliente_id: Number(form.cliente_id),

      categoria: form.categoria,

      valor: Number(form.valor),

      data_recebimento:
        form.data_recebimento ||
        new Date().toISOString().split("T")[0],

      forma_pagamento: form.forma_pagamento,

      status: form.status,

      observacoes: form.observacoes
    }

    if (editando) {
      const { error } = await supabase
        .from("recebimentos")
        .update(dados)
        .eq("id", editando)

      if (error) {
        alert("Erro ao atualizar: " + error.message)
        return
      }

      alert("Recebimento atualizado com sucesso!")
    } else {
      const { error } = await supabase
        .from("recebimentos")
        .insert([dados])

      if (error) {
        alert("Erro ao cadastrar: " + error.message)
        return
      }

      alert("Recebimento cadastrado com sucesso!")
    }

    limparForm()
    carregarDados()
  }

  function editarRecebimento(item) {
    setEditando(item.id)

    setForm({
      contrato_id: item.contrato_id
        ? String(item.contrato_id)
        : "",

      cliente_id: item.cliente_id
        ? String(item.cliente_id)
        : "",

      categoria: item.categoria || "Locação",

      valor: item.valor || "",

      data_recebimento:
        item.data_recebimento || "",

      forma_pagamento:
        item.forma_pagamento || "Pix",

      status:
        item.status || "Pago",

      observacoes:
        item.observacoes || ""
    })

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  async function excluirRecebimento(id) {
    if (!confirm("Deseja realmente excluir este recebimento?")) {
      return
    }

    const { error } = await supabase
      .from("recebimentos")
      .delete()
      .eq("id", id)

    if (error) {
      alert("Erro ao excluir: " + error.message)
      return
    }

    carregarDados()
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
  }

  function formatarData(data) {
    if (!data) return "-"

    return new Date(data + "T00:00:00").toLocaleDateString(
      "pt-BR"
    )
  }

  return (
    <main className="container py-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">
            Recebimentos
          </h1>

          <p className="text-muted mb-0">
            Controle financeiro dos contratos e clientes
          </p>
        </div>
      </div>

      {/* FORMULÁRIO */}

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            {editando
              ? "Editar recebimento"
              : "Cadastrar recebimento"}
          </h5>
        </div>

        <div className="card-body">

          <form onSubmit={salvarRecebimento}>

            <div className="row g-3">

              {/* CLIENTE */}

              <div className="col-md-6">
                <label className="form-label">
                  Cliente *
                </label>

                <select
                  className="form-select"
                  name="cliente_id"
                  value={form.cliente_id}
                  onChange={alterarCampo}
                  required
                >
                  <option value="">
                    Selecione o cliente
                  </option>

                  {clientes.map((cliente) => (
                    <option
                      key={cliente.id}
                      value={cliente.id}
                    >
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* CONTRATO */}

              <div className="col-md-6">
                <label className="form-label">
                  Contrato
                </label>

                <select
                  className="form-select"
                  name="contrato_id"
                  value={form.contrato_id}
                  onChange={alterarCampo}
                >
                  <option value="">
                    Selecione o contrato
                  </option>

                  {contratos.map((contrato) => (
                    <option
                      key={contrato.id}
                      value={contrato.id}
                    >
                      {contrato.numero} - {contrato.cliente}
                    </option>
                  ))}
                </select>
              </div>

              {/* CATEGORIA */}

              <div className="col-md-4">
                <label className="form-label">
                  Categoria
                </label>

                <select
                  className="form-select"
                  name="categoria"
                  value={form.categoria}
                  onChange={alterarCampo}
                >
                  <option value="Locação">
                    Locação
                  </option>

                  <option value="Compra e Venda">
                    Compra e Venda
                  </option>

                  <option value="Temporada">
                    Temporada
                  </option>

                  <option value="Administração">
                    Administração
                  </option>
                </select>
              </div>

              {/* VALOR */}

              <div className="col-md-4">
                <label className="form-label">
                  Valor *
                </label>

                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="valor"
                  value={form.valor}
                  onChange={alterarCampo}
                  placeholder="0,00"
                  required
                />
              </div>

              {/* DATA */}

              <div className="col-md-4">
                <label className="form-label">
                  Data do recebimento
                </label>

                <input
                  type="date"
                  className="form-control"
                  name="data_recebimento"
                  value={form.data_recebimento}
                  onChange={alterarCampo}
                />
              </div>

              {/* FORMA PAGAMENTO */}

              <div className="col-md-4">
                <label className="form-label">
                  Forma de pagamento
                </label>

                <select
                  className="form-select"
                  name="forma_pagamento"
                  value={form.forma_pagamento}
                  onChange={alterarCampo}
                >
                  <option value="Pix">
                    Pix
                  </option>

                  <option value="Dinheiro">
                    Dinheiro
                  </option>

                  <option value="Cartão">
                    Cartão
                  </option>

                  <option value="Transferência">
                    Transferência
                  </option>

                  <option value="Boleto">
                    Boleto
                  </option>

                  <option value="Outro">
                    Outro
                  </option>
                </select>
              </div>

              {/* STATUS */}

              <div className="col-md-4">
                <label className="form-label">
                  Status
                </label>

                <select
                  className="form-select"
                  name="status"
                  value={form.status}
                  onChange={alterarCampo}
                >
                  <option value="Pago">
                    Pago
                  </option>

                  <option value="Pendente">
                    Pendente
                  </option>
                </select>
              </div>

              {/* OBSERVAÇÕES */}

              <div className="col-md-4">
                <label className="form-label">
                  Observações
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="observacoes"
                  value={form.observacoes}
                  onChange={alterarCampo}
                  placeholder="Observações"
                />
              </div>

            </div>

            <div className="mt-4">

              <button
                type="submit"
                className="btn btn-primary me-2"
              >
                {editando
                  ? "Salvar alterações"
                  : "Cadastrar recebimento"}
              </button>

              {editando && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={limparForm}
                >
                  Cancelar
                </button>
              )}

            </div>

          </form>

        </div>
      </div>

      {/* LISTAGEM */}

      <div className="card shadow-sm">

        <div className="card-header">
          <h5 className="mb-0">
            Recebimentos cadastrados
          </h5>
        </div>

        <div className="card-body">

          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Contrato</th>
                  <th>Categoria</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>

                {recebimentos.length === 0 ? (

                  <tr>
                    <td
                      colSpan="7"
                      className="text-center text-muted py-4"
                    >
                      Nenhum recebimento cadastrado.
                    </td>
                  </tr>

                ) : (

                  recebimentos.map((item) => (

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
                        {item.categoria}
                      </td>

                      <td className="fw-bold">
                        {formatarMoeda(item.valor)}
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

                      <td>

                        <button
                          className="btn btn-sm btn-info text-white me-1"
                          onClick={() =>
                            setVisualizando(item)
                          }
                        >
                          Visualizar
                        </button>

                        <button
                          className="btn btn-sm btn-warning me-1"
                          onClick={() =>
                            editarRecebimento(item)
                          }
                        >
                          Editar
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            excluirRecebimento(item.id)
                          }
                        >
                          Excluir
                        </button>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* MODAL VISUALIZAÇÃO */}

      {visualizando && (

        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)"
          }}
        >

          <div className="modal-dialog">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title">
                  Detalhes do recebimento
                </h5>

                <button
                  className="btn-close"
                  onClick={() =>
                    setVisualizando(null)
                  }
                ></button>

              </div>

              <div className="modal-body">

                <p>
                  <strong>Cliente:</strong>{" "}
                  {visualizando.clientes?.nome || "-"}
                </p>

                <p>
                  <strong>Contrato:</strong>{" "}
                  {visualizando.contratos?.numero || "-"}
                </p>

                <p>
                  <strong>Categoria:</strong>{" "}
                  {visualizando.categoria}
                </p>

                <p>
                  <strong>Valor:</strong>{" "}
                  {formatarMoeda(
                    visualizando.valor
                  )}
                </p>

                <p>
                  <strong>Data:</strong>{" "}
                  {formatarData(
                    visualizando.data_recebimento
                  )}
                </p>

                <p>
                  <strong>Pagamento:</strong>{" "}
                  {visualizando.forma_pagamento || "-"}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {visualizando.status}
                </p>

                <p>
                  <strong>Observações:</strong>{" "}
                  {visualizando.observacoes || "-"}
                </p>

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