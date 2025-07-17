// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM загружен, инициализация обработчиков...');

  // Обработка кнопок копирования
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const text = this.dataset.text;
      navigator.clipboard.writeText(text).then(() => {
        alert("Скопировано!");
      }).catch(err => {
        console.error('Ошибка копирования:', err);
        alert("Ошибка копирования");
      });
    });
  });

  // Обработка кнопок удаления ссылок
  const deleteButtons = document.querySelectorAll('.delete-link');
  console.log('Найдено кнопок удаления:', deleteButtons.length);

  deleteButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.dataset.id;
      console.log('Нажата кнопка удаления для ID:', id);

      if (!confirm(`Удалить ссылку #${id}?`)) return;

      fetch('/link/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: parseInt(id) })
      })
      .then(res => {
        console.log('Ответ сервера:', res.status);
        if (res.ok) {
          location.reload();
        } else {
          res.text().then(txt => alert("Ошибка: " + txt));
        }
      })
      .catch(err => {
        console.error('Ошибка запроса:', err);
        alert("Сервер недоступен");
      });
    });
  });
});

// Копировать всех в группе
function copyAllInGroup(groupName) {
  const groupHeader = Array.from(document.querySelectorAll('h2')).find(h =>
    h.textContent.includes(groupName)
  );

  if (!groupHeader) {
    alert("Группа не найдена");
    return;
  }

  const ul = groupHeader.nextElementSibling;
  const emails = Array.from(ul.querySelectorAll('li')).map(li => {
    // Извлекаем email из текста (до первого пробела)
    const text = li.textContent.trim();
    const emailMatch = text.match(/([^\s]+@[^\s]+)/);
    return emailMatch ? emailMatch[1] : text.split(' ')[0];
  });

  const all = emails.join('; ');
  navigator.clipboard.writeText(all).then(() => {
    alert("Скопировано: " + all);
  }).catch(err => {
    console.error('Ошибка копирования:', err);
    alert("Ошибка копирования");
  });
}

// Удаление подрядчика
function deleteContractor(email, group) {
  if (!confirm(`Удалить подрядчика ${email} из группы ${group}?`)) return;

  fetch('/contractor/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, group })
  })
  .then(res => {
    if (res.ok) {
      location.reload();
    } else {
      res.text().then(txt => alert("Ошибка: " + txt));
    }
  })
  .catch(err => {
    console.error('Ошибка:', err);
    alert("Сервер недоступен: " + err);
  });
}