import { useEffect, useState } from 'react'
import { getUsuarios, getLivros, createEmprestimo, getEmprestimos, devolverEmprestimo } from '../api'
import Navbar from '../components/Navbar'
import { toast } from '../Toast'

export default function Emprestimos() {
  const [usuarios, setUsuarios] = useState([])
  const [livros, setLivros] = useState([])
  const [usuarioId, setUsuarioId] = useState('')
  const [livroId, setLivroId] = useState('')
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(true)
  const u = JSON.parse(localStorage.getItem('user') || 'null')

  const load = async () => {
    setLoading(true)
    setUsuarios(await getUsuarios())
    setLivros(await getLivros())
    setLista(await getEmprestimos())
    setLoading(false)
  }
  useEffect(()=>{ load() },[])

  const submit = async (e) => {
    e.preventDefault()
    await createEmprestimo({ usuarioId, livroId })
    toast('Empréstimo registrado')
    setUsuarioId('')
    setLivroId('')
    await load()
  }

  const devolver = async (id) => { await devolverEmprestimo(id); toast('Devolução registrada'); await load() }

  return (
    <div className="container">
      <Navbar />
      <div className="content">
        <div className="formBox">
          <div className="formTitle">Registrar empréstimo</div>
          <form onSubmit={submit} className="form grid2">
            <select value={usuarioId} onChange={e=>setUsuarioId(e.target.value)}>
              <option value="">Selecione usuário</option>
              {usuarios.map(u=> <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
            <select value={livroId} onChange={e=>setLivroId(e.target.value)}>
              <option value="">Selecione livro</option>
              {livros.filter(l=>l.quantidadeDisponivel>0).map(l=> <option key={l.id} value={l.id}>{l.titulo}</option>)}
            </select>
             <button className="btn" type="submit" disabled={!usuarioId || !livroId}>Registrar</button>
          </form>
        </div>
        <div className="list">
          {loading && <div className="row"><div className="skeleton" style={{width:'100%'}}></div></div>}
          {!loading && lista.length===0 && <div className="row"><div className="subRow">Nenhum empréstimo</div></div>}
          {!loading && lista.map(e=> (
            <div key={e.id} className="row">
              <div className="col">
                <div className="titleRow">{e.livroTitulo}</div>
                <div className="subRow">{e.usuarioNome}</div>
              </div>
              <div className="col small">{e.dataDevolucaoReal? <span className="badge ok">Devolvido</span>:<span className="badge warn">Em aberto</span>}</div>
              <div className="actions">
                {u?.tipo==='Admin' && !e.dataDevolucaoReal && <button className="btn sm" onClick={()=>devolver(e.id)}>Devolver</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}