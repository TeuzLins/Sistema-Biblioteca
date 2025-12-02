const express = require('express');
const cors = require('cors');
const { db } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const requireAdmin = (req, res, next) => {
  const uid = req.headers['x-user-id'];
  if (!uid) return res.status(401).json({ message: 'Não autenticado' });
  const u = db.prepare('SELECT tipo FROM usuario WHERE id = ?').get(uid);
  if (!u || u.tipo !== 'Admin') return res.status(403).json({ message: 'Precisa ser Admin' });
  next();
};

app.post('/auth/login', (req, res) => {
  const { email, senha } = req.body || {};
  const stmt = db.prepare('SELECT id, nome, email, tipo FROM usuario WHERE email = ? AND senha = ?');
  const user = stmt.get(email, senha);
  if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });
  res.json({ user, token: 'fake-token' });
});

app.get('/livros', (req, res) => {
  const rows = db.prepare('SELECT id, titulo, autor, categoria, ano, quantidadeTotal, quantidadeDisponivel FROM livro').all();
  res.json(rows);
});

app.post('/livros', requireAdmin, (req, res) => {
  const l = req.body || {};
  const titulo = (l.titulo || '').toString().trim();
  const autor = (l.autor || '').toString().trim();
  const categoria = (l.categoria || '').toString().trim();
  const ano = Number(l.ano);
  const quantidadeTotal = Number(l.quantidadeTotal);
  if (!titulo || !autor || !categoria || Number.isNaN(ano) || Number.isNaN(quantidadeTotal)) {
    return res.status(400).json({ message: 'Dados obrigatórios ausentes' });
  }
  const quantidadeDisponivel = Number(l.quantidadeDisponivel ?? quantidadeTotal);
  const { nanoid } = require('./db');
  const id = nanoid();
  db.prepare('INSERT INTO livro (id, titulo, autor, categoria, ano, quantidadeTotal, quantidadeDisponivel, isbn) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, titulo, autor, categoria, ano, quantidadeTotal, quantidadeDisponivel, l.isbn ?? '');
  const novo = db.prepare('SELECT id, titulo, autor, categoria, ano, quantidadeTotal, quantidadeDisponivel FROM livro WHERE id = ?').get(id);
  res.status(201).json(novo);
});

app.put('/livros/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  const l = req.body || {};
  const cur = db.prepare('SELECT * FROM livro WHERE id = ?').get(id);
  if (!cur) return res.status(404).json({ message: 'Livro não encontrado' });
  const upd = {
    titulo: (l.titulo ?? cur.titulo).toString().trim(),
    autor: (l.autor ?? cur.autor).toString().trim(),
    categoria: (l.categoria ?? cur.categoria).toString().trim(),
    ano: Number(l.ano ?? cur.ano),
    quantidadeTotal: Number(l.quantidadeTotal ?? cur.quantidadeTotal),
    quantidadeDisponivel: Number(l.quantidadeDisponivel ?? cur.quantidadeDisponivel),
    isbn: l.isbn ?? cur.isbn,
  };
  db.prepare('UPDATE livro SET titulo=?, autor=?, categoria=?, ano=?, quantidadeTotal=?, quantidadeDisponivel=?, isbn=? WHERE id=?')
    .run(upd.titulo, upd.autor, upd.categoria, upd.ano, upd.quantidadeTotal, upd.quantidadeDisponivel, upd.isbn, id);
  const novo = db.prepare('SELECT id, titulo, autor, categoria, ano, quantidadeTotal, quantidadeDisponivel FROM livro WHERE id = ?').get(id);
  res.json(novo);
});

app.delete('/livros/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  const cur = db.prepare('SELECT * FROM livro WHERE id = ?').get(id);
  if (!cur) return res.status(404).json({ message: 'Livro não encontrado' });
  db.prepare('DELETE FROM livro WHERE id = ?').run(id);
  res.json({ ok: true });
});

app.get('/usuarios', (req, res) => {
  const rows = db.prepare('SELECT id, nome, email, tipo FROM usuario').all();
  res.json(rows);
});

app.post('/usuarios', (req, res) => {
  const u = req.body || {};
  if (!u.nome || !u.email || !u.senha || !u.tipo) return res.status(400).json({ message: 'Dados obrigatórios ausentes' });
  const { nanoid } = require('./db');
  const id = nanoid();
  try {
    db.prepare('INSERT INTO usuario (id, nome, email, senha, tipo) VALUES (?, ?, ?, ?, ?)')
      .run(id, u.nome, u.email, u.senha, u.tipo);
  } catch (e) {
    return res.status(400).json({ message: 'Email já cadastrado' });
  }
  const novo = db.prepare('SELECT id, nome, email, tipo FROM usuario WHERE id = ?').get(id);
  res.status(201).json(novo);
});

