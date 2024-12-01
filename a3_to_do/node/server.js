const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Conectar ao banco de dados MySQL
const db = mysql.createConnection({
  host: '10.0.2.2',
  user: 'root', // Seu usuário do MySQL
  password: 'Oi@17101997', // Sua senha do MySQL
  database: 'task_db', // Nome do banco de dados
});

// Criar a tabela de tarefas, se não existir
db.query(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL
  )
`);

// Endpoint para consulta de todas as tarefas (GET)
app.get('/tasks', (req, res) => {
  db.query('SELECT * FROM tasks', (err, results) => {
    if (err) {
      return res.status(500).send('Erro ao consultar tarefas');
    }
    res.json(results);
  });
});

// Endpoint para consulta de tarefa por ID (GET)
app.get('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  db.query('SELECT * FROM tasks WHERE id = ?', [taskId], (err, results) => {
    if (err) {
      return res.status(500).send('Erro ao consultar tarefa');
    }
    if (results.length === 0) {
      return res.status(404).send('Tarefa não encontrada');
    }
    res.json(results[0]);
  });
});

// Endpoint para adicionar uma nova tarefa (POST)
app.post('/tasks', (req, res) => {
  console.log('Dados recebidos:', req.body); // Log dos dados enviados
  const { title, description } = req.body;
  db.query(
    'INSERT INTO tasks (title, description) VALUES (?, ?)',
    [title, description],
    (err, result) => {
      if (err) {
        console.error('Erro ao adicionar tarefa:', err);
        return res.status(500).send('Erro ao adicionar tarefa');
      }
      console.log('Tarefa adicionada com ID:', result.insertId);
      res.status(201).json({ id: result.insertId, title, description });
    }
  );
});

// Endpoint para atualizar uma tarefa existente (PUT)
app.put('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const { title, description } = req.body;
  db.query(
    'UPDATE tasks SET title = ?, description = ? WHERE id = ?',
    [title, description, taskId],
    (err, result) => {
      if (err) {
        return res.status(500).send('Erro ao editar tarefa');
      }
      if (result.affectedRows === 0) {
        return res.status(404).send('Tarefa não encontrada');
      }
      res.json({ id: taskId, title, description });
    }
  );
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});

