const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// NA HOSTINGER, USE localhost OU 127.0.0.1
const db = mysql.createConnection({
  host: 'localhost',  // ← NÃO use 'mysql-bebeuja'
  user: 'bebeujauser',
  password: '3mttwoexsqwgm8ubu5uz',
  database: 'jabebeu',
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erro no MySQL:', err);
    return;
  }
  console.log('✅ Conectado ao MySQL!');
});

// Rota de teste - verifica se a API está viva
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Listar lojas
app.get('/api/stores', (req, res) => {
  db.query('SELECT * FROM stores ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error('Erro na query:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Buscar loja por ID
app.get('/api/stores/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM stores WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro na query:', err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }
    res.json(results[0]);
  });
});

// Criar loja
app.post('/api/stores', (req, res) => {
  const { store_name, description, phone, email, city } = req.body;
  db.query(
    'INSERT INTO stores (store_name, description, phone, email, city) VALUES (?, ?, ?, ?, ?)',
    [store_name, description, phone, email, city],
    (err, result) => {
      if (err) {
        console.error('Erro no insert:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: result.insertId, success: true });
    }
  );
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});
