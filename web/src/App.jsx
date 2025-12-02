import { Routes, Route, Navigate, Link } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Livros from './pages/Livros'
import Emprestimos from './pages/Emprestimos'
import Pesquisa from './pages/Pesquisa'
import MeusLivros from './pages/MeusLivros'
import './index.css'
import ToastHost from './Toast'

const Guard = ({ children }) => {
  const u = localStorage.getItem('user')
  if (!u) return <Navigate to="/" replace />
  return children
}

const Public = ({ children }) => {
  const u = localStorage.getItem('user')
  if (u) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <>
      <ToastHost />
      <Routes>
        <Route path="/" element={<Public><Login /></Public>} />
        <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
        <Route path="/livros" element={<Guard><Livros /></Guard>} />
        <Route path="/emprestimos" element={<Guard><Emprestimos /></Guard>} />
        <Route path="/pesquisa" element={<Guard><Pesquisa /></Guard>} />
        <Route path="/meus-livros" element={<Guard><MeusLivros /></Guard>} />
        <Route path="*" element={<div className="container"><Link to="/">Ir para Login</Link></div>} />
      </Routes>
    </>
  )
}
