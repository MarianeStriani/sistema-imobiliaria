"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export default function HomePage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    verificarSessao();
  }, []);

  async function verificarSessao() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        router.replace("/dashboard");
        return;
      }
    } catch (error) {
      console.error("Erro ao verificar sessão:", error);
    }

    setVerificando(false);
  }

  async function handleLogin(event) {
    event.preventDefault();

    setErro("");

    const nomeInformado = nome.trim();

    if (!nomeInformado) {
      setErro("Informe o nome do administrador.");
      return;
    }

    if (!senha) {
      setErro("Informe a senha.");
      return;
    }

    setCarregando(true);

    try {
      /*
       * Procura o administrador na tabela profiles.
       * Não precisamos de route.js nesta versão.
       */
      const { data: perfil, error: perfilError } = await supabase
        .from("profiles")
        .select("email, nome, ativo")
        .eq("nome", nomeInformado)
        .maybeSingle();

      if (perfilError) {
        console.error("Erro ao consultar perfil:", perfilError);

        setErro(
          "Não foi possível localizar o administrador. Verifique as permissões da tabela profiles."
        );

        setCarregando(false);
        return;
      }

      if (!perfil) {
        setErro("Administrador não encontrado.");
        setCarregando(false);
        return;
      }

      if (perfil.ativo === false) {
        setErro("Este administrador está inativo.");
        setCarregando(false);
        return;
      }

      if (!perfil.email) {
        setErro("O administrador não possui e-mail cadastrado.");
        setCarregando(false);
        return;
      }

      /*
       * Login do Supabase Auth.
       */
      const { data, error } = await supabase.auth.signInWithPassword({
        email: perfil.email,
        password: senha,
      });

      if (error) {
        console.error("Erro no login:", error);

        setErro("Nome ou senha inválidos.");
        setCarregando(false);
        return;
      }

      if (!data?.user) {
        setErro("Não foi possível concluir o login.");
        setCarregando(false);
        return;
      }

      /*
       * Login concluído.
       * Vai para o dashboard existente.
       */
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Erro inesperado no login:", error);

      setErro("Não foi possível realizar o login.");
      setCarregando(false);
    }
  }

  if (verificando) {
    return (
      <main className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
            aria-hidden="true"
          ></div>

          <div className="text-muted">
            Verificando acesso...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-vh-100 bg-light d-flex align-items-center justify-content-center py-4 px-3">
      <div
        className="card border-0 shadow"
        style={{
          width: "100%",
          maxWidth: "430px",
          borderRadius: "16px",
        }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div
              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: "64px",
                height: "64px",
                fontSize: "28px",
                fontWeight: "700",
              }}
            >
              I
            </div>

            <h1 className="h3 fw-bold mb-1">
              ImobGest
            </h1>

            <p className="text-muted mb-0">
              Gestão imobiliária
            </p>
          </div>

          <div className="mb-4">
            <h2 className="h5 fw-bold mb-1">
              Acesso ao sistema
            </h2>

            <p className="text-muted small mb-0">
              Entre com seu nome de administrador e senha.
            </p>
          </div>

          {erro && (
            <div
              className="alert alert-danger"
              role="alert"
            >
              {erro}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label
                htmlFor="nome"
                className="form-label fw-semibold"
              >
                Administrador
              </label>

              <input
                id="nome"
                type="text"
                className="form-control form-control-lg"
                placeholder="Digite seu nome"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                autoComplete="username"
                disabled={carregando}
              />
            </div>

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
                placeholder="Digite sua senha"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                autoComplete="current-password"
                disabled={carregando}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100"
              disabled={carregando}
            >
              {carregando ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>

                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <small className="text-muted">
              ImobGest • Sistema de gestão imobiliária
            </small>
          </div>
        </div>
      </div>
    </main>
  );
}