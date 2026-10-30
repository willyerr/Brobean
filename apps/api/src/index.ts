import express from 'express';
import cors from 'cors';
import type { Bean } from '@brobean/shared';

const app = express();
app.use(cors());
app.use(express.json());

// Simulasi Database di Backend
let beansDB: Bean[] = [];

// READ
app.get('/api/beans', (req, res) => {
  res.status(200).json(beansDB);
});

// CREATE
app.post('/api/beans', (req, res) => {
  const newBean: Bean = { ...req.body, id: Date.now() };
  beansDB.push(newBean);
  res.status(201).json(newBean);
});

// UPDATE
app.put('/api/beans/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = beansDB.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ message: 'Tidak ditemukan' }); // Harus return di sini
  
  beansDB[index] = { ...beansDB[index], ...req.body };
  res.status(200).json(beansDB[index]); // Return JSON hasil update
});

// DELETE
app.delete('/api/beans/:id', (req, res) => {
  const id = parseInt(req.params.id);
  beansDB = beansDB.filter(b => b.id !== id);
  res.status(200).json({ message: 'Terhapus' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server API berjalan di http://localhost:${PORT}`);
});