app.put('/usuarios/:id', (req, res) => {
  const id = req.params.id;
  const u = req.body || {};
  const cur = db.prepare('SELECT * FROM usuario WHERE id = ?').get(id);
  if (!cur) return res.status(404).json({ message: 'Usuário não encontrado' });
  const upd = {
    nome: u.nome ?? cur.nome,
    email: u.email ?? cur.email,
    senha: u.senha ?? cur.senha,
    tipo: u.tipo ?? cur.tipo,
  };
  db.prepare('UPDATE usuario SET nome=?, email=?, senha=?, tipo=? WHERE id=?')
    .run(upd.nome, upd.email, upd.senha, upd.tipo, id);
  const novo = db.prepare('SELECT id, nome, email, tipo FROM usuario WHERE id = ?').get(id);
  res.json(novo);
});

app.delete('/usuarios/:id', (req, res) => {
  const id = req.params.id;
  const cur = db.prepare('SELECT * FROM usuario WHERE id = ?').get(id);
  if (!cur) return res.status(404).json({ message: 'Usuário não encontrado' });
  db.prepare('DELETE FROM usuario WHERE id = ?').run(id);
  res.json({ ok: true });
});

app.get('/emprestimos', (req, res) => {
  const rows = db.prepare(`
    SELECT e.*, u.nome as usuarioNome, l.titulo as livroTitulo
    FROM emprestimo e
    JOIN usuario u ON u.id = e.usuarioId
    JOIN livro l ON l.id = e.livroId
    ORDER BY datetime(e.dataEmprestimo) DESC
  `).all();
  res.json(rows);
});

app.get('/usuarios/:id/emprestimos', (req, res) => {
  const id = req.params.id;
  const rows = db.prepare(`
    SELECT e.*, u.nome as usuarioNome, l.titulo as livroTitulo
    FROM emprestimo e
    JOIN usuario u ON u.id = e.usuarioId
    JOIN livro l ON l.id = e.livroId
    WHERE e.usuarioId = ?
    ORDER BY datetime(e.dataEmprestimo) DESC
  `).all(id);
  res.json(rows);
});

app.post('/emprestimos', (req, res) => {
  const { usuarioId, livroId, dias } = req.body || {};
  if (!usuarioId || !livroId) return res.status(400).json({ message: 'Dados obrigatórios ausentes' });
  const livro = db.prepare('SELECT * FROM livro WHERE id = ?').get(livroId);
  if (!livro) return res.status(404).json({ message: 'Livro não encontrado' });
  if (Number(livro.quantidadeDisponivel) <= 0) return res.status(400).json({ message: 'Sem exemplares disponíveis' });
  const { nanoid } = require('./db');
  const id = nanoid();
  const agora = new Date();
  const prazo = new Date(agora.getTime() + (Number(dias ?? 7) * 24 * 60 * 60 * 1000));
  db.prepare('INSERT INTO emprestimo (id, usuarioId, livroId, dataEmprestimo, dataDevolucaoPrevista) VALUES (?, ?, ?, ?, ?)')
    .run(id, usuarioId, livroId, agora.toISOString(), prazo.toISOString());
  db.prepare('UPDATE livro SET quantidadeDisponivel = quantidadeDisponivel - 1 WHERE id = ?').run(livroId);
  const novo = db.prepare('SELECT * FROM emprestimo WHERE id = ?').get(id);
  res.status(201).json(novo);
});

app.post('/emprestimos/:id/devolucao', (req, res) => {
  const id = req.params.id;
  const emp = db.prepare('SELECT * FROM emprestimo WHERE id = ?').get(id);
  if (!emp) return res.status(404).json({ message: 'Empréstimo não encontrado' });
  if (emp.dataDevolucaoReal) return res.status(400).json({ message: 'Já devolvido' });
  const agora = new Date().toISOString();
  db.prepare('UPDATE emprestimo SET dataDevolucaoReal = ? WHERE id = ?').run(agora, id);
  db.prepare('UPDATE livro SET quantidadeDisponivel = quantidadeDisponivel + 1 WHERE id = ?').run(emp.livroId);
  const novo = db.prepare('SELECT * FROM emprestimo WHERE id = ?').get(id);
  res.json(novo);
});

app.get('/livros/pesquisa', (req, res) => {
  const q = (req.query.q || '').toString().trim().toLowerCase();
  const rows = db.prepare('SELECT id, titulo, autor, categoria, ano, quantidadeTotal, quantidadeDisponivel FROM livro').all();
  const resu = rows.filter(r =>
    r.titulo.toLowerCase().includes(q) ||
    r.autor.toLowerCase().includes(q) ||
    r.categoria.toLowerCase().includes(q)
  );
  res.json(resu);
});

const port = process.env.PORT || 3001;
app.listen(port, () => {});