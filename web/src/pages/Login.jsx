import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authLogin } from '../api'
import { toast } from '../Toast'
import { useEffect } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  useEffect(()=>{ const u = localStorage.getItem('user'); if (u) nav('/dashboard') },[nav])

  const onSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const { user } = await authLogin(email, senha)
      localStorage.setItem('user', JSON.stringify(user))
      toast('Login realizado')
      nav('/dashboard')
    } catch (err) {
      setErro('Credenciais inválidas')
      toast('Falha no login','error')
    }
    setLoading(false)
  }

  const fillAdmin = () => { setEmail('admin@bookmaster.local'); setSenha('Admin@123') }
  const fillLeitor = () => { setEmail('leitor@bookmaster.local'); setSenha('Leitor@123') }

  return (
    <div className="center">
      <div className="card">
        <div className="logo">
          <div className="icon">📖</div>
          <div className="title">BookMaster</div>
          <div className="subtitle">Entre com suas credenciais para acessar o sistema</div>
        </div>
        <form onSubmit={onSubmit} className="form">
          <label>Email</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="seu@email.com" />
          <label>Senha</label>
          <input type="password" value={senha} onChange={(e)=>setSenha(e.target.value)} placeholder="" />
          {erro && <div className="error">{erro}</div>}
          <button type="submit" className="btn" disabled={loading}>{loading?'Entrando...':'Entrar'}</button>
        </form>
        <div className="hint">
          Credenciais de teste:
          <div><button className="btn sm" onClick={fillAdmin}>Admin</button> admin@bookmaster.local / Admin@123</div>
          <div><button className="btn sm" onClick={fillLeitor}>Leitor</button> leitor@bookmaster.local / Leitor@123</div>
        </div>
      </div>
    </div>
  )
}