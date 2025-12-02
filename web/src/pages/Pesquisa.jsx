import { useEffect, useState } from 'react'
import { searchLivros, createEmprestimo } from '../api'
import Navbar from '../components/Navbar'

export default function Pesquisa() {
  const [q, setQ] = useState('')
  const [result, setResult] = useState([])
  const [loading, setLoading] = useState(false)
  const u = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(()=>{ const f = async()=> setResult(await searchLivros('')); f() },[])

  const submit = async (e) => { e.preventDefault(); setLoading(true); setResult(await searchLivros(q)); setLoading(false) }
  useEffect(()=>{ const t = setTimeout(async()=>{ setLoading(true); setResult(await searchLivros(q)); setLoading(false) }, 300); return ()=>clearTimeout(t) },[q])

  return (
    <div className="container">
      <Navbar />
      <div className="content">
        <form onSubmit={submit} className="form">
          <input placeholder="Buscar por título, autor ou categoria" value={q} onChange={e=>setQ(e.target.value)} />
          <button className="btn" type="submit">Buscar</button>
        </form>
        <div className="list">
          {loading && <div className="row"><div className="skeleton" style={{width:'100%'}}></div></div>}
          {!loading && result.length===0 && <div className="row"><div className="subRow">Nenhum resultado</div></div>}
          {!loading && result.map(l => (
            <div key={l.id} className="row">
              <div className="col">
                <div className="titleRow">{l.titulo}</div>
                <div className="subRow">{l.autor} • {l.categoria}</div>
              </div>
              <div className="col small">
                {l.quantidadeDisponivel>0?<span className="badge ok">Disponível</span>:<span className="badge warn">Emprestado</span>}
              </div>
              <div className="actions">
                {u?.tipo==='Leitor' && l.quantidadeDisponivel>0 && <button className="btn sm" onClick={()=>adquirir(l.id)}>Adquirir</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
  const adquirir = async (id) => {
    if (!u) return
    await createEmprestimo({ usuarioId: u.id, livroId: id })
    setResult(await searchLivros(q))
  }