"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Despesas() {
  const [despesas, setDespesas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)

  const [form, setForm] = useState({
    categoria: "",
    descricao: "",
    valor: "",
    data_despesa: "",
    forma_pagamento: "",
    status: "Pendente",
    observacoes: "",
  })

  useEffect(() => {
    carregarDespesas()
  }, [])

  async function carregarDespesas() {
    setCarregando(true)

    const { data, error } = await supabase
      .from("despesas")
      .select(
        "id, categoria, descricao, valor, data_despesa, forma_pagamento, status, observacoes, created_at"
      )
      .order("data_despesa", { ascending: false })

    if (error) {
      console.error("Erro ao carregar despesas:", error)
      alert("Erro ao carregar despesas: " + error.message)
      setDespesas([])
    } else {
      setDespesas(data || [])
    }

    setCarregando(false)
  }

  function alterarCampo(campo, valor) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }

  function limparFormulario() {
    setForm({
      categoria: "",
      descricao: "",
      valor: "",
      data_despesa: "",
      forma_pagamento: "",
      status: "Pendente",
      observacoes: "",
    })

    setEditandoId(null)
  }

  async function salvarDespesa(event) {
    event.preventDefault()

    if (!form.categoria.trim()) {
      alert("Informe a categoria.")
      return
    }

    if (!form.descricao.trim()) {
      alert("Informe a descrição.")
      return
    }

    if (!form.valor) {
      alert("Informe o valor.")
      return
    }

    if (!form.data_despesa) {
      alert("Informe a data da despesa.")
      return
    }

    const valorNumerico = Number(
      String(form.valor).replace(",", ".")
    )

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      alert("Informe um valor válido.")
      return
    }

    setSalvando(true)

    const dados = {
      categoria: form.categoria.trim(),
      descricao: form.descricao.trim(),
      valor: valorNumerico,
      data_despesa: form.data_despesa,
      forma_pagamento: form.forma_pagamento.trim() || null,
      status: form.status,
      observacoes: form.observacoes.trim() || null,
    }

    let resultado

    if (editandoId) {
      resultado = await supabase
        .from("despesas")
        .update(dados)
        .eq("id", editandoId)
    } else {
      resultado = await supabase
        .from("despesas")
        .insert([dados])
    }

    if (resultado.error) {
      console.error("Erro ao salvar:", resultado.error)
      alert("Erro ao salvar despesa: " + resultado.error.message)
    } else {
      alert(
        editandoId
          ? "Despesa atualizada com sucesso!"
          : "Despesa cadastrada com sucesso!"
      )

      limparFormulario()
      await carregarDespesas()
    }

    setSalvando(false)
  }

  function editarDespesa(despesa) {
    setEditandoId(despesa.id)

    setForm({
      categoria: despesa.categoria || "",
      descricao: despesa.descricao || "",
      valor:
        despesa.valor !== null && despesa.valor !== undefined
          ? String(despesa.valor)
          : "",
      data_despesa: despesa.data_despesa || "",
      forma_pagamento: despesa.forma_pagamento || "",
      status: despesa.status || "Pendente",
      observacoes: despesa.observacoes || "",
    })

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  async function excluirDespesa(id) {
    const confirmar = window.confirm(
      "Deseja realmente excluir esta despesa?"
    )

    if (!confirmar) {
      return
    }

    const { error } = await supabase
      .from("despesas")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Erro ao excluir:", error)
      alert("Erro ao excluir despesa: " + error.message)
      return
    }

    alert("Despesa excluída com sucesso.")

    await carregarDespesas()
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  function formatarData(data) {
    if (!data) return "-"

    const partes = data.split("-")

    if (partes.length !== 3) {
      return data
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  const total = despesas.reduce(
    (soma, despesa) => soma + Number(despesa.valor || 0),
    0
  )

  const totalPagas = despesas
    .filter(
      (despesa) =>
        String(despesa.status).toLowerCase() === "pago"
    )
    .reduce(
      (soma, despesa) => soma + Number(despesa.valor || 0),
      0
    )

  const totalPendentes = despesas
    .filter(
      (despesa) =>
        String(despesa.status).toLowerCase() === "pendente"
    )
    .reduce(
      (soma, despesa) => soma + Number(despesa.valor || 0),
      0
    )

  return (
    <main className="container py-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-1">Despesas</h1>
          <p className="text-muted mb-0">
            Controle financeiro das despesas
          </p>
        </div>

        <a href="/" className="btn btn-outline-secondary">
          ← Dashboard
        </a>
      </div>

      {/* FORMULÁRIO */}

      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            {editandoId
              ? "Editar despesa"
              : "Nova despesa"}
          </h5>
        </div>

        <div className="card-body">

          <form onSubmit={salvarDespesa}>

            <div className="row g-3">

              <div className="col-md-4">
                <label className="form-label">
                  Categoria *
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={form.categoria}
                  onChange={(e) =>
                    alterarCampo(
                      "categoria",
                      e.target.value
                    )
                  }
                  placeholder="Ex.: Manutenção"
                  required
                />
              </div>

              <div className="col-md-8">
                <label className="form-label">
                  Descrição *
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={form.descricao}
                  onChange={(e) =>
                    alterarCampo(
                      "descricao",
                      e.target.value
                    )
                  }
                  placeholder="Descrição da despesa"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Valor *
                </label>

                <input
                  type="number"
                  className="form-control"
                  value={form.valor}
                  onChange={(e) =>
                    alterarCampo(
                      "valor",
                      e.target.value
                    )
                  }
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Data da despesa *
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={form.data_despesa}
                  onChange={(e) =>
                    alterarCampo(
                      "data_despesa",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Forma de pagamento
                </label>

                <select
                  className="form-select"
                  value={form.forma_pagamento}
                  onChange={(e) =>
                    alterarCampo(
                      "forma_pagamento",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Selecione
                  </option>

                  <option value="Dinheiro">
                    Dinheiro
                  </option>

                  <option value="PIX">
                    PIX
                  </option>

                  <option value="Cartão">
                    Cartão
                  </option>

                  <option value="Boleto">
                    Boleto
                  </option>

                  <option value="Transferência">
                    Transferência
                  </option>

                  <option value="Outro">
                    Outro
                  </option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">
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
                  <option value="Pendente">
                    Pendente
                  </option>

                  <option value="Pago">
                    Pago
                  </option>

                  <option value="Cancelado">
                    Cancelado
                  </option>
                </select>
              </div>

              <div className="col-md-8">
                <label className="form-label">
                  Observações
                </label>

                <textarea
                  className="form-control"
                  rows="2"
                  value={form.observacoes}
                  onChange={(e) =>
                    alterarCampo(
                      "observacoes",
                      e.target.value
                    )
                  }
                  placeholder="Observações"
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
                  ? "Atualizar"
                  : "Cadastrar"}
              </button>

              {editandoId && (
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

      {/* RESUMO */}

      <div className="row g-3 mb-4">

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">
                Total de despesas
              </h6>

              <h3 className="fw-bold">
                {formatarMoeda(total)}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">
                Total pago
              </h6>

              <h3 className="fw-bold text-success">
                {formatarMoeda(totalPagas)}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">
                Total pendente
              </h6>

              <h3 className="fw-bold text-warning">
                {formatarMoeda(totalPendentes)}
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* LISTA */}

      <div className="card shadow-sm">

        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Despesas cadastradas
          </h5>

          <span className="badge bg-secondary">
            {despesas.length}
          </span>
        </div>

        <div className="card-body p-0">

          {carregando ? (
            <div className="p-4 text-center">
              Carregando despesas...
            </div>
          ) : despesas.length === 0 ? (
            <div className="p-4 text-center text-muted">
              Nenhuma despesa cadastrada.
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>
                    <th>Data</th>
                    <th>Categoria</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Pagamento</th>
                    <th>Status</th>
                    <th>Observações</th>
                    <th>Ações</th>
                  </tr>

                </thead>

                <tbody>

                  {despesas.map((despesa) => (

                    <tr key={despesa.id}>

                      <td>
                        {formatarData(
                          despesa.data_despesa
                        )}
                      </td>

                      <td>
                        {despesa.categoria || "-"}
                      </td>

                      <td>
                        {despesa.descricao || "-"}
                      </td>

                      <td className="fw-bold">
                        {formatarMoeda(
                          despesa.valor
                        )}
                      </td>

                      <td>
                        {despesa.forma_pagamento || "-"}
                      </td>

                      <td>
                        <span
                          className={
                            despesa.status === "Pago"
                              ? "badge bg-success"
                              : despesa.status === "Pendente"
                              ? "badge bg-warning text-dark"
                              : "badge bg-secondary"
                          }
                        >
                          {despesa.status || "-"}
                        </span>
                      </td>

                      <td>
                        {despesa.observacoes || "-"}
                      </td>

                      <td>

                        <div className="d-flex gap-2">

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              editarDespesa(
                                despesa
                              )
                            }
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              excluirDespesa(
                                despesa.id
                              )
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

    </main>
  )
}