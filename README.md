ImobGest

Sistema web para gestão e administração de imóveis, desenvolvido para centralizar informações de imóveis, clientes, contratos e movimentações financeiras em uma única plataforma.

O projeto possui uma interface administrativa com dashboard, cadastros, controle financeiro e ferramentas de comunicação com clientes.

---

🚀 Tecnologias utilizadas

- Next.js
- React
- JavaScript
- Supabase
- PostgreSQL
- HTML5
- CSS3
- Git
- GitHub
- Vercel

---

📋 Funcionalidades

📊 Dashboard

Painel principal com visão geral do sistema.

Apresenta informações como:

- Total de imóveis
- Imóveis alugados
- Imóveis disponíveis
- Imóveis em manutenção
- Quantidade de clientes
- Contratos ativos
- Recebimentos
- Despesas
- Saldo financeiro

Também possui cards para facilitar a visualização das informações.

Página Imóveis 

Permite cadastrar e administrar os imóveis da imobiliária.

Informações como:

- Código do imóvel
- Endereço
- Tipo de imóvel
- Valor do aluguel
- Status
- Proprietário
- Observações
- Situação do imóvel

Status disponíveis:

- 🟢 Disponível
- 🔵 Alugado
- 🟠 Em manutenção

Página Clientes

Cadastro e gerenciamento dos clientes relacionados aos imóveis.

Permite armazenar informações como:

- Nome
- CPF
- Telefone
- E-mail
- Endereço
- Tipo de cliente
- Observações

Página Contratos

Controle dos contratos de locação.

Possibilita acompanhar:

- Cliente
- Imóvel
- Data de início
- Data de término
- Valor do aluguel
- Status do contrato
- Observações

O sistema também pode identificar contratos próximos do vencimento.

Página Recebimentos

Controle dos valores recebidos pela imobiliária.

Permite registrar:

- Cliente
- Contrato
- Valor
- Data de vencimento
- Data do recebimento
- Forma de pagamento
- Status
- Observações

Status de pagamento:

- Pendente
- Pago
- Atrasado

Página Despesas

Controle das despesas relacionadas à administração dos imóveis.

Permite registrar:

- Categoria
- Descrição
- Valor
- Data da despesa
- Forma de pagamento
- Status
- Observações

Página Financeiro

Área destinada ao acompanhamento financeiro do sistema.

Apresenta:

- Total de recebimentos
- Total de despesas
- Saldo
- Recebimentos pendentes
- Recebimentos atrasados
- Despesas
- Movimentações financeiras por período

É possível realizar filtros por mês e ano.

Página Manutenção

Controle das manutenções realizadas nos imóveis.

Permite acompanhar:

- Imóvel
- Tipo de manutenção
- Descrição
- Data
- Status
- Responsável
- Observações


🗄️ Banco de dados

O projeto utiliza o Supabase como plataforma de banco de dados.

O Supabase utiliza PostgreSQL para armazenamento das informações.

Entre os dados administrados pelo sistema estão:

- Clientes
- Imóveis
- Contratos
- Recebimentos
- Despesas
- Manutenções
- Comunicações

Segurança

O projeto utiliza recursos do Supabase para comunicação com o banco de dados.

As informações de configuração do ambiente não devem ser armazenadas diretamente no código-fonte.

As variáveis de ambiente utilizadas no projeto incluem:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

O arquivo ".env.local" deve permanecer fora do repositório.

Estrutura do projeto

Uma estrutura simplificada do projeto:

sistema-imobiliaria/
│
├── app/
│   ├── clientes/
│   │   └── page.js
│   │
│   ├── imoveis/
│   │   └── page.js
│   │
│   ├── contratos/
│   │   └── page.js
│   │
│   ├── recebimentos/
│   │   └── page.js
│   │
│   ├── despesas/
│   │   └── page.js
│   │
│   ├── financeiro/
│   │   └── page.js
│   │
│   ├── dashboard/
│   │   └── page.js
│   │
│   ├── components/
│   │   └── LogoutButton.js
│   │
│   ├── layout.js
│   └── page.js          (login)
│
├── lib/
│   ├── supabase.js
│   └── supabase/
│       ├── client.js
│       └── server.js
│
├── middleware.js        (proteção das rotas)
├── .env.example
├── package.json
├── vercel.json
│
└── README.md



⚙️ Instalação

Clone o repositório:

git clone https://github.com/MarianeStriani/sistema-imobiliaria.git

Entre na pasta:

cd sistema-imobiliaria

Instale as dependências:

npm install

Execute o projeto em ambiente de desenvolvimento:

npm run dev

Depois, acesse:

http://localhost:3000

Configuração do Supabase

Crie um projeto no Supabase e configure as variáveis de ambiente.

Copie o modelo para criar o arquivo local:

cp .env.example .env.local

No Windows (PowerShell):

Copy-Item .env.example .env.local

Preencha:

NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica

Depois reinicie o servidor:

npm run dev

Deploy

O projeto pode ser publicado utilizando a Vercel.

Fluxo de publicação:

GitHub
   ↓
Vercel
   ↓
Next.js
   ↓
Supabase

As variáveis de ambiente do Supabase devem ser configuradas também no ambiente de produção.

Objetivo do projeto

O objetivo do Sistema de Gestão Imobiliária é proporcionar uma solução web para organização, controle e acompanhamento das atividades administrativas de uma imobiliária.

A plataforma busca reduzir a necessidade de controles manuais e facilitar o acesso às informações de imóveis, clientes, contratos e movimentações financeiras.

Status do projeto

Em desenvolvimento

Novas funcionalidades e melhorias de interface estão sendo implementadas continuamente.


Desenvolvimento

Projeto desenvolvido por Mariane Isabela Striani Silva, Gustavo Mugnatto, Hiago.

Formação relacionada

Gestão da Tecnologia da Informação — UNIVESP

 Licença

Este projeto foi desenvolvido para fins acadêmicos e de desenvolvimento de portfólio.

©PJI II 240- grupo 5 2026 