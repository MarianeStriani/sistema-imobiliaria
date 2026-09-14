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
  alert("Erro ao carregar as despesas.")
} else {
  setDespesas(data || [])
}

setCarregando(false)

}

function alterarCampo(event) {
const { name, value } = event.target

setForm((anterior) => ({
  ...anterior,
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

if (!form.descricao.trim()) {
  alert("Informe a descrição da despesa.")
  return
}

if (!form.valor || Number(form.valor) <= 0) {
  alert("Informe um valor válido.")
  return
}

if (!form.data_despesa) {
  alert("Informe a data da despesa.")
  return
}

setSalvando(true)

const dados = {
  categoria: form.categoria || null,
  descricao: form.descricao.trim(),
  valor: Number(form.valor),
  data_despesa: form.data_despesa,
  forma_pagamento: form.forma_pagamento || null,
  status: form.status || "Pendente",
  observacoes: form.observacoes || null,
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
  alert(`Erro ao salvar despesa: ${resultado.error.message}`)
} else {
  alert(editandoId ? "Despesa atualizada com sucesso!" : "Despesa cadastrada com sucesso!")
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
  valor: despesa.valor !== null && despesa.valor !== undefined
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
  alert(`Erro ao excluir despesa: ${error.message}`)
  return
}

alert("Despesa excluída com sucesso!")

if (editandoId === id) {
  limparFormulario()
}

await carregarDespesas()

}

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

const totalDespesas = despesas.reduce(
(total, despesa) => total + Number(despesa.valor || 0),
0
)

const totalPagas = despesas
.filter(
(despesa) =>
String(despesa.status || "").toLowerCase() === "paga" ||
String(despesa.status || "").toLowerCase() === "pago"
)
.reduce((total, despesa) => total + Number(despesa.valor || 0), 0)

const totalPendentes = despesas
.filter(
(despesa) =>
String(despesa.status || "").toLowerCase() === "pendente"
)
.reduce((total, despesa) => total + Number(despesa.valor || 0), 0)

return (
<main
style={{
padding: "24px",
maxWidth: "1200px",
margin: "0 auto",
fontFamily: "Arial, sans-serif",
}}
>
<h1 style={{ marginBottom: "8px" }}>Despesas</h1>

  <p style={{ color: "#666", marginBottom: "24px" }}>
    Cadastro e controle das despesas da imobiliária.
  </p>

  <section
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "16px",
      marginBottom: "30px",
    }}
  >
    <div
      style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      <div style={{ color: "#666", marginBottom: "8px" }}>
        Total de despesas
      </div>

      <strong style={{ fontSize: "24px" }}>
        {formatarMoeda(totalDespesas)}
      </strong>
    </div>

    <div
      style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      <div style={{ color: "#666", marginBottom: "8px" }}>
        Despesas pagas
      </div>

      <strong style={{ fontSize: "24px" }}>
        {formatarMoeda(totalPagas)}
      </strong>
    </div>

    <div
      style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      <div style={{ color: "#666", marginBottom: "8px" }}>
        Despesas pendentes
      </div>

      <strong style={{ fontSize: "24px" }}>
        {formatarMoeda(totalPendentes)}
      </strong>
    </div>
  </section>

  <section
    style={{
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "24px",
      marginBottom: "30px",
    }}
  >
    <h2 style={{ marginTop: 0 }}>
      {editandoId ? "Editar despesa" : "Nova despesa"}
    </h2>

    <form onSubmit={salvarDespesa}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <div>
          <label>Categoria</label>

          <select
            name="categoria"
            value={form.categoria}
            onChange={alterarCampo}
            style={estiloInput}
          >
            <option value="">Selecione</option>
            <option value="Aluguel">Aluguel</option>
            <option value="Água">Água</option>
            <option value="Energia">Energia</option>
            <option value="Internet">Internet</option>
            <option value="Telefone">Telefone</option>
            <option value="Manutenção">Manutenção</option>
            <option value="Marketing">Marketing</option>
            <option value="Impostos">Impostos</option>
            <option value="Salários">Salários</option>
            <option value="Materiais">Materiais</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        <div>
          <label>Descrição *</label>

          <input
            type="text"
            name="descricao"
            value={form.descricao}
            onChange={alterarCampo}
            placeholder="Ex.: Conta de energia"
            style={estiloInput}
            required
          />
        </div>

        <div>
          <label>Valor *</label>

          <input
            type="number"
            name="valor"
            value={form.valor}
            onChange={alterarCampo}
            placeholder="0,00"
            min="0"
            step="0.01"
            style={estiloInput}
            required
          />
        </div>

        <div>
          <label>Data da despesa *</label>

          <input
            type="date"
            name="data_despesa"
            value={form.data_despesa}
            onChange={alterarCampo}
            style={estiloInput}
            required
          />
        </div>

        <div>
          <label>Forma de pagamento</label>

          <select
            name="forma_pagamento"
            value={form.forma_pagamento}
            onChange={alterarCampo}
            style={estiloInput}
          >
            <option value="">Selecione</option>
            <option value="Dinheiro">Dinheiro</option>
            <option value="PIX">PIX</option>
            <option value="Cartão de débito">Cartão de débito</option>
            <option value="Cartão de crédito">Cartão de crédito</option>
            <option value="Boleto">Boleto</option>
            <option value="Transferência">Transferência</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div>
          <label>Status</label>

          <select
            name="status"
            value={form.status}
            onChange={alterarCampo}
            style={estiloInput}
          >
            <option value="Pendente">Pendente</option>
            <option value="Paga">Paga</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label>Observações</label>

          <textarea
            name="observacoes"
            value={form.observacoes}
            onChange={alterarCampo}
            placeholder="Observações sobre a despesa"
            rows="4"
            style={{
              ...estiloInput,
              resize: "vertical",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="submit"
          disabled={salvando}
          style={estiloBotao}
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
            style={estiloBotaoSecundario}
          >
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  </section>

  <section>
    <h2>Lista de despesas</h2>

    {carregando ? (
      <p>Carregando despesas...</p>
    ) : despesas.length === 0 ? (
      <div
        style={{
          padding: "30px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          textAlign: "center",
        }}
      >
        <p>Nenhuma despesa cadastrada.</p>
      </div>
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
              <th style={estiloCabecalho}>Data</th>
              <th style={estiloCabecalho}>Categoria</th>
              <th style={estiloCabecalho}>Descrição</th>
              <th style={estiloCabecalho}>Valor</th>
              <th style={estiloCabecalho}>Pagamento</th>
              <th style={estiloCabecalho}>Status</th>
              <th style={estiloCabecalho}>Observações</th>
              <th style={estiloCabecalho}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {despesas.map((despesa) => (
              <tr key={despesa.id}>
                <td style={estiloCelula}>
                  {formatarData(despesa.data_despesa)}
                </td>

                <td style={estiloCelula}>
                  {despesa.categoria || "-"}
                </td>

                <td style={estiloCelula}>
                  {despesa.descricao || "-"}
                </td>

                <td style={estiloCelula}>
                  {formatarMoeda(despesa.valor)}
                </td>

                <td style={estiloCelula}>
                  {despesa.forma_pagamento || "-"}
                </td>

                <td style={estiloCelula}>
                  {despesa.status || "-"}
                </td>

                <td style={estiloCelula}>
                  {despesa.observacoes || "-"}
                </td>

                <td style={estiloCelula}>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => editarDespesa(despesa)}
                      style={estiloBotaoPequeno}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => excluirDespesa(despesa.id)}
                      style={estiloBotaoExcluir}
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
</main>

)
}

const estiloInput = {
width: "100%",
boxSizing: "border-box",
padding: "10px 12px",
marginTop: "6px",
border: "1px solid #ccc",
borderRadius: "6px",
fontSize: "15px",
backgroundColor: "#fff",
}

const estiloBotao = {
border: "none",
borderRadius: "6px",
padding: "11px 18px",
cursor: "pointer",
fontSize: "15px",
}

const estiloBotaoSecundario = {
border: "1px solid #ccc",
borderRadius: "6px",
padding: "11px 18px",
cursor: "pointer",
fontSize: "15px",
backgroundColor: "#fff",
}

const estiloBotaoPequeno = {
border: "1px solid #ccc",
borderRadius: "5px",
padding: "7px 10px",
cursor: "pointer",
backgroundColor: "#fff",
}

const estiloBotaoExcluir = {
border: "1px solid #ccc",
borderRadius: "5px",
padding: "7px 10px",
cursor: "pointer",
backgroundColor: "#fff",
}

const estiloCabecalho = {
textAlign: "left",
padding: "12px",
borderBottom: "2px solid #ddd",
whiteSpace: "nowrap",
}

const estiloCelula = {
padding: "12px",
borderBottom: "1px solid #eee",
verticalAlign: "top",
}