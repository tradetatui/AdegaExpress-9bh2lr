const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 MySQL (EasyPanel)
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'jabebeu'
});

db.connect((err) => {
  if (err) {
    console.log('Erro MySQL:', err.message);
    return;
  }
  console.log('🔥 MySQL conectado!');
});

// TESTE
app.get('/', (req, res) => {
  res.json({ status: 'API rodando 🚀' });
});

// LISTAR STORES
app.get('/api/stores', (req, res) => {
  db.query('SELECT * FROM stores ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// CRIAR STORE
app.post('/api/stores', (req, res) => {
  const { store_name, description, phone, email, city } = req.body;

  const sql = `
    INSERT INTO stores (store_name, description, phone, email, city)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [store_name, description, phone, email, city], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId });
  });
});

// PORTA (IMPORTANTE PARA EASY PANEL)
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});
