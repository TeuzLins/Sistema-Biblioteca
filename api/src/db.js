const Database = require('better-sqlite3');
const { nanoid } = require('nanoid');

const db = new Database('library.db');

db.exec(`
CREATE TABLE IF NOT EXISTS livro (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  categoria TEXT NOT NULL,
  ano INTEGER NOT NULL,
  quantidadeTotal INTEGER NOT NULL,
  quantidadeDisponivel INTEGER NOT NULL,
  isbn TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS usuario (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  tipo TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS emprestimo (
  id TEXT PRIMARY KEY,
  usuarioId TEXT NOT NULL,
  livroId TEXT NOT NULL,
  dataEmprestimo TEXT NOT NULL,
  dataDevolucaoPrevista TEXT NOT NULL,
  dataDevolucaoReal TEXT,
  FOREIGN KEY(usuarioId) REFERENCES usuario(id),
  FOREIGN KEY(livroId) REFERENCES livro(id)
);
`);

const ensureSeed = () => {
  const countUsuarios = db.prepare('SELECT COUNT(*) as c FROM usuario').get().c;
  if (countUsuarios === 0) {
    const insertU = db.prepare('INSERT INTO usuario (id, nome, email, senha, tipo) VALUES (?, ?, ?, ?, ?)');
    insertU.run(nanoid(), 'Admin', 'admin@bookmaster.local', 'Admin@123', 'Admin');
    insertU.run(nanoid(), 'Leitor', 'leitor@bookmaster.local', 'Leitor@123', 'Leitor');
  }
  const countLivros = db.prepare('SELECT COUNT(*) as c FROM livro').get().c;
  if (countLivros === 0) {
    const insertL = db.prepare('INSERT INTO livro (id, titulo, autor, categoria, ano, quantidadeTotal, quantidadeDisponivel, isbn) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    insertL.run(nanoid(), 'Clean Code', 'Robert C. Martin', 'Programação', 2008, 5, 5, '9780132350884');
    insertL.run(nanoid(), 'Domain-Driven Design', 'Eric Evans', 'Arquitetura', 2003, 3, 3, '9780321125217');
    insertL.run(nanoid(), 'JavaScript: The Good Parts', 'Douglas Crockford', 'Programação', 2008, 4, 4, '9780596517748');
  }
};

ensureSeed();

module.exports = { db, nanoid };