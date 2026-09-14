"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Despesas() {
  const hoje = new Date()

  const [despesas, setDespesas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())

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
    buscarDespesas()
  }, [])

  async function buscarDespesas() {
    setCarregando(true)

    const { data, error } = await supabase
      .from("despesas")
      .select("*")
      .order("data_despesa", { ascending: false })

    if (error) {
      console.error("Erro ao buscar despesas:", error)
      alert("Erro ao carregar as despesas.")
    } else {
      setDespesas(data || [])
    }

    setCarregando(false)
  }

  function atualizarCampo(campo, valor) {
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

  async function salvarDespesa(e) {
    e.preventDefault()

    if (!form.categoria.trim()) {
      alert("Informe a categoria da despesa.")
      return
    }

    if (!form.descricao.trim()) {
      alert("Informe a descrição da despesa.")
      return
    }

    if (!form.valor) {
      alert("Informe o valor da despesa.")
      return
    }

    if (!form.data_despesa) {
      alert("Informe a data da despesa.")
      return
    }

    setSalvando(true)

    const dados = {
      categoria: form.categoria.trim(),
      descricao: form.descricao.trim(),
      valor: Number(
        String(form.valor)
          .replace(/\./g, "")
          .replace(",", ".")
      ),
      data_despesa: form.data_despesa,
      forma_pagamento: form.forma_pagamento.trim(),
      status: form.status,
      observacoes: form.observacoes.trim(),
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
      console.error("Erro ao salvar despesa:", resultado.error)
      alert("Erro ao salvar a despesa: " + resultado.error.message)
    } else {
      alert(
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
      categoria: despesa.categoria || "",
      descricao: despesa.descricao || "",
      valor:
        despesa.valor !== null && despesa.valor !== undefined
          ? String(despesa.valor).replace(".", ",")
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
      alert("Erro ao excluir a despesa: " + error.message)
      return
    }

    alert("Despesa excluída com sucesso.")

    await buscarDespesas()
  }

  const despesasDoMes = useMemo(() => {
    return despesas.filter((despesa) => {
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
  }, [despesas, mes, ano])

  const totalDespesas = useMemo(() => {
    return despesasDoMes.reduce((total, despesa) => {
      return total + Number(despesa.valor || 0)
    }, 0)
  }, [despesasDoMes])

  const totalPagas = useMemo(() => {
    return despesasDoMes
      .filter(
        (despesa) =>
          String(despesa.status || "").toLowerCase() === "pago" ||
          String(despesa.status || "").toLowerCase() === "paga"
      )
      .reduce((total, despesa) => {
        return total + Number(despesa.valor || 0)
      }, 0)
  }, [despesasDoMes])

  const totalPendentes = useMemo(() => {
    return despesasDoMes
      .filter(
        (despesa) =>
          String(despesa.status || "").toLowerCase() === "pendente" ||
          String(despesa.status || "").toLowerCase() === "pendentes"
      )
      .reduce((total, despesa) => {
        return total + Number(despesa.valor || 0)
      }, 0)
  }, [despesasDoMes])

  const categorias = useMemo(() => {
    const resultado = {}

    despesasDoMes.forEach((despesa) => {
      const categoria = despesa.categoria || "Sem categoria"

      if (!resultado[categoria]) {
        resultado[categoria] = 0
      }

      resultado[categoria] += Number(despesa.valor || 0)
    })

    return Object.entries(resultado).sort((a, b) => b[1] - a[1])
  }, [despesasDoMes])

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  function formatarData(data) {
    if (!data) {
      return "-"
    }

    const partes = data.split("-")

    if (partes.length !== 3) {
      return data
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  function statusClasse(status) {
    const valor = String(status || "").toLowerCase()

    if (valor === "pago" || valor === "paga") {
      return "bg-success"
    }

    if (valor === "pendente" || valor === "pendentes") {
      return "bg-warning text-dark"
    }

    if (valor === "cancelado" || valor === "cancelada") {
      return "bg-danger"
    }

    return "bg-secondary"
  }

  return (
    <main className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h1 className="mb-1">Despesas</h1>
          <p className="text-muted mb-0">
            Controle das despesas da imobiliária
          </p>
        </div>

        <a href="/" className="btn btn-outline-secondary">
          ← Voltar ao Dashboard
        </a>
      </div>

      {/* FORMULÁRIO */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            {editandoId ? "Editar despesa" : "Cadastrar despesa"}
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
                    atualizarCampo("categoria", e.target.value)
                  }
                  placeholder="Ex.: Manutenção"
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
                    atualizarCampo("descricao", e.target.value)
                  }
                  placeholder="Descrição da despesa"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Valor *
                </label>

                <input
                  type="text"
                  inputMode="decimal"
                  className="form-control"
                  value={form.valor}
                  onChange={(e) =>
                    atualizarCampo("valor", e.target.value)
                  }
                  placeholder="0,00"
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
                    atualizarCampo(
                      "data_despesa",
                      e.target.value
                    )
                  }
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
                    atualizarCampo(
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
                  <option value="Débito automático">
                    Débito automático
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
                    atualizarCampo("status", e.target.value)
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
                    atualizarCampo(
                      "observacoes",
                      e.target.value
                    )
                  }
                  placeholder="Observações adicionais"
                />
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={salvando}
              >
                {salvando
                  ? "Salvando..."
                  : editandoId
                  ? "Atualizar despesa"
                  : "Cadastrar despesa"}
              </button>

              {editandoId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={limparFormulario}
                >
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* FILTRO */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">
                Mês
              </label>

              <select
                className="form-select"
                value={mes}
                onChange={(e) =>
                  setMes(Number(e.target.value))
                }
              >
                <option value="1">Janeiro</option>
                <option value="2">Fevereiro</option>
                <option value="3">Março</option>
                <option value="4">Abril</option>
                <option value="5">Maio</option>
                <option value="6">Junho</option>
                <option value="7">Julho</option>
                <option value="8">Agosto</option>
                <option value="9">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Ano
              </label>

              <input
                type="number"
                className="form-control"
                value={ano}
                onChange={(e) =>
                  setAno(Number(e.target.value))
                }
              />
            </div>

            <div className="col-md-5">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={buscarDespesas}
              >
                🔄 Atualizar despesas
              </button>
            </div>
          </div>
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

              <h3 className="mb-0">
                {formatarMoeda(totalDespesas)}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">
                Despesas pagas
              </h6>

              <h3 className="text-success mb-0">
                {formatarMoeda(totalPagas)}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">
                Despesas pendentes
              </h6>

              <h3 className="text-warning mb-0">
                {formatarMoeda(totalPendentes)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORIAS */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            Despesas por categoria
          </h5>
        </div>

        <div className="card-body">
          {categorias.length === 0 ? (
            <p className="text-muted mb-0">
              Nenhuma despesa cadastrada neste mês.
            </p>
          ) : (
            <div className="row g-3">
              {categorias.map(([categoria, valor]) => (
                <div
                  className="col-md-4"
                  key={categoria}
                >
                  <div className="border rounded p-3 h-100">
                    <div className="fw-bold">
                      {categoria}
                    </div>

                    <div className="fs-5 mt-2">
                      {formatarMoeda(valor)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LISTAGEM */}
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Despesas cadastradas
          </h5>

          <span className="badge bg-secondary">
            {despesasDoMes.length} registro(s)
          </span>
        </div>

        <div className="card-body p-0">
          {carregando ? (
            <div className="p-4 text-center">
              Carregando despesas...
            </div>
          ) : despesasDoMes.length === 0 ? (
            <div className="p-4 text-center text-muted">
              Nenhuma despesa encontrada para o período
              selecionado.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-striped mb-0">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Categoria</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Pagamento</th>
                    <th>Status</th>
                    <th>Observações</th>
                    <th className="text-center">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {despesasDoMes.map((despesa) => (
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
                          className={`badge ${statusClasse(
                            despesa.status
                          )}`}
                        >
                          {despesa.status || "-"}
                        </span>
                      </td>

                      <td>
                        {despesa.observacoes || "-"}
                      </td>

                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              editarDespesa(despesa)
                            }
                          >
                            Editar
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