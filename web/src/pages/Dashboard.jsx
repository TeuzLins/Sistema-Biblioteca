import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const u = JSON.parse(localStorage.getItem('user') || 'null')
  return (
    <div className="container">
      <Navbar />
      <div className="grid">
        <Link className="cardBtn" to="/livros">Livros</Link>
        <Link className="cardBtn" to="/emprestimos">Empréstimos</Link>
        <Link className="cardBtn" to="/pesquisa">Pesquisar livro</Link>
      </div>
    </div>
  )
}