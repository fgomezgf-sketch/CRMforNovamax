import React, {useEffect, useState} from 'react';
import api from '../api';
import dayjs from 'dayjs';

function LeadItem({lead, onSelect}){
  return (
    <div style={{padding:10, borderBottom:'1px solid #eee', cursor:'pointer'}} onClick={()=>onSelect(lead)}>
      <strong>{lead.first_name} {lead.last_name}</strong> — {lead.email} — {lead.company}
      <div style={{fontSize:12, color:'#666'}}>Last contacted: {lead.last_contacted ? dayjs(lead.last_contacted).format('YYYY-MM-DD HH:mm') : '—'}</div>
    </div>
  )
}

export default function Contacts(){
  const [leads, setLeads] = useState([]);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load(){
    setLoading(true);
    try {
      const r = await api.get('/contacts', { params: { search: q }});
      setLeads(r.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }

  useEffect(()=>{ load() }, []);

  async function save(updated){
    try {
      const r = await api.put(`/contacts/${updated.id}`, updated);
      setLeads(prev => prev.map(l => l.id === r.data.id ? r.data : l));
      setSelected(r.data);
      alert('Saved');
    } catch (err) {
      console.error(err);
      alert('save failed');
    }
  }

  return (
    <div style={{display:'flex', gap:20}}>
      <div style={{flex:1}}>
        <h2>Contacts</h2>
        <div style={{marginBottom:10}}>
          <input placeholder="search" value={q} onChange={e=>setQ(e.target.value)} />
          <button onClick={load} style={{marginLeft:8}}>Search</button>
        </div>
        <div style={{border:'1px solid #ddd', borderRadius:6, overflow:'hidden'}}>
          {loading ? <div style={{padding:20}}>Loading...</div> : leads.map(l => <LeadItem key={l.id} lead={l} onSelect={setSelected} />)}
        </div>
      </div>

      <div style={{width:420}}>
        <h3>Lead details</h3>
        {selected ? <LeadEditor lead={selected} onSave={save}/> : <div>Select a lead to view/edit</div>}
      </div>
    </div>
  )
}

function LeadEditor({lead, onSave}){
  const [form, setForm] = useState({...lead});

  useEffect(()=> setForm({...lead}), [lead]);

  function setField(k,v){
    setForm(prev => ({...prev, [k]: v}));
  }

  return (
    <div style={{border:'1px solid #eee', padding:12, borderRadius:6}}>
      <label>First name<br/><input value={form.first_name||''} onChange={e=>setField('first_name', e.target.value)} /></label>
      <label>Last name<br/><input value={form.last_name||''} onChange={e=>setField('last_name', e.target.value)} /></label>
      <label>Email<br/><input value={form.email||''} onChange={e=>setField('email', e.target.value)} /></label>
      <label>Phone<br/><input value={form.phone||''} onChange={e=>setField('phone', e.target.value)} /></label>
      <label>Company<br/><input value={form.company||''} onChange={e=>setField('company', e.target.value)} /></label>

      <label>Notes<br/>
        <textarea value={form.notes||''} onChange={e=>setField('notes', e.target.value)} rows={5} />
      </label>

      <label>Last contacted (datetime)<br/>
        <input type="datetime-local"
               value={form.last_contacted ? (new Date(form.last_contacted)).toISOString().slice(0,16) : ''}
               onChange={e => setField('last_contacted', e.target.value ? new Date(e.target.value).toISOString() : null)} />
      </label>

      <label>Next step<br/><input value={form.next_step||''} onChange={e=>setField('next_step', e.target.value)} /></label>

      <label>Follow up date<br/>
        <input type="date" value={form.follow_up_date||''} onChange={e=>setField('follow_up_date', e.target.value || null)} />
      </label>

      <label>Manager / POC<br/><input value={form.manager||''} onChange={e=>setField('manager', e.target.value)} /></label>

      <label style={{display:'flex', alignItems:'center', gap:8}}>
        <input type="checkbox" checked={!!form.poc_demo} onChange={e=>setField('poc_demo', e.target.checked)} />
        POC Demo (yes/no)
      </label>

      <div style={{marginTop:10, display:'flex', gap:8}}>
        <button onClick={()=> onSave(form)}>Save</button>
        <button onClick={()=> {
          const now = new Date().toISOString();
          setField('last_contacted', now);
          onSave({...form, last_contacted: now});
        }}>Mark contacted now</button>
      </div>
    </div>
  )
}
