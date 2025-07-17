const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('database.db');

// --- Middleware (должно быть ДО маршрутов!) ---
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

// --- Инициализация таблиц ---
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS tmc (id INTEGER PRIMARY KEY, name TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS links (id INTEGER PRIMARY KEY, label TEXT, url TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS contractors (id INTEGER PRIMARY KEY, group_name TEXT, email TEXT, note TEXT)`);
});

// --- Главная страница ---
app.get('/', (req, res) => {
  db.all(`SELECT * FROM tmc`, (_, tmc) => {
    db.all(`SELECT * FROM links`, (_, links) => {
      db.all(`SELECT * FROM contractors`, (_, contractors) => {
        res.render('index', { tmc, links, contractors });
      });
    });
  });
});

// --- Добавить ТМЦ ---
app.post('/tmc', (req, res) => {
  db.run(`INSERT INTO tmc (name) VALUES (?)`, [req.body.name], () => res.redirect('/'));
});

// --- Добавить ссылку ---
app.post('/link', (req, res) => {
  db.run(`INSERT INTO links (label, url) VALUES (?, ?)`, [req.body.label, req.body.url], () => res.redirect('/'));
});

// --- Добавить подрядчика ---
app.post('/contractor', (req, res) => {
  db.run(
    `INSERT INTO contractors (group_name, email, note) VALUES (?, ?, ?)`,
    [req.body.group, req.body.email, req.body.note || ''],
    () => res.redirect('/')
  );
});

// --- Удалить подрядчика ---
app.post('/contractor/delete', (req, res) => {
  console.log('======= ЗАПРОС НА УДАЛЕНИЕ =======');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('BODY:', req.body);

  const { email, group } = req.body;

  if (!email || !group) {
    console.log('❌ Нет email или group');
    return res.status(400).send('Неверные данные');
  }

  db.run(`DELETE FROM contractors WHERE email = ? AND group_name = ?`, [email.trim(), group.trim()], function (err) {
    if (err) {
      console.error('❌ SQLite ошибка:', err);
      return res.status(500).send('Ошибка при удалении');
    }

    if (this.changes === 0) {
      console.log('⚠️ Не найдено совпадений для удаления');
      return res.status(404).send('Не найдено');
    }

    console.log('✅ Успешно удалено:', email);
    return res.sendStatus(200);
  });
});

// --- Удалить ссылку ---
app.post('/link/delete', (req, res) => {
  console.log('======= ЗАПРОС НА УДАЛЕНИЕ ССЫЛКИ =======');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('BODY:', req.body);

  let { id } = req.body;

  if (!id) {
    console.log('❌ ID отсутствует');
    return res.status(400).send('ID отсутствует');
  }

  // SQLite требует числа
  id = parseInt(id);
  if (isNaN(id)) {
    console.log('❌ ID должен быть числом, получен:', typeof id, id);
    return res.status(400).send('ID должен быть числом');
  }

  console.log('🔄 Удаляем ссылку с ID:', id);

  db.run(`DELETE FROM links WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('❌ Ошибка при удалении ссылки:', err.message);
      return res.status(500).send('Ошибка сервера при удалении');
    }

    if (this.changes === 0) {
      console.log('⚠️ Ссылка не найдена с ID:', id);
      return res.status(404).send('Ссылка не найдена');
    }

    console.log(`✅ Удалена ссылка ID=${id}, изменений:`, this.changes);
    res.sendStatus(200);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});