const express = require('express');
const router = express.Router();
const db = require('../db');
// const auth = require('../middleware/auth');

// For this repo, the auth middleware is optional. If you want user-scoped data enable it.
// router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 25 } = req.query;
    const offset = (page - 1) * limit;
    const q = `
      SELECT * FROM contacts
      WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 OR company ILIKE $1)
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const r = await db.query(q, [`%${search}%`, limit, offset]);
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const r = await db.query('SELECT * FROM contacts WHERE id=$1', [id]);
  if (!r.rows.length) return res.status(404).json({ error: 'not found' });
  res.json(r.rows[0]);
});

router.post('/', async (req, res) => {
  const {
    first_name, last_name, email, phone, company,
    notes, last_contacted, next_step, follow_up_date, manager, poc_demo
  } = req.body;
  try {
    const q = `INSERT INTO contacts
      (first_name,last_name,email,phone,company,notes,last_contacted,next_step,follow_up_date,manager,poc_demo)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`;
    const r = await db.query(q, [first_name,last_name,email,phone,company,notes,last_contacted,next_step,follow_up_date,manager,poc_demo]);
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(409).json({ error: 'duplicate' });
    res.status(500).json({ error: 'server error' });
  }
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const fields = ['first_name','last_name','email','phone','company','notes','last_contacted','next_step','follow_up_date','manager','poc_demo'];
  const updates = [];
  const values = [];
  let idx = 1;
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = $${idx}`);
      values.push(req.body[f]);
      idx++;
    }
  }
  if (!updates.length) return res.status(400).json({ error: 'no fields provided' });
  values.push(id);
  const q = `UPDATE contacts SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`;
  try {
    const r = await db.query(q, values);
    if (!r.rows.length) return res.status(404).json({ error: 'not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM contacts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
