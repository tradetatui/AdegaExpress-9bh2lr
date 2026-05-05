const express = require('express'); 
const mysql = require('mysql2'); 
const cors = require('cors'); 
 
const app = express(); 
app.use(cors()); 
app.use(express.json()); 
 
const db = mysql.createConnection({ 
  host: 'mysql-bebeuja', 
  user: 'bebeujauser', 
  password: '3mttwoexsqwgm8ubu5uz',
  database: 'jabebeu' 
}); 
 
db.connect((err) =
  if (err) { 
    console.error('Erro ao conectar:', err); 
    return; 
  } 
  console.log('Conectado ao MySQL!'); 
}); 
 
app.get('/api/stores', (req, res) =
  db.query('SELECT * FROM stores ORDER BY id DESC', (err, results) =
    if (err) return res.status(500).json({ error: err.message }); 
    res.json(results); 
  }); 
}); 
 
app.post('/api/stores', (req, res) =
  const { store_name, description, phone, email, city } = req.body; 
  const sql = 'INSERT INTO stores (store_name, description, phone, email, city) VALUES (?, ?, ?, ?, ?)'; 
  db.query(sql, [store_name, description, phone, email, city], (err, result) =
    if (err) return res.status(500).json({ error: err.message }); 
    res.json({ id: result.insertId, success: true }); 
  }); 
}); 
 
const PORT = 3001; 
app.listen(PORT, () =
  console.log(`API rodando na porta ${PORT}`); 
}); 
