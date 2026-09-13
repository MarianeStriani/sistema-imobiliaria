# Sistema de Imobiliária — Vercel + JavaScript + Bootstrap + PHP + MySQL

Arquitetura:
- Frontend: Next.js (JavaScript) + Bootstrap
- Hospedagem do frontend: Vercel
- API: PHP 8+
- Banco: MySQL 8+
- A API PHP pode ser hospedada em Hostinger, cPanel, Railway/Render ou outro servidor PHP.
- A Vercel não executa PHP tradicionalmente; por isso o PHP fica separado.

## Estrutura
frontend/
  app/
  components/
  lib/
api-php/
  config.php
  imoveis.php
  clientes.php
  dashboard.php
database/
  schema.sql

## Como executar o frontend
cd frontend
npm install
npm run dev

Crie `.env.local`:
NEXT_PUBLIC_API_URL=https://SEU-DOMINIO-PHP.com/api

## Banco
Importe database/schema.sql no MySQL e configure as credenciais em api-php/config.php.

## Funcionalidades iniciais
- Dashboard
- Cadastro/listagem de imóveis
- Filtros por finalidade, tipo, cidade e preço
- Cadastro de clientes
- API PHP com JSON
- MySQL com imóveis, clientes e usuários
- Layout responsivo Bootstrap
