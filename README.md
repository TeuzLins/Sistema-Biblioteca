# BookMaster — Sistema de Biblioteca

Projeto completo com API REST (Node/Express + SQLite) e frontend em React (Vite), simulando o funcionamento de uma biblioteca: cadastro/gerenciamento de livros e usuários, registro de empréstimos e devoluções, e pesquisa de livros.

## Requisitos
- Node.js 18+ e npm
- Portas livres: `3001` (API) e `5173` (frontend)

## Estrutura
```
Sistema Biblioteca/
├─ api/              # API REST (Express + better-sqlite3)
│  ├─ src/server.js  # Endpoints principais
│  └─ src/db.js      # Schema e seed (SQLite)
└─ web/              # Frontend (Vite + React)
   └─ src/           # Páginas e componentes
```

## Instalação
1) API
```
cd "api"
npm install
```

2) Frontend
```
cd "web"
npm install
```

## Execução
1) API (http://localhost:3001/)
```
cd "api"
npm run start
```

2) Frontend (http://localhost:5173/)
```
cd "web"
npm run dev
```

## Banco de dados
- Arquivo SQLite criado automaticamente: `library.db`
- Seed de dados inicial (usuários e livros) é aplicado ao subir a API.

## Credenciais de teste
- Admin: `admin@bookmaster.local` / `Admin@123`
- Leitor: `leitor@bookmaster.local` / `Leitor@123`

## API — Endpoints principais
- Autenticação
  - `POST /auth/login` — login simples (token fake)

- Livros
  - `GET /livros` — listar
  - `POST /livros` — cadastrar (somente Admin)
  - `PUT /livros/:id` — editar (somente Admin)
  - `DELETE /livros/:id` — excluir (somente Admin)
  - `GET /livros/pesquisa?q=...` — pesquisa por título/autor/categoria

- Usuários
  - `GET /usuarios` — listar
  - `POST /usuarios` — cadastrar
  - `PUT /usuarios/:id` — editar
  - `DELETE /usuarios/:id` — excluir

- Empréstimos
  - `GET /emprestimos` — listar todos
  - `GET /usuarios/:id/emprestimos` — listar por usuário
  - `POST /emprestimos` — registrar empréstimo
  - `POST /emprestimos/:id/devolucao` — registrar devolução

### Exemplos rápidos (curl)
```
# Login
curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bookmaster.local","senha":"Admin@123"}'

# Listar livros
curl -s http://localhost:3001/livros

# Pesquisa
curl -s "http://localhost:3001/livros/pesquisa?q=clean"
```

## Frontend — Páginas e fluxo
- Login moderno com preenchimento rápido de credenciais de teste.
  - Se já estiver logado e acessar `/`, redireciona para `/dashboard`.
- Dashboard com navegação para `Livros`, `Empréstimos` e `Pesquisar`.
- Livros: listagem com status, cadastro/edição/exclusão (admin), badges de status e skeleton durante carregamento.
- Empréstimos: registro (seleciona usuário + livro disponível), devolução (admin), listagem com situação.
- Pesquisa: debounce, carregamento e lista de resultados com status.
- Navbar com links ativos, botão de alternância de tema (claro/escuro) e botão `Sair` (logout).

## Build de produção (frontend)
```
cd "web"
npm run build
```
Os arquivos gerados ficam em `web/dist/`.

## Observações
- Autenticação é simplificada (token fake) e sem autorização server-side; as restrições de ações por perfil (Admin/Leitor) são aplicadas no frontend.
- Para autenticação real, adicionar JWT na API e proteger rotas do frontend com verificação de token.
# Operações de livros (Admin)
# Use o cabeçalho `x-user-id` com o id de um usuário Admin.
# Exemplo: cadastrar
curl -s -X POST http://localhost:3001/livros \
  -H "Content-Type: application/json" \
  -H "x-user-id: <ID_DO_ADMIN>" \
  -d '{"titulo":"Clean Architecture","autor":"Robert C. Martin","categoria":"Programação","ano":2017,"quantidadeTotal":2}'


## License
Este projeto está sob a MIT License.  
Consulte o arquivo [LICENSE](./LICENSE) para mais detalhes.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
