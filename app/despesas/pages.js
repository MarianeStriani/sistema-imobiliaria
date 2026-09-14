"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "../../lib/supabase"

export default function Despesas() {
  const [despesas, setDespesas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")
  const [mensagem, setMensagem] = useState("")

  const [editandoId, setEditandoId] = useState(null)

  const [form, setForm] = useState({
    categoria: "Administrativa",
    descricao: "",
    valor: "",
    data_despesa: new Date().toISOString().split("T")[0],
    forma_pagamento: "Pix",
    status: "Pago",
    observacoes: "",
  })

  const categorias = [
    "Administrativa",
    "Manutenção",
    "Impostos",
    "Condomínio",
    "Água",
    "Energia",
    "Internet",
    "Marketing",
    "Comissão",
    "Material",
    "Outros",
  ]

  const formasPagamento = [
    "Pix",
    "Dinheiro",
    "Cartão",
    "Transferência",
    "Boleto",
    "Outro",
  ]

  async function buscarDespesas() {
    setCarregando(true)
    setErro("")

    const { data, error } = await supabase
      .from("despesas")
      .select("*")
      .order("data_despesa", { ascending: false })
      .order("id", { ascending: false })

    if (error) {
      console.error(error)
      setErro(error.message)
      setDespesas([])
    } else {
      setDespesas(data || [])
    }

    setCarregando(false)
  }

  useEffect(() => {
    buscarDespesas()
  }, [])

  function alterarCampo(e) {
    const { name, value } = e.target

    setForm((anterior) => ({
      ...anterior,
      [name]: value,
    }))
  }

  function limparFormulario() {
    setForm({
      categoria: "Administrativa",
      descricao: "",
      valor: "",
      data_despesa: new Date().toISOString().split("T")[0],
      forma_pagamento: "Pix",
      status: "Pago",
      observacoes: "",
    })

    setEditandoId(null)
  }

  async function salvarDespesa(e) {
    e.preventDefault()

    setErro("")
    setMensagem("")

    if (!form.descricao.trim()) {
      setErro("Informe a descrição da despesa.")
      return
    }

    if (!form.valor || Number(form.valor) <= 0) {
      setErro("Informe um valor maior que zero.")
      return
    }

    setSalvando(true)

    const dados = {
      categoria: form.categoria,
      descricao: form.descricao.trim(),
      valor: Number(form.valor),
      data_despesa: form.data_despesa,
      forma_pagamento: form.forma_pagamento,
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
      console.error(resultado.error)
      setErro(resultado.error.message)
    } else {
      setMensagem(
        editandoId
          ? "Despesa atualizada com sucesso!"
          : "Despesa cadastrada com sucesso!"
      )

      limparFormulario()
      await buscarDespesas()
    }

    setSalvando(false)
  }

  function editarDespesa(despesa) {
    setEditandoId(despesa.id)

    setForm({
      categoria: despesa.categoria || "Administrativa",
      descricao: despesa.descricao || "",
      valor: despesa.valor ?? "",
      data_despesa:
        despesa.data_despesa ||
        new Date().toISOString().split("T")[0],
      forma_pagamento: despesa.forma_pagamento || "Pix",
      status: despesa.status || "Pago",
      observacoes: despesa.observacoes || "",
    })

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  async function excluirDespesa(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta despesa?"
    )

    if (!confirmar) {
      return
    }

    setErro("")
    setMensagem("")

    const { error } = await supabase
      .from("despesas")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
      setErro(error.message)
    } else {
      setMensagem("Despesa excluída com sucesso!")
      await buscarDespesas()
    }
  }

  function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const totalDespesas = despesas
    .filter((item) => item.status === "Pago")
    .reduce(
      (total, item) => total + Number(item.valor || 0),
      0
    )

  return (
    <main className="container py-4">

      {/* CABEÇALHO */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">Despesas</h1>
          <p className="text-muted mb-0">
            Controle das despesas da imobiliária
          </p>
        </div>

        <Link
          href="/financeiro"
          className="btn btn-outline-primary"
        >
          Financeiro
        </Link>
      </div>

      {/* ACESSO RÁPIDO */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">

          <h5 className="mb-3">
            Acesso rápido
          </h5>

          <div className="d-flex flex-wrap gap-2">

            <Link
              href="/financeiro"
              className="btn btn-outline-primary"
            >
              Financeiro
            </Link>

            <Link
              href="/recebimentos"
              className="btn btn-outline-success"
            >
              Recebimentos
            </Link>

            <Link
              href="/contratos"
              className="btn btn-outline-secondary"
            >
              Contratos
            </Link>

            <Link
              href="/clientes"
              className="btn btn-outline-secondary"
            >
              Clientes
            </Link>

            <Link
              href="/imoveis"
              className="btn btn-outline-secondary"
            >
              Imóveis
            </Link>

            <Link
              href="/"
              className="btn btn-outline-dark"
            >
              Dashboard
            </Link>

          </div>

        </div>
      </div>

      {/* MENSAGENS */}
      {erro && (
        <div className="alert alert-danger">
          <strong>Erro:</strong>
          <br />
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="alert alert-success">
          {mensagem}
        </div>
      )}

      {/* FORMULÁRIO */}
      <div className="card shadow-sm mb-4">

        <div className="card-body">

          <h4 className="mb-4">
            {editandoId
              ? "Editar despesa"
              : "Cadastrar despesa"}
          </h4>

          <form onSubmit={salvarDespesa}>

            <div className="row g-3">

              {/* CATEGORIA */}
              <div className="col-md-4">

                <label className="form-label">
                  Categoria
                </label>

                <select
                  name="categoria"
                  className="form-select"
                  value={form.categoria}
                  onChange={alterarCampo}
                >
                  {categorias.map((categoria) => (
                    <option
                      key={categoria}
                      value={categoria}
                    >
                      {categoria}
                    </option>
                  ))}
                </select>

              </div>

              {/* DESCRIÇÃO */}
              <div className="col-md-8">

                <label className="form-label">
                  Descrição
                </label>

                <input
                  type="text"
                  name="descricao"
                  className="form-control"
                  value={form.descricao}
                  onChange={alterarCampo}
                  placeholder="Ex.: Conta de energia da imobiliária"
                  required
                />

              </div>

              {/* VALOR */}
              <div className="col-md-4">

                <label className="form-label">
                  Valor
                </label>

                <input
                  type="number"
                  name="valor"
                  className="form-control"
                  value={form.valor}
                  onChange={alterarCampo}
                  placeholder="0,00"
                  min="0.01"
                  step="0.01"
                  required
                />

              </div>

              {/* DATA */}
              <div className="col-md-4">

                <label className="form-label">
                  Data da despesa
                </label>

                <input
                  type="date"
                  name="data_despesa"
                  className="form-control"
                  value={form.data_despesa}
                  onChange={alterarCampo}
                  required
                />

              </div>

              {/* FORMA DE PAGAMENTO */}
              <div className="col-md-4">

                <label className="form-label">
                  Forma de pagamento
                </label>

                <select
                  name="forma_pagamento"
                  className="form-select"
                  value={form.forma_pagamento}
                  onChange={alterarCampo}
                >
                  {formasPagamento.map((forma) => (
                    <option
                      key={forma}
                      value={forma}
                    >
                      {forma}
                    </option>
                  ))}
                </select>

              </div>

              {/* STATUS */}
              <div className="col-md-4">

                <label className="form-label">
                  Status
                </label>

                <select
                  name="status"
                  className="form-select"
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
              <div className="col-md-8">

                <label className="form-label">
                  Observações
                </label>

                <input
                  type="text"
                  name="observacoes"
                  className="form-control"
                  value={form.observacoes}
                  onChange={alterarCampo}
                  placeholder="Observações adicionais"
                />

              </div>

            </div>

            {/* BOTÕES */}
            <div className="d-flex gap-2 mt-4">

              <button
                type="submit"
                className="btn btn-primary"
                disabled={salvando}
              >
                {salvando
                  ? "Salvando..."
                  : editandoId
                  ? "Salvar alterações"
                  : "Cadastrar despesa"}
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

          <div className="card shadow-sm border-danger h-100">

            <div className="card-body">

              <h6 className="text-muted">
                Total de despesas pagas
              </h6>

              <h2 className="text-danger mb-0">
                {moeda(totalDespesas)}
              </h2>

            </div>

          </div>

        </div>

        <div className="col-md-4">

          <div className="card shadow-sm h-100">

            <div className="card-body">

              <h6 className="text-muted">
                Despesas cadastradas
              </h6>

              <h2 className="mb-0">
                {despesas.length}
              </h2>

            </div>

          </div>

        </div>

        <div className="col-md-4">

          <div className="card shadow-sm h-100">

            <div className="card-body">

              <h6 className="text-muted">
                Pendentes
              </h6>

              <h2 className="text-warning mb-0">
                {
                  despesas.filter(
                    (item) => item.status === "Pendente"
                  ).length
                }
              </h2>

            </div>

          </div>

        </div>

      </div>

      {/* LISTA */}
      <div className="card shadow-sm">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h4 className="mb-0">
              Despesas cadastradas
            </h4>

            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={buscarDespesas}
            >
              Atualizar
            </button>

          </div>

          {carregando ? (

            <div className="alert alert-info mb-0">
              Carregando despesas...
            </div>

          ) : despesas.length === 0 ? (

            <div className="alert alert-light border mb-0">
              Nenhuma despesa cadastrada.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>

                  <tr>
                    <th>Data</th>
                    <th>Categoria</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Pagamento</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>

                </thead>

                <tbody>

                  {despesas.map((despesa) => (

                    <tr key={despesa.id}>

                      <td>
                        {despesa.data_despesa
                          ? new Date(
                              despesa.data_despesa +
                                "T00:00:00"
                            ).toLocaleDateString("pt-BR")
                          : "-"}
                      </td>

                      <td>
                        {despesa.categoria}
                      </td>

                      <td>
                        {despesa.descricao}
                      </td>

                      <td>
                        <strong>
                          {moeda(despesa.valor)}
                        </strong>
                      </td>

                      <td>
                        {despesa.forma_pagamento || "-"}
                      </td>

                      <td>

                        {despesa.status === "Pago" ? (

                          <span className="badge bg-success">
                            Pago
                          </span>

                        ) : (

                          <span className="badge bg-warning text-dark">
                            Pendente
                          </span>

                        )}

                      </td>

                      <td>

                        <div className="d-flex gap-2">

                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              editarDespesa(despesa)
                            }
                          >
                            Editar
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              excluirDespesa(despesa.id)
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
