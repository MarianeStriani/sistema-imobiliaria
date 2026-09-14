"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Despesas() {
  const [despesas, setDespesas] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [descricao, setDescricao] = useState("")
  const [categoria, setCategoria] = useState("")
  const [valor, setValor] = useState("")
  const [data, setData] = useState("")
  const [observacao, setObservacao] = useState("")

  useEffect(() => {
    buscarDespesas()
  }, [])

  async function buscarDespesas() {
    setCarregando(true)

    const { data, error } = await supabase
      .from("despesas")
      .select("*")
      .order("data", { ascending: false })

    if (error) {
      console.error("Erro ao buscar despesas:", error)
      setDespesas([])
    } else {
      setDespesas(data || [])
    }

    setCarregando(false)
  }

  async function adicionarDespesa(e) {
    e.preventDefault()

    if (!descricao || !valor || !data) {
      alert("Preencha descrição, valor e data.")
      return
    }

    const valorNumerico = Number(
      String(valor).replace(",", ".")
    )

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      alert("Digite um valor válido.")
      return
    }

    const { error } = await supabase
      .from("despesas")
      .insert([
        {
          descricao: descricao,
          categoria: categoria || "Outros",
          valor: valorNumerico,
          data: data,
          observacao: observacao || null,
        },
      ])

    if (error) {
      console.error("Erro ao cadastrar despesa:", error)
      alert("Erro ao cadastrar despesa: " + error.message)
      return
    }

    alert("Despesa cadastrada com sucesso!")

    setDescricao("")
    setCategoria("")
    setValor("")
    setData("")
    setObservacao("")

    buscarDespesas()
  }

  async function excluirDespesa(id) {
    const confirmar = confirm(
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
      console.error("Erro ao excluir despesa:", error)
      alert("Erro ao excluir despesa: " + error.message)
      return
    }

    buscarDespesas()
  }

  const totalDespesas = despesas.reduce(
    (total, despesa) => total + Number(despesa.valor || 0),
    0
  )

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  function formatarData(data) {
    if (!data) return "-"

    const partes = data.split("-")

    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`
    }

    return data
  }

  return (
    <main
      style={{
        padding: "30px",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Despesas</h1>

      <p style={{ color: "#666" }}>
        Controle das despesas da imobiliária.
      </p>

      {/* RESUMO */}
      <div
        style={{
          background: "#f5f5f5",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "30px",
        }}
      >
        <h2>Total de despesas</h2>

        <div
          style={{
            fontSize: "28px",
            fontWeight: "bold",
          }}
        >
          {formatarValor(totalDespesas)}
        </div>
      </div>

      {/* FORMULÁRIO */}
      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "30px",
        }}
      >
        <h2>Nova despesa</h2>

        <form onSubmit={adicionarDespesa}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "15px",
            }}
          >
            <div>
              <label>Descrição</label>

              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex.: Conta de energia"
                style={estiloInput}
              />
            </div>

            <div>
              <label>Categoria</label>

              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                style={estiloInput}
              >
                <option value="">Selecione</option>
                <option value="Aluguel">Aluguel</option>
                <option value="Energia">Energia</option>
                <option value="Água">Água</option>
                <option value="Internet">Internet</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Impostos">Impostos</option>
                <option value="Funcionários">Funcionários</option>
                <option value="Marketing">Marketing</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div>
              <label>Valor</label>

              <input
                type="text"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                style={estiloInput}
              />
            </div>

            <div>
              <label>Data</label>

              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                style={estiloInput}
              />
            </div>
          </div>

          <div style={{ marginTop: "15px" }}>
            <label>Observação</label>

            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Observações da despesa"
              rows="3"
              style={estiloInput}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: "15px",
              padding: "12px 20px",
              border: "none",
              borderRadius: "6px",
              background: "#198754",
              color: "white",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Cadastrar despesa
          </button>
        </form>
      </section>

      {/* LISTAGEM */}
      <section>
        <h2>Despesas cadastradas</h2>

        {carregando ? (
          <p>Carregando despesas...</p>
        ) : despesas.length === 0 ? (
          <p>Nenhuma despesa cadastrada.</p>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "15px",
              }}
            >
              <thead>
                <tr>
                  <th style={estiloTh}>Data</th>
                  <th style={estiloTh}>Descrição</th>
                  <th style={estiloTh}>Categoria</th>
                  <th style={estiloTh}>Valor</th>
                  <th style={estiloTh}>Observação</th>
                  <th style={estiloTh}>Ações</th>
                </tr>
              </thead>

              <tbody>
                {despesas.map((despesa) => (
                  <tr key={despesa.id}>
                    <td style={estiloTd}>
                      {formatarData(despesa.data)}
                    </td>

                    <td style={estiloTd}>
                      {despesa.descricao}
                    </td>

                    <td style={estiloTd}>
                      {despesa.categoria || "Outros"}
                    </td>

                    <td style={estiloTd}>
                      {formatarValor(despesa.valor)}
                    </td>

                    <td style={estiloTd}>
                      {despesa.observacao || "-"}
                    </td>

                    <td style={estiloTd}>
                      <button
                        onClick={() =>
                          excluirDespesa(despesa.id)
                        }
                        style={{
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
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
    </main>
  )
}

const estiloInput = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  boxSizing: "border-box",
}

const estiloTh = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "2px solid #ddd",
}

const estiloTd = {
  padding: "12px",
  borderBottom: "1px solid #eee",
}