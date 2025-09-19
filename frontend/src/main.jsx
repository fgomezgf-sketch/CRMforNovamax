import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Contacts from './pages/Contacts'
import UploadCSV from './pages/UploadCSV'
import './index.css'

function App(){
  return (
    <BrowserRouter>
      <div style={{padding:20}}>
        <nav style={{display:'flex',gap:10, marginBottom:20}}>
          <Link to="/contacts">Contacts</Link>
          <Link to="/upload">Upload CSV</Link>
        </nav>
        <Routes>
          <Route path="/contacts" element={<Contacts/>}/>
          <Route path="/upload" element={<UploadCSV/>}/>
          <Route path="/" element={<Contacts/>}/>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App/>)
