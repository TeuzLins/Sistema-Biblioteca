import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { getEmprestimosDoUsuario, devolverEmprestimo } from '../api'
import { toast } from '../Toast'

export default function MeusLivros() {
  const u = JSON.parse(localStorage.getItem('user') || 'null')
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(true)
  const load = async () => { if (!u) return; setLoading(true); setLista(await getEmprestimosDoUsuario(u.id)); setLoading(false) }
  useEffect(()=>{ load() },[])
  const devolver = async (id) => { await devolverEmprestimo(id); toast('Devolvido'); await load() }
  return (
    <div className="container">
      <Navbar />
      <div className="list">
        {loading && <div className="row"><div className="skeleton" style={{width:'100%'}}></div></div>}
        {!loading && lista.length===0 && <div className="row"><div className="subRow">Você não possui empréstimos</div></div>}
        {!loading && lista.map(e => (
          <div key={e.id} className="row">
            <div className="col">
              <div className="titleRow">{e.livroTitulo}</div>
              <div className="subRow">Empréstimo: {new Date(e.dataEmprestimo).toLocaleDateString()} • Previsto: {new Date(e.dataDevolucaoPrevista).toLocaleDateString()}</div>
            </div>
            <div className="col small">{e.dataDevolucaoReal? <span className="badge ok">Devolvido</span>:<span className="badge warn">Em aberto</span>}</div>
            <div className="actions">
              {!e.dataDevolucaoReal && <button className="btn sm" onClick={()=>devolver(e.id)}>Devolver</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}