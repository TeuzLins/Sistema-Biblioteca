import { useEffect, useState } from 'react'
import { getLivros, createLivro, updateLivro, deleteLivro, createEmprestimo } from '../api'
import Navbar from '../components/Navbar'
import { toast } from '../Toast'

const empty = { titulo:'', autor:'', categoria:'', ano:'', quantidadeTotal:'' }

export default function Livros() {
  const [livros, setLivros] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const u = JSON.parse(localStorage.getItem('user') || 'null')

  const load = async () => { setLoading(true); setLivros(await getLivros()); setLoading(false) }
  useEffect(()=>{ load() },[])

  const submit = async (e) => {
    e.preventDefault()
    const payload = {
      titulo: form.titulo,
      autor: form.autor,
      categoria: form.categoria,
      ano: Number(form.ano),
      quantidadeTotal: Number(form.quantidadeTotal),
      quantidadeDisponivel: Number(form.quantidadeTotal),
    }
    try {
      if (editId) { await updateLivro(editId, payload); toast('Livro atualizado') }
      else { await createLivro(payload); toast('Livro cadastrado') }
      setForm(empty)
      setEditId(null)
      await load()
    } catch (err) {
      toast('Erro ao cadastrar/atualizar','error')
    }
  }

  const onEdit = (l) => {
    setEditId(l.id)
    setForm({ titulo:l.titulo, autor:l.autor, categoria:l.categoria, ano:String(l.ano), quantidadeTotal:String(l.quantidadeTotal) })
  }

  const onDelete = async (id) => { if (!confirm('Confirmar exclusão?')) return; await deleteLivro(id); toast('Livro excluído'); await load() }
  const adquirir = async (id) => {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    if (!u) return
    await createEmprestimo({ usuarioId: u.id, livroId: id })
    toast('Livro adquirido')
    await load()
  }

  return (
    <div className="container">
      <Navbar />
      <div className="content">
        <div className="list">
          {loading && <div className="row"><div className="skeleton" style={{width:'100%'}}></div></div>}
          {!loading && livros.length===0 && <div className="row"><div className="subRow">Nenhum livro cadastrado</div></div>}
          {!loading && livros.map(l => (
            <div key={l.id} className="row">
              <div className="col">
                <div className="titleRow">{l.titulo}</div>
                <div className="subRow">{l.autor} • {l.categoria}</div>
              </div>
              <div className="col small">{l.quantidadeDisponivel>0?<span className="badge ok">Disponível</span>:<span className="badge warn">Emprestado</span>}</div>
              <div className="actions">
                {u?.tipo==='Admin' && <button className="btn sm" onClick={()=>onEdit(l)}>Editar</button>}
                {u?.tipo==='Admin' && <button className="btn sm danger" onClick={()=>onDelete(l.id)}>Excluir</button>}
                {u?.tipo==='Leitor' && l.quantidadeDisponivel>0 && <button className="btn sm" onClick={()=>adquirir(l.id)}>Adquirir</button>}
              </div>
            </div>
          ))}
        </div>
        {u?.tipo==='Admin' ? (
          <div className="formBox">
            <div className="formTitle">{editId?'Editar livro':'Cadastrar novo livro'}</div>
            <form onSubmit={submit} className="form grid2">
              <input placeholder="Título" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})} />
              <input placeholder="Autor" value={form.autor} onChange={e=>setForm({...form,autor:e.target.value})} />
              <input placeholder="Categoria" value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})} />
              <input type="number" placeholder="Ano" value={form.ano} onChange={e=>setForm({...form,ano:e.target.value})} />
              <input type="number" placeholder="Quantidade" value={form.quantidadeTotal} onChange={e=>setForm({...form,quantidadeTotal:e.target.value})} />
              <button className="btn" type="submit" disabled={!form.titulo || !form.autor || !form.categoria || !form.ano || !form.quantidadeTotal}>{editId? 'Salvar' : 'Cadastrar'}</button>
            </form>
          </div>
        ) : (
          <div className="formBox">
            <div className="formTitle">Apenas administradores podem cadastrar livros</div>
            <div className="subRow">Para adquirir, utilize o botão nas listagens.</div>
          </div>
        )}
      </div>
    </div>
  )
}