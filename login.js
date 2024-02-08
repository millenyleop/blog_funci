const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
const mysql = require('mysql2');
const session = require('express-session');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'phpmyadmin',
  password: 'milleny',
  database: 'aluno',
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    throw err;
  }
  console.log('Conexão com o banco de dados MySQL estabelecida.');
});

app.use(session({
  secret: 'aluno',
  resave: true,
  saveUninitialized: true,
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('logar');
});

app.get('/postagem', (req, res) => {
  if (req.session.loggedin) {
    db.query('SELECT * FROM Postagens', (err, result) => {
      if (err) throw err;
      res.render('postagem', { Postagens: result });
    });
  } else {
    res.redirect('/login');
  }
});
// Rota para deletar uma postagem
app.get('/deletePostagens/:id', (req, res) => {
  const postId = req.params.id;
  const sql = 'DELETE FROM Postagens WHERE id = ?';
  db.query(sql, [postId], (err, result) => {
    if (err) throw err;
    console.log(`Postagem com ID ${postId} excluída com sucesso.`);
    res.redirect('/postagens');
  });
});



app.post('/login', (req, res) => {
  const { nome, senha } = req.body;
  const query = 'SELECT * FROM login WHERE nome = ? AND senha = ?';
  db.query(query, [nome, senha], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      req.session.loggedin = true;
      req.session.nome = nome;
      res.redirect('/postagem');
    } else {
      res.send('Credenciais Incorretas. <a href="/">Tente Novamente</a>');
    }
  });
});

app.get('/dash', (req, res) => {
  if (req.session.loggedin) {
    res.sendFile(__dirname + '/views/dash.html');
  } else {
    res.send('Faça login para acessar esta página. <a href="/">Login</a>');
  }
});

app.post('/submit_post', (req, res) => {
  const { mensagens } = req.body;
  const sql = 'INSERT INTO Postagens (mensagens) VALUES (?)';
  db.query(sql, [mensagens], (err, result) => {
    if (err) throw err;
    res.redirect('/postagem');
  });
});

app.post('/cadastro', (req, res) => {
  const { username, email, password } = req.body;
  const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  db.query(sql, [username, email, password], (err, result) => {
    if (err) {
      console.error('Erro ao inserir usuário:', err);
      res.redirect('/cadastro'); // Redireciona de volta ao formulário de cadastro em caso de erro
    } else {
      // Cadastro bem-sucedido; você pode redirecionar para a página de login ou outra página.
      res.redirect('/');
    }
  });
});

// DELETE
app.get('/delete/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.redirect('/teste');
  });
});

app.get('/delete2/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM Postagens WHERE id = ?';
  console.log('Delete post')
  
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.redirect('/postagem');
  });
});



// READ
app.get('/postagem', (req, res) => {
  db.query('SELECT * FROM Postagens', (err, result) => {
    if (err) throw err;
    res.render('postagem', { Postagens: result });
  });
});

    // Rota para a página do painel
app.get('/dash', (req, res) => {



  //
  //
  //
  //modificação aqui
  if (req.session.loggedin) {
  //res.send(`Bem-vindo, ${req.session.username}!<br><a href="/logout">Sair</a>`);
  res.sendFile(__dirname + '/views/dash.html');
  } else {
  res.send('Faça login para acessar esta página. <a href="/">Login</a>');
  }
  });
  
  // Rota para fazer logout
  app.get('/logout', (req, res) => {
  req.session.destroy(() => {
  res.redirect('/');
  });
  });
  
    
      


const port = 3000;
app.listen(port, () => {
  console.log(`Servidor em execução na porta ${port}`);
});