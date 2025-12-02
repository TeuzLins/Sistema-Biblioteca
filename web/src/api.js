const API_URL = 'http://localhost:3001';

const j = async (path, opts = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const r = await fetch(API_URL + path, { ...opts, headers });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};

const adminHeaders = () => {
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    return u ? { 'x-user-id': u.id } : {};
  } catch { return {} }
};

export const authLogin = (email, senha) => j('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) });
export const getLivros = () => j('/livros');
export const createLivro = (data) => j('/livros', { method: 'POST', headers: adminHeaders(), body: JSON.stringify(data) });
export const updateLivro = (id, data) => j(`/livros/${id}`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify(data) });
export const deleteLivro = (id) => j(`/livros/${id}`, { method: 'DELETE', headers: adminHeaders() });
export const searchLivros = (q) => j(`/livros/pesquisa?q=${encodeURIComponent(q)}`);
export const getUsuarios = () => j('/usuarios');
export const createUsuario = (data) => j('/usuarios', { method: 'POST', body: JSON.stringify(data) });
export const updateUsuario = (id, data) => j(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUsuario = (id) => j(`/usuarios/${id}`, { method: 'DELETE' });
export const getEmprestimos = () => j('/emprestimos');
export const createEmprestimo = (data) => j('/emprestimos', { method: 'POST', body: JSON.stringify(data) });
export const devolverEmprestimo = (id) => j(`/emprestimos/${id}/devolucao`, { method: 'POST' });
export const getEmprestimosDoUsuario = (id) => j(`/usuarios/${id}/emprestimos`);