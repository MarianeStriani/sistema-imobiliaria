"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      // Localiza o administrador pelo nome
      const resposta = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nome.trim(),
        }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        setErro("Nome ou senha inválidos.");
        setCarregando(false);
        return;
      }

      // Faz a autenticação real no Supabase
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: resultado.email,
        password: senha,
      });

      if (error) {
        setErro("Nome ou senha inválidos.");
        setCarregando(false);
        return;
      }

      // Não existe /dashboard.
      // O sistema entra na página principal.
      router.replace("/");
      router.refresh();

    } catch (error) {
      console.error(error);
      setErro("Não foi possível realizar o login.");
      setCarregando(false);
    }
  }

  return (
    <main className="min-vh-100 bg-light d-flex align-items-center justify-content-center py-5">

      <div className="container">

        <div className="row justify-content-center">

          <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">

            <div className="card border-0 shadow-sm rounded-4">

              <div className="card-body p-4 p-md-5">

                {/* LOGO / TÍTULO */}

                <div className="text-center mb-4">

                  <div
                    className="bg-primary text-white rounded-4 d-inline-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: "64px",
                      height: "64px",
                      fontSize: "28px",
                      fontWeight: "700",
                    }}
                  >
                    IG
                  </div>

                  <h1 className="h4 fw-bold mb-1">
                    ImobGest
                  </h1>

                  <p className="text-muted mb-0">
                    Acesso administrativo
                  </p>

                </div>

                {/* ERRO */}

                {erro && (
                  <div
                    className="alert alert-danger"
                    role="alert"
                  >
                    {erro}
                  </div>
                )}

                {/* FORMULÁRIO */}

                <form onSubmit={handleLogin}>

                  {/* NOME */}

                  <div className="mb-3">

                    <label
                      htmlFor="nome"
                      className="form-label fw-semibold"
                    >
                      Nome do administrador
                    </label>

                    <input
                      id="nome"
                      type="text"
                      className="form-control form-control-lg"
                      value={nome}
                      onChange={(event) =>
                        setNome(event.target.value)
                      }
                      placeholder="Digite seu nome"
                      autoComplete="username"
                      required
                    />

                  </div>

                  {/* SENHA */}

                  <div className="mb-4">

                    <label
                      htmlFor="senha"
                      className="form-label fw-semibold"
                    >
                      Senha
                    </label>

                    <input
                      id="senha"
                      type="password"
                      className="form-control form-control-lg"
                      value={senha}
                      onChange={(event) =>
                        setSenha(event.target.value)
                      }
                      placeholder="Digite sua senha"
                      autoComplete="current-password"
                      required
                    />

                  </div>

                  {/* BOTÃO */}

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    disabled={carregando}
                  >
                    {carregando ? "Entrando..." : "Entrar"}
                  </button>

                </form>

                <div className="text-center mt-4">

                  <small className="text-muted">
                    Acesso exclusivo para administradores
                  </small>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}