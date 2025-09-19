import React, {useState} from 'react';
import api from '../api';

export default function UploadCSV(){
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    if(!file) return alert('select a csv');
    const form = new FormData();
    form.append('file', file);
    setLoading(true);
    try {
      const r = await api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(r.data);
    } catch (err) {
      alert(err?.response?.data?.error || 'upload failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{maxWidth:800}}>
      <h2>Upload CSV Leads</h2>
      <p>CSV header names: <code>first_name,last_name,email,phone,company,notes,last_contacted,next_step,follow_up_date,manager,poc_demo</code></p>
      <form onSubmit={submit}>
        <input accept=".csv,text/csv" type="file" onChange={e=>setFile(e.target.files[0])} />
        <div style={{marginTop:10}}>
          <button disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
        </div>
      </form>

      {result && (
        <div style={{marginTop:20}}>
          <h3>Result</h3>
          <p>Inserted: {result.insertedCount}</p>
          <pre style={{maxHeight:200, overflow:'auto', background:'#f7f7f7', padding:10}}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
