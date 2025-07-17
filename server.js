const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('database.db');

// Создаем таблицу
db.run('CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT)');

// Настройки
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('views', './views');
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Главная страница
app.get('/', (req, res) => {
  db.all('SELECT * FROM notes', (err, rows) => {
    res.render('index.html', { notes: rows });
  });
});

// Добавить запись
app.post('/add', (req, res) => {
  const content = req.body.content;
  db.run('INSERT INTO notes (content) VALUES (?)', [content], () => {
    res.redirect('/');
  });
});

// Удалить запись
app.post('/delete/:id', (req, res) => {
  db.run('DELETE FROM notes WHERE id = ?', [req.params.id], () => {
    res.redirect('/');
  });
});

app.listen(3000, () => {
  console.log('Сервер запущен: http://localhost:3000');
});