"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

const formularioInicial = {
  categoria: "",
  descricao: "",
  valor: "",
  data_despesa: "",
  forma_pagamento: "",
  status: "Pendente",
  observacoes: "",
}

export default function Despesas() {
  const [despesas, setDespesas] = useState([])
  const [formulario, setFormulario] = useState(formularioInicial)
  const [editando, setEditando] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    carregarDespesas()
  }, [])

  async function carregarDespesas() {
    setCarregando(true)

    const { data, error } = await supabase
      .from("despesas")
      .select("*")
      .order("data_despesa", { ascending: false })

    if (error) {
      console.error(error)
      alert("Erro ao carregar despesas: " + error.message)
    } else {
      setDespesas(data || [])
    }

    setCarregando(false)
  }

  function alterarCampo(campo, valor) {
    setFormulario({
      ...formulario,
      [campo]: valor,
    })
  }
  function limparFormulario() {
    setFormulario(formularioInicial)
    setEditando(null)
  }

  async function salvarDespesa(event) {
    event.preventDefault()

    if (!formulario.categoria) {
      alert("Informe a categoria.")
      return
    }

    if (!formulario.descricao) {
      alert("Informe a descrição.")
      return
    }

    if (!formulario.valor) {
      alert("Informe o valor.")
      return
    }

    if (!formulario.data_despesa) {
      alert("Informe a data.")
      return
    }

    setSalvando(true)

    const dados = {
      categoria: formulario.categoria,
      descricao: formulario.descricao,
      valor: Number(formulario.valor),
      data_despesa: formulario.data_despesa,
      forma_pagamento: formulario.forma_pagamento,
      status: formulario.status,
      observacoes: formulario.observacoes || null,
    }

    let resultado

    if (editando) {
      resultado = await supabase
        .from("despesas")
        .update(dados)
        .eq("id", editando)
    } else {
      resultado = await supabase
        .from("despesas")
        .insert([dados])
    }

    if (resultado.error) {
      console.error(resultado.error)
      alert("Erro ao salvar: " + resultado.error.message)
    } else {
      alert(
        editando
          ? "Despesa atualizada!"
          : "Despesa cadastrada!"
      )

      limparFormulario()
      carregarDespesas()
    }

    setSalvando(false)
  }
  function editarDespesa(despesa) {
    setEditando(despesa.id)

    setFormulario({
      categoria: despesa.categoria || "",
      descricao: despesa.descricao || "",
      valor: despesa.valor || "",
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
      alert("Erro ao excluir: " + error.message)
      return
    }

    alert("Despesa excluída!")
    carregarDespesas()
  }

  function formatarValor(valor) {
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

    return (
      partes[2] +
      "/" +
      partes[1] +
      "/" +
      partes[0]
    )
  }

  const total = despesas.reduce(function (soma, despesa) {
    return soma + Number(despesa.valor || 0)
  }, 0)

  const pagas = despesas.reduce(function (soma, despesa) {
    if (despesa.status === "Pago") {
      return soma + Number(despesa.valor || 0)
    }

    return soma
  }, 0)

  const pendentes = despesas.reduce(function (soma, despesa) {
    if (despesa.status === "Pendente") {
      return soma + Number(despesa.valor || 0)
    }

    return soma
  }, 0)
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h1 style={{ color: "#1f2937" }}>
          Despesas
        </h1>

        <p style={{ color: "#6b7280" }}>
          Cadastro e controle de despesas da imobiliária.
        </p>

        <section style={card}>
          <h2>
            {editando ? "Editar despesa" : "Nova despesa"}
          </h2>

          <form onSubmit={salvarDespesa}>
            <div style={grid}>
              <div>
                <label>Categoria</label>
                <input
                  style={input}
                  type="text"
                  value={formulario.categoria}
                  onChange={(e) =>
                    alterarCampo("categoria", e.target.value)
                  }
                  placeholder="Ex.: Manutenção"
                />
              </div>

              <div>
                <label>Descrição</label>
                <input
                  style={input}
                  type="text"
                  value={formulario.descricao}
                  onChange={(e) =>
                    alterarCampo("descricao", e.target.value)
                  }
                  placeholder="Descrição da despesa"
                />
              </div>

              <div>
                <label>Valor</label>
                <input
                  style={input}
                  type="number"
                  step="0.01"
                  min="0"
                  value={formulario.valor}
                  onChange={(e) =>
                    alterarCampo("valor", e.target.value)
                  }
                  placeholder="0,00"
                />
              </div>

              <div>
                <label>Data da despesa</label>
                <input
                  style={input}
                  type="date"
                  value={formulario.data_despesa}
                  onChange={(e) =>
                    alterarCampo("data_despesa", e.target.value)
                  }
                />
              </div>

              <div>
                <label>Forma de pagamento</label>
                <input
                  style={input}
                  type="text"
                  value={formulario.forma_pagamento}
                  onChange={(e) =>
                    alterarCampo("forma_pagamento", e.target.value)
                  }
                  placeholder="Pix, dinheiro, cartão..."
                />
              </div>

              <div>
                <label>Status</label>
                <select
                  style={input}
                  value={formulario.status}
                  onChange={(e) =>
                    alterarCampo("status", e.target.value)
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

              <div style={{ gridColumn: "1 / -1" }}>
                <label>Observações</label>

                <textarea
                  style={input}
                  rows="4"
                  value={formulario.observacoes}
                  onChange={(e) =>
                    alterarCampo("observacoes", e.target.value)
                  }
                  placeholder="Observações..."
                />
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <button
                type="submit"
                disabled={salvando}
                style={botaoSalvar}
              >
                {salvando
                  ? "Salvando..."
                  : editando
                  ? "Atualizar despesa"
                  : "Cadastrar despesa"}
              </button>

              {editando && (
                <button
                  type="button"
                  onClick={limparFormulario}
                  style={botaoCancelar}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <div style={cards}>
          <div style={card}>
            <strong>Total</strong>
            <h2>{formatarValor(total)}</h2>
          </div>

          <div style={card}>
            <strong>Pagas</strong>
            <h2>{formatarValor(pagas)}</h2>
          </div>

          <div style={card}>
            <strong>Pendentes</strong>
            <h2>{formatarValor(pendentes)}</h2>
          </div>
        </div>

        <section style={card}>
          <h2>Lista de despesas</h2>

          {carregando ? (
            <p>Carregando...</p>
          ) : despesas.length === 0 ? (
            <p>Nenhuma despesa cadastrada.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "900px",
                }}
              >
                <thead>
                  <tr>
                    <th style={th}>Data</th>
                    <th style={th}>Categoria</th>
                    <th style={th}>Descrição</th>
                    <th style={th}>Valor</th>
                    <th style={th}>Pagamento</th>
                    <th style={th}>Status</th>
                    <th style={th}>Observações</th>
                    <th style={th}>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {despesas.map((despesa) => (
                    <tr key={despesa.id}>
                      <td style={td}>
                        {formatarData(
                          despesa.data_despesa
                        )}
                      </td>

                      <td style={td}>
                        {despesa.categoria || "-"}
                      </td>

                      <td style={td}>
                        {despesa.descricao || "-"}
                      </td>

                      <td style={td}>
                        {formatarValor(despesa.valor)}
                      </td>

                      <td style={td}>
                        {despesa.forma_pagamento || "-"}
                      </td>

                      <td style={td}>
                        {despesa.status || "-"}
                      </td>

                      <td style={td}>
                        {despesa.observacoes || "-"}
                      </td>

                      <td style={td}>
                        <button
                          type="button"
                          onClick={() =>
                            editarDespesa(despesa)
                          }
                          style={botaoEditar}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            excluirDespesa(despesa.id)
                          }
                          style={botaoExcluir}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

const card = {
  background: "#ffffff",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "20px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
}

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
}

const input = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px",
  marginTop: "6px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
}

const cards = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
}

const th = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "2px solid #e5e7eb",
}

const td = {
  padding: "12px",
  borderBottom: "1px solid #e5e7eb",
}

const botaoSalvar = {
  background: "#16a34a",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  padding: "12px 20px",
  cursor: "pointer",
  fontWeight: "bold",
  marginRight: "10px",
}

const botaoCancelar = {
  background: "#6b7280",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  padding: "12px 20px",
  cursor: "pointer",
}

const botaoEditar = {
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "6px",
  padding: "7px 10px",
  cursor: "pointer",
  marginRight: "6px",
}

const botaoExcluir = {
  background: "#dc2626",
  color: "#ffffff",
  border: "none",
  borderRadius: "6px",
  padding: "7px 10px",
  cursor: "pointer",
}