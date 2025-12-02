import { NavLink, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const nav = useNavigate()
  const u = JSON.parse(localStorage.getItem('user') || 'null')
  const themeSaved = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null
  if (themeSaved) document.documentElement.setAttribute('data-theme', themeSaved)
  const logout = () => { localStorage.removeItem('user'); nav('/') }
  const toggleTheme = () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', cur)
    localStorage.setItem('theme', cur)
  }
  return (
    <div className="topbar">
      <div className="brand">BookMaster</div>
      <div className="navlinks">
        <NavLink to="/dashboard">Início</NavLink>
        <NavLink to="/livros">Livros</NavLink>
        <NavLink to="/emprestimos">Empréstimos</NavLink>
        <NavLink to="/pesquisa">Pesquisar</NavLink>
        {u?.tipo==='Leitor' && <NavLink to="/meus-livros">Meus livros</NavLink>}
      </div>
      <div className="userarea">
        <div className="user">{u ? `${u.nome} (${u.tipo})` : ''}</div>
        <button className="btn sm" onClick={toggleTheme}>Tema</button>
        <button className="btn sm" onClick={logout}>Sair</button>
      </div>
    </div>
  )
}