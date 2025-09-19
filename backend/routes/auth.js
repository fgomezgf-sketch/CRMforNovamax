const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', async (req,res)=>{
  const { email, password, name } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const r = await db.query('INSERT INTO users(email,password_hash,name) VALUES($1,$2,$3) RETURNING id,email,name', [email,hashed,name]);
  const user = r.rows[0];
  const token = jwt.sign({ uid: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ user, token });
});

router.post('/login', async (req,res)=>{
  const { email, password } = req.body;
  const r = await db.query('SELECT * FROM users WHERE email=$1',[email]);
  const user = r.rows[0];
  if(!user) return res.status(401).json({ error:'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if(!ok) return res.status(401).json({ error:'Invalid credentials' });
  const token = jwt.sign({ uid: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
});

module.exports = router;
