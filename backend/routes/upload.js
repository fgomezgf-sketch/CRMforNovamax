const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parse } = require('csv-parse');
const db = require('../db');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const text = req.file.buffer.toString('utf8');

  const records = [];
  const parser = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  parser.on('readable', () => {
    let record;
    while ((record = parser.read())) {
      records.push(record);
    }
  });

  parser.on('error', err => {
    console.error(err);
    return res.status(400).json({ error: 'CSV parse error', details: err.message });
  });

  parser.on('end', async () => {
    const inserted = [];
    const errors = [];
    for (const row of records) {
      try {
        const first_name = row.first_name ?? row['First Name'] ?? row['first name'] ?? row['firstname'] ?? '';
        const last_name = row.last_name ?? row['Last Name'] ?? row['last name'] ?? row['lastname'] ?? '';
        const email = (row.email ?? row.Email ?? '').trim();
        const phone = row.phone ?? row.Phone ?? '';
        const company = row.company ?? row.Company ?? row.organization ?? '';
        const notes = row.notes ?? '';
        const last_contacted = row.last_contacted ?? row['Last Contacted'] ?? null;
        const next_step = row.next_step ?? row['Next Step'] ?? '';
        const follow_up_date = row.follow_up_date ?? row['follow_up_date'] ?? null;
        const manager = row.manager ?? '';
        const poc_demo_raw = row.poc_demo ?? row['POC Demo'] ?? row['poc demo'] ?? 'no';
        const poc_demo = (String(poc_demo_raw).toLowerCase().startsWith('y') || String(poc_demo_raw) === '1' || String(poc_demo_raw).toLowerCase()==='true') ? true : false;

        if (!email) {
          errors.push({ row, error: 'missing email - skipped' });
          continue;
        }

        const q = `
          INSERT INTO contacts
            (first_name,last_name,email,phone,company,notes,last_contacted,next_step,follow_up_date,manager,poc_demo)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
          ON CONFLICT (email) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            phone = EXCLUDED.phone,
            company = EXCLUDED.company,
            notes = EXCLUDED.notes,
            last_contacted = EXCLUDED.last_contacted,
            next_step = EXCLUDED.next_step,
            follow_up_date = EXCLUDED.follow_up_date,
            manager = EXCLUDED.manager,
            poc_demo = EXCLUDED.poc_demo
          RETURNING *;
        `;
        const values = [first_name,last_name,email,phone,company,notes,last_contacted,next_step,follow_up_date,manager,poc_demo];
        const r = await db.query(q, values);
        inserted.push(r.rows[0]);
      } catch (err) {
        console.error('row error', err);
        errors.push({ row, error: err.message });
      }
    }

    res.json({ insertedCount: inserted.length, errors, insertedSample: inserted.slice(0,10) });
  });

  parser.write(text);
  parser.end();
});

module.exports = router;
