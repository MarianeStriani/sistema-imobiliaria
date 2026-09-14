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
      .select("*")
      .order("data_despesa", { ascending: false })

    if (error) {
      console.error("Erro ao carregar despesas:", error)
      alert("Erro ao carregar despesas: " + error.message)
    } else {
      setDespesas(data || [])
    }

    setCarregando(false)
  }

  function alterarCampo(event) {
    const { name, value } = event.target

    setForm((atual) => ({
      ...atual,
      [name]: value,
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

    if (!form.categoria || !form.descricao || !form.valor || !form.data_despesa) {
      alert("Preencha categoria, descrição, valor e data.")
      return
    }

    setSalvando(true)

    const dados = {
      categoria: form.categoria,
      descricao: form.descricao,
      valor: Number(form.valor),
      data_despesa: form.data_despesa,
      forma_pagamento: form.forma_pagamento,
      status: form.status,
      observacoes: form.observacoes,
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
      alert("Erro ao salvar despesa: " + resultado.error.message)
    } else {
      alert(editandoId ? "Despesa atualizada!" : "Despesa cadastrada!")
      limparFormulario()
      await carregarDespesas()
    }

    setSalvando(false)
  }

  function editarDespesa(despesa) {
    setForm({
      categoria: despesa.categoria || "",
      descricao: despesa.descricao || "",
      valor: despesa.valor ?? "",
      data_despesa: despesa.data_despesa || "",
      forma_pagamento: despesa.forma_pagamento || "",
      status: despesa.status || "Pendente",
      observacoes: despesa.observacoes || "",
    })

    setEditandoId(despesa.id)

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
      alert("Erro ao excluir despesa: " + error.message)
      return
    }

    alert("Despesa excluída!")
    await carregarDespesas()
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

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const totalDespesas = despesas.reduce(
    (total, despesa) => total + Number(despesa.valor || 0),
    0
  )

  const totalPagas = despesas
    .filter((despesa) => despesa.status === "Pago")
    .reduce(
      (total, despesa) => total + Number(despesa.valor || 0),
      0
    )

  const totalPendentes = despesas
    .filter((despesa) => despesa.status !== "Pago")
    .reduce(
      (total, despesa) => total + Number(despesa.valor || 0),
      0
    )

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Despesas</h1>
            <p style={styles.subtitle}>
              Controle e gerenciamento das despesas da imobiliária
            </p>
          </div>
        </header>

        <section style={styles.cards}>
          <div style={styles.card}>
            <span style={styles.cardLabel}>Total de despesas</span>
            <strong style={styles.cardValue}>
              {formatarValor(totalDespesas)}
            </strong>
          </div>

          <div style={styles.card}>
            <span style={styles.cardLabel}>Despesas pagas</span>
            <strong style={styles.cardValue}>
              {formatarValor(totalPagas)}
            </strong>
          </div>

          <div style={styles.card}>
            <span style={styles.cardLabel}>Despesas pendentes</span>
            <strong style={styles.cardValue}>
              {formatarValor(totalPendentes)}
            </strong>
          </div>
        </section>

        <section style={styles.formCard}>
          <h2 style={styles.sectionTitle}>
            {editandoId ? "Editar despesa" : "Nova despesa"}
          </h2>

          <form onSubmit={salvarDespesa}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Categoria *</label>

                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={alterarCampo}
                  style={styles.input}
                >
                  <option value="">Selecione</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Água">Água</option>
                  <option value="Energia">Energia</option>
                  <option value="Internet">Internet</option>
                  <option value="Telefone">Telefone</option>
                  <option value="Impostos">Impostos</option>
                  <option value="Salários">Salários</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Materiais">Materiais</option>
                  <option value="Administrativo">Administrativo</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Descrição *</label>

                <input
                  type="text"
                  name="descricao"
                  value={form.descricao}
                  onChange={alterarCampo}
                  placeholder="Descrição da despesa"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Valor *</label>

                <input
                  type="number"
                  name="valor"
                  value={form.valor}
                  onChange={alterarCampo}
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Data da despesa *</label>

                <input
                  type="date"
                  name="data_despesa"
                  value={form.data_despesa}
                  onChange={alterarCampo}
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Forma de pagamento</label>

                <select
                  name="forma_pagamento"
                  value={form.forma_pagamento}
                  onChange={alterarCampo}
                  style={styles.input}
                >
                  <option value="">Selecione</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="PIX">PIX</option>
                  <option value="Cartão de crédito">
                    Cartão de crédito
                  </option>
                  <option value="Cartão de débito">
                    Cartão de débito
                  </option>
                  <option value="Boleto">Boleto</option>
                  <option value="Transferência">Transferência</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Status</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={alterarCampo}
                  style={styles.input}
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Pago">Pago</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
                <label style={styles.label}>Observações</label>

                <textarea
                  name="observacoes"
                  value={form.observacoes}
                  onChange={alterarCampo}
                  placeholder="Observações"
                  rows="3"
                  style={styles.textarea}
                />
              </div>
            </div>

            <div style={styles.buttons}>
              <button
                type="submit"
                disabled={salvando}
                style={styles.primaryButton}
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
                  onClick={limparFormulario}
                  style={styles.secondaryButton}
                >
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
        </section>

        <section style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h2 style={styles.sectionTitle}>Lista de despesas</h2>

            <button
              type="button"
              onClick={carregarDespesas}
              style={styles.refreshButton}
            >
              Atualizar
            </button>
          </div>

          {carregando ? (
            <p style={styles.message}>Carregando despesas...</p>
          ) : despesas.length === 0 ? (
            <p style={styles.message}>
              Nenhuma despesa cadastrada.
            </p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Data</th>
                    <th style={styles.th}>Categoria</th>
                    <th style={styles.th}>Descrição</th>
                    <th style={styles.th}>Valor</th>
                    <th style={styles.th}>Pagamento</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {despesas.map((despesa) => (
                    <tr key={despesa.id}>
                      <td style={styles.td}>
                        {formatarData(despesa.data_despesa)}
                      </td>

                      <td style={styles.td}>
                        {despesa.categoria || "-"}
                      </td>

                      <td style={styles.td}>
                        {despesa.descricao || "-"}
                      </td>

                      <td style={styles.td}>
                        {formatarValor(despesa.valor)}
                      </td>

                      <td style={styles.td}>
                        {despesa.forma_pagamento || "-"}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.status,
                            ...(despesa.status === "Pago"
                              ? styles.statusPago
                              : despesa.status === "Cancelado"
                                ? styles.statusCancelado
                                : styles.statusPendente),
                          }}
                        >
                          {despesa.status || "Pendente"}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <button
                            type="button"
                            onClick={() => editarDespesa(despesa)}
                            style={styles.editButton}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => excluirDespesa(despesa.id)}
                            style={styles.deleteButton}
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
        </section>
      </div>
    </main>
  )
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "30px 20px",
    fontFamily: "Arial, sans-serif",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    color: "#1f2937",
  },

  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "25px",
  },

  card: {
    background: "#ffffff",
    padding: "22px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  cardLabel: {
    display: "block",
    color: "#6b7280",
    marginBottom: "8px",
    fontSize: "14px",
  },

  cardValue: {
    fontSize: "24px",
    color: "#111827",
  },

  formCard: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "25px",
  },

  tableCard: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  sectionTitle: {
    marginTop: 0,
    color: "#1f2937",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    marginBottom: "6px",
    fontWeight: "bold",
    color: "#374151",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "15px",
    background: "#ffffff",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "15px",
    resize: "vertical",
  },

  buttons: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    flexWrap: "wrap",
  },

  primaryButton: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "7px",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  secondaryButton: {
    padding: "12px 20px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    background: "#ffffff",
    color: "#374151",
    cursor: "pointer",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
  },

  refreshButton: {
    padding: "9px 15px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    background: "#ffffff",
    cursor: "pointer",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "850px",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid #e5e7eb",
    color: "#374151",
    fontSize: "14px",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    color: "#4b5563",
    fontSize: "14px",
  },

  status: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  statusPago: {
    background: "#dcfce7",
    color: "#166534",
  },

  statusPendente: {
    background: "#fef3c7",
    color: "#92400e",
  },

  statusCancelado: {
    background: "#fee2e2",
    color: "#991b1b",
  },

  actionButtons: {
    display: "flex",
    gap: "6px",
  },

  editButton: {
    padding: "7px 10px",
    border: "none",
    borderRadius: "5px",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
  },

  deleteButton: {
    padding: "7px 10px",
    border: "none",
    borderRadius: "5px",
    background: "#dc2626",
    color: "#ffffff",
    cursor: "pointer",
  },

  message: {
    padding: "20px",
    textAlign: "center",
    color: "#6b7280",
  },
}