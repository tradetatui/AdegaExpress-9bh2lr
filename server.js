const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do banco de dados
const dbConfig = {
  host: 'localhost', // Ou o host correto do seu banco de dados
  user: 'bebeujauser',
  password: '3mttwoexsqwgm8ubu5uz',
  database: 'jabebeu',
  port: 3306,
  // Configurações para manter a conexão ativa
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Criar o pool de conexões
const pool = mysql.createPool(dbConfig);
const db = pool.promise(); // Usar a versão com Promise

// Função para testar a conexão no início
(async function testDbConnection() {
  try {
    const connection = await db.getConnection();
    console.log('✅ Conectado ao MySQL com pool!');
    connection.release();
  } catch (err) {
    console.error('❌ ERRO FATAL: Não foi possível conectar ao MySQL:', err.message);
    process.exit(1); // Encerra o servidor se o banco estiver offline no início
  }
})();

// (Opcional, mas bom para logs) Evento de erro do pool
pool.on('error', (err) => {
  console.error('Erro inesperado no pool do MySQL:', err);
});

// ========== ROTAS DA API ==========

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Listar lojas
app.get('/api/stores', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM stores ORDER BY id DESC');
    res.json(results);
  } catch (err) {
    console.error('Erro na query /api/stores:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Buscar loja por ID
app.get('/api/stores/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM stores WHERE id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error(`Erro na query /api/stores/${id}:`, err);
    return res.status(500).json({ error: err.message });
  }
});

// Criar loja
app.post('/api/stores', async (req, res) => {
  const { store_name, description, phone, email, city } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO stores (store_name, description, phone, email, city) VALUES (?, ?, ?, ?, ?)',
      [store_name, description, phone, email, city]
    );
    res.json({ id: result.insertId, success: true });
  } catch (err) {
    console.error('Erro no insert /api/stores:', err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});
