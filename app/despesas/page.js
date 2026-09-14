"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Despesas() {
  const hoje = new Date()

  const [despesas, setDespesas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [categoria, setCategoria] = useState("")
  const [descricao, setDescricao] = useState("")
  const [valor, setValor] = useState("")
  const [dataDespesa, setDataDespesa] = useState(
    hoje.toISOString().split("T")[0]
  )
  const [formaPagamento, setFormaPagamento] = useState("")
  const [status, setStatus] = useState("Pago")
  const [observacoes, setObservacoes] = useState("")

  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())

  const nomesMeses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
  ]

  useEffect(() => {
    carregarDespesas()
  }, [])

  async function carregarDespesas() {
    setCarregando(true)

    const { data, error } = await supabase
      .from("despesas")
      .select("*")
      .order("data_despesa", {
        ascending: false
      })

    if (error) {
      console.error("Erro ao buscar despesas:", error)

      alert(
        "Erro ao carregar despesas: " +
        error.message
      )

      setDespesas([])
    } else {
      setDespesas(data || [])
    }

    setCarregando(false)
  }

  async function adicionarDespesa(e) {
    e.preventDefault()

    if (!categoria) {
      alert("Selecione uma categoria.")
      return
    }

    if (!descricao.trim()) {
      alert("Informe a descrição da despesa.")
      return
    }

    if (!valor || Number(valor) <= 0) {
      alert("Informe um valor válido.")
      return
    }

    if (!dataDespesa) {
      alert("Informe a data da despesa.")
      return
    }

    setSalvando(true)

    const novaDespesa = {
      categoria,
      descricao: descricao.trim(),
      valor: Number(valor),
      data_despesa: dataDespesa,
      forma_pagamento: formaPagamento || null,
      status,
      observacoes: observacoes.trim() || null
    }

    const { error } = await supabase
      .from("despesas")
      .insert([novaDespesa])

    if (error) {
      console.error("Erro ao cadastrar despesa:", error)

      alert(
        "Erro ao cadastrar despesa: " +
        error.message
      )

      setSalvando(false)
      return
    }

    alert("Despesa cadastrada com sucesso!")

    limparFormulario()
    await carregarDespesas()

    setSalvando(false)
  }

  async function excluirDespesa(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta despesa?"
    )

    if (!confirmar) {
      return
    }

    const { error } = await supabase
      .from("despesas")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Erro ao excluir despesa:", error)

      alert(
        "Erro ao excluir despesa: " +
        error.message
      )

      return
    }

    alert("Despesa excluída com sucesso!")

    await carregarDespesas()
  }

  function limparFormulario() {
    setCategoria("")
    setDescricao("")
    setValor("")
    setDataDespesa(
      new Date().toISOString().split("T")[0]
    )
    setFormaPagamento("")
    setStatus("Pago")
    setObservacoes("")
  }

  function moeda(valor) {
    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    )
  }

  function formatarData(data) {
    if (!data) {
      return "-"
    }

    return new Date(
      data + "T00:00:00"
    ).toLocaleDateString("pt-BR")
  }

  const despesasDoMes = despesas.filter((despesa) => {
    if (!despesa.data_despesa) {
      return false
    }

    const data = new Date(
      despesa.data_despesa + "T00:00:00"
    )

    return (
      data.getMonth() + 1 === Number(mes) &&
      data.getFullYear() === Number(ano)
    )
  })

  const despesasPagas = despesasDoMes.filter(
    (despesa) => despesa.status === "Pago"
  )

  const despesasPendentes = despesasDoMes.filter(
    (despesa) => despesa.status === "Pendente"
  )

  function somar(lista) {
    return lista.reduce(
      (total, item) =>
        total + Number(item.valor || 0),
      0
    )
  }

  const totalPago = somar(despesasPagas)

  const totalPendente = somar(
    despesasPendentes
  )

  const totalDespesas =
    totalPago + totalPendente

  function mesAnterior() {
    if (Number(mes) === 1) {
      setMes(12)
      setAno(Number(ano) - 1)
    } else {
      setMes(Number(mes) - 1)
    }
  }

  function proximoMes() {
    if (Number(mes) === 12) {
      setMes(1)
      setAno(Number(ano) + 1)
    } else {
      setMes(Number(mes) + 1)
    }
  }

  function irParaMesAtual() {
    setMes(hoje.getMonth() + 1)
    setAno(hoje.getFullYear())
  }

  return (
    <main className="container-fluid py-4">

      {/* CABEÇALHO */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h1 className="fw-bold mb-1">
            Despesas
          </h1>

          <p className="text-muted mb-0">
            Controle das despesas da imobiliária
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={carregarDespesas}
        >
          Atualizar
        </button>

      </div>

      {/* ACESSO RÁPIDO */}

      <div className="card shadow-sm mb-4">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            Acesso rápido
          </h5>

          <div className="row g-2">

            <div className="col-6 col-md-3">
              <a
                href="/financeiro"
                className="btn btn-primary w-100"
              >
                Financeiro
              </a>
            </div>

            <div className="col-6 col-md-3">
              <a
                href="/recebimentos"
                className="btn btn-success w-100"
              >
                Recebimentos
              </a>
            </div>

            <div className="col-6 col-md-3">
              <a
                href="/contratos"
                className="btn btn-outline-primary w-100"
              >
                Contratos
              </a>
            </div>

            <div className="col-6 col-md-3">
              <a
                href="/"
                className="btn btn-outline-secondary w-100"
              >
                Dashboard
              </a>
            </div>

          </div>

        </div>

      </div>

      {/* FORMULÁRIO */}

      <div className="card shadow-sm mb-4">

        <div className="card-header">
          <h5 className="fw-bold mb-0">
            Nova despesa
          </h5>
        </div>

        <div className="card-body">

          <form onSubmit={adicionarDespesa}>

            <div className="row g-3">

              <div className="col-md-4">

                <label className="form-label fw-bold">
                  Categoria
                </label>

                <select
                  className="form-select"
                  value={categoria}
                  onChange={(e) =>
                    setCategoria(e.target.value)
                  }
                >

                  <option value="">
                    Selecione
                  </option>

                  <option value="Aluguel">
                    Aluguel
                  </option>

                  <option value="Água">
                    Água
                  </option>

                  <option value="Energia">
                    Energia elétrica
                  </option>

                  <option value="Internet">
                    Internet
                  </option>

                  <option value="Telefone">
                    Telefone
                  </option>

                  <option value="Marketing">
                    Marketing
                  </option>

                  <option value="Manutenção">
                    Manutenção
                  </option>

                  <option value="Material">
                    Material de escritório
                  </option>

                  <option value="Impostos">
                    Impostos
                  </option>

                  <option value="Comissões">
                    Comissões
                  </option>

                  <option value="Salários">
                    Salários
                  </option>

                  <option value="Outros">
                    Outros
                  </option>

                </select>

              </div>

              <div className="col-md-5">

                <label className="form-label fw-bold">
                  Descrição
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={descricao}
                  onChange={(e) =>
                    setDescricao(e.target.value)
                  }
                  placeholder="Ex.: Conta de energia"
                />

              </div>

              <div className="col-md-3">

                <label className="form-label fw-bold">
                  Valor
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={valor}
                  onChange={(e) =>
                    setValor(e.target.value)
                  }
                  placeholder="0,00"
                />

              </div>

              <div className="col-md-3">

                <label className="form-label fw-bold">
                  Data da despesa
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={dataDespesa}
                  onChange={(e) =>
                    setDataDespesa(e.target.value)
                  }
                />

              </div>

              <div className="col-md-3">

                <label className="form-label fw-bold">
                  Forma de pagamento
                </label>

                <select
                  className="form-select"
                  value={formaPagamento}
                  onChange={(e) =>
                    setFormaPagamento(
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

                  <option value="Pix">
                    Pix
                  </option>

                  <option value="Cartão de débito">
                    Cartão de débito
                  </option>

                  <option value="Cartão de crédito">
                    Cartão de crédito
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

              <div className="col-md-3">

                <label className="form-label fw-bold">
                  Status
                </label>

                <select
                  className="form-select"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                >

                  <option value="Pago">
                    Pago
                  </option>

                  <option value="Pendente">
                    Pendente
                  </option>

                </select>

              </div>

              <div className="col-md-3">

                <label className="form-label fw-bold">
                  Observações
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={observacoes}
                  onChange={(e) =>
                    setObservacoes(e.target.value)
                  }
                  placeholder="Opcional"
                />

              </div>

              <div className="col-12">

                <div className="d-flex gap-2">

                  <button
                    type="submit"
                    className="btn btn-danger"
                    disabled={salvando}
                  >
                    {salvando
                      ? "Salvando..."
                      : "Cadastrar despesa"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={limparFormulario}
                  >
                    Limpar
                  </button>

                </div>

              </div>

            </div>

          </form>

        </div>

      </div>

      {/* FILTRO DO MÊS */}

      <div className="card shadow-sm mb-4">

        <div className="card-body">

          <div className="row align-items-end g-3">

            <div className="col-md-4">

              <label className="form-label fw-bold">
                Mês
              </label>

              <select
                className="form-select"
                value={mes}
                onChange={(e) =>
                  setMes(
                    Number(e.target.value)
                  )
                }
              >

                {nomesMeses.map(
                  (nome, index) => (
                    <option
                      key={index + 1}
                      value={index + 1}
                    >
                      {nome}
                    </option>
                  )
                )}

              </select>

            </div>

            <div className="col-md-3">

              <label className="form-label fw-bold">
                Ano
              </label>

              <select
                className="form-select"
                value={ano}
                onChange={(e) =>
                  setAno(
                    Number(e.target.value)
                  )
                }
              >

                {Array.from(
                  { length: 11 },
                  (_, index) =>
                    hoje.getFullYear() -
                    5 +
                    index
                ).map((valorAno) => (

                  <option
                    key={valorAno}
                    value={valorAno}
                  >
                    {valorAno}
                  </option>

                ))}

              </select>

            </div>

            <div className="col-md-5">

              <div className="d-flex gap-2">

                <button
                  className="btn btn-outline-secondary flex-fill"
                  onClick={mesAnterior}
                >
                  ← Anterior
                </button>

                <button
                  className="btn btn-outline-primary"
                  onClick={irParaMesAtual}
                >
                  Mês atual
                </button>

                <button
                  className="btn btn-outline-secondary flex-fill"
                  onClick={proximoMes}
                >
                  Próximo →
                </button>

              </div>

            </div>

          </div>

          <div className="text-center mt-4">

            <h2 className="fw-bold mb-0">
              {nomesMeses[Number(mes) - 1]} / {ano}
            </h2>

          </div>

        </div>

      </div>

      {/* RESUMO */}

      <div className="row g-3 mb-4">

        <div className="col-md-4">

          <div className="card shadow-sm border-danger border-3 h-100">

            <div className="card-body">

              <p className="text-muted mb-1">
                Total de despesas
              </p>

              <h2 className="fw-bold text-danger">
                {moeda(totalDespesas)}
              </h2>

              <small className="text-muted">
                {despesasDoMes.length} despesa(s)
              </small>

            </div>

          </div>

        </div>

        <div className="col-md-4">

          <div className="card shadow-sm border-success border-3 h-100">

            <div className="card-body">

              <p className="text-muted mb-1">
                Despesas pagas
              </p>

              <h2 className="fw-bold text-success">
                {moeda(totalPago)}
              </h2>

              <small className="text-muted">
                {despesasPagas.length} paga(s)
              </small>

            </div>

          </div>

        </div>

        <div className="col-md-4">

          <div className="card shadow-sm border-warning border-3 h-100">

            <div className="card-body">

              <p className="text-muted mb-1">
                Despesas pendentes
              </p>

              <h2 className="fw-bold text-warning">
                {moeda(totalPendente)}
              </h2>

              <small className="text-muted">
                {despesasPendentes.length} pendência(s)
              </small>

            </div>

          </div>

        </div>

      </div>

      {/* LISTA DE DESPESAS */}

      <div className="card shadow-sm">

        <div className="card-header d-flex justify-content-between align-items-center">

          <h5 className="mb-0 fw-bold">
            Despesas de {nomesMeses[Number(mes) - 1]} / {ano}
          </h5>

          <span className="badge bg-danger">
            {despesasDoMes.length}
          </span>

        </div>

        <div className="card-body">

          {carregando ? (

            <div className="text-center py-5">

              <div
                className="spinner-border text-primary"
                role="status"
              ></div>

              <p className="text-muted mt-3">
                Carregando despesas...
              </p>

            </div>

          ) : despesasDoMes.length === 0 ? (

            <div className="text-center text-muted py-5">

              <h5>
                Nenhuma despesa encontrada.
              </h5>

              <p className="mb-0">
                Não existem despesas cadastradas
                para este mês.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>

                  <tr>
                    <th>Data</th>
                    <th>Categoria</th>
                    <th>Descrição</th>
                    <th>Forma</th>
                    <th>Status</th>
                    <th>Valor</th>
                    <th>Ação</th>
                  </tr>

                </thead>

                <tbody>

                  {despesasDoMes.map(
                    (despesa) => (

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

                        <td>
                          {despesa.forma_pagamento ||
                           "-"}
                        </td>

                        <td>

                          <span
                            className={
                              despesa.status === "Pago"
                                ? "badge bg-success"
                                : "badge bg-warning text-dark"
                            }
                          >
                            {despesa.status || "-"}
                          </span>

                        </td>

                        <td className="fw-bold text-danger">
                          {moeda(despesa.valor)}
                        </td>

                        <td>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              excluirDespesa(
                                despesa.id
                              )
                            }
                          >
                            Excluir
                          </button>

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

    </main>
  )
} 