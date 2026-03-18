<?php
declare(strict_types=1);
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Задание: Накладная (PHPOffice)</title>
  <link rel="stylesheet" href="../styles/base.css">
  <link rel="stylesheet" href="../styles/components.css">
  <link rel="stylesheet" href="../styles/pages.css">
  <link rel="stylesheet" href="../styles/responsive.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
<header>
  <a href="../index.html" class="logo-link">
    <div class="logo">
      <div class="mask sad">
        <div class="eye"></div>
        <div class="eye"></div>
        <div class="mouth"></div>
      </div>
      <div class="mask happy">
        <div class="eye"></div>
        <div class="eye"></div>
        <div class="mouth"></div>
      </div>
    </div>
  </a>
  <button class="menu-toggle" aria-label="Открыть меню">
    <span class="menu-icon"></span>
  </button>
  <nav class="nav-menu">
    <div class="nav-header">
      <a href="../index.html" class="logo-link mobile-logo">
        <div class="logo">
          <div class="mask sad">
            <div class="eye"></div>
            <div class="eye"></div>
            <div class="mouth"></div>
          </div>
          <div class="mask happy">
            <div class="eye"></div>
            <div class="eye"></div>
            <div class="mouth"></div>
          </div>
        </div>
      </a>
      <button class="menu-close" aria-label="Закрыть меню">&times;</button>
    </div>
    <ul>
      <li><a href="../index.html#about">О театре</a></li>
      <li><a href="../index.html#shows">Спектакли</a></li>
      <li class="dropdown">
        <a href="#" class="dropdown-toggle">Задания</a>
        <ul class="dropdown-menu">
          <li><a href="../tasks/task1.html">Задание 1</a></li>
          <li><a href="../tasks/task2.html">Задание 2</a></li>
          <li><a href="../tasks/task3.html">Задание 3</a></li>
          <li><a href="../tasks/task4.html">Задание 4</a></li>
          <li><a href="../tasks/taskcard/task5.php">Карточка</a></li>
          <li><a href="../Game_Malysheva_TimeCoordination/index.html">Курсовая</a></li>
          <li><a href="./index.php">Накладная (PHPOffice)</a></li>
        </ul>
      </li>
    </ul>
  </nav>
</header>

<main>
  <div class="office-container reveal">
    <div class="office-card">
      <h2 class="office-title">Заказ мебели</h2>

      <form id="orderForm" enctype="multipart/form-data" method="post">
        <div class="office-grid">
          <div class="office-field">
            <label for="lastName">Фамилия</label>
            <input id="lastName" name="lastName" type="text" required placeholder="Иванова">
          </div>

          <div class="office-field">
            <label for="city">Город доставки</label>
            <select id="city" name="city" required>
              <option value="">— выберите —</option>
              <option>Москва</option>
              <option>Санкт‑Петербург</option>
              <option>Новосибирск</option>
              <option>Екатеринбург</option>
              <option>Казань</option>
            </select>
          </div>

          <div class="office-field">
            <label for="deliveryDate">Дата доставки</label>
            <input id="deliveryDate" name="deliveryDate" type="date" required>
          </div>

          <div class="office-field">
            <label for="address">Адрес</label>
            <input id="address" name="address" type="text" required placeholder="ул. Пушкина, дом 1">
          </div>
        </div>

        <div style="height: 14px"></div>

        <table class="office-table">
          <thead>
          <tr>
            <th>Выберите цвет мебели</th>
            <th>Выберите предметы мебели</th>
            <th>Количество</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>
              <div class="options">
                <?php
                $colors = ['Орех', 'Дуб мореный', 'Палисандр', 'Эбеновое дерево', 'Клен', 'Лиственница'];
                foreach ($colors as $i => $c):
                  $id = 'color_' . $i;
                  ?>
                  <label class="option" for="<?= htmlspecialchars($id) ?>">
                    <input id="<?= htmlspecialchars($id) ?>" type="radio" name="color" value="<?= htmlspecialchars($c) ?>" <?= $i === 0 ? 'checked' : '' ?>>
                    <span><?= htmlspecialchars($c) ?></span>
                  </label>
                <?php endforeach; ?>
              </div>
            </td>
            <td>
              <div class="options inline-2">
                <?php
                $items = ['Банкетка', 'Кровать', 'Комод', 'Шкаф', 'Стул', 'Стол'];
                foreach ($items as $i => $it):
                  $id = 'item_' . $i;
                  ?>
                  <label class="option" for="<?= htmlspecialchars($id) ?>">
                    <input class="furniture-check" id="<?= htmlspecialchars($id) ?>" type="checkbox" name="items[]" value="<?= htmlspecialchars($it) ?>">
                    <span><?= htmlspecialchars($it) ?></span>
                  </label>
                <?php endforeach; ?>
              </div>
            </td>
            <td>
              <div class="qty-grid">
                <?php foreach ($items as $it): ?>
                  <div class="qty-row">
                    <div><?= htmlspecialchars($it) ?></div>
                    <input type="number" name="qty[<?= htmlspecialchars($it) ?>]" placeholder="0" disabled>
                  </div>
                <?php endforeach; ?>
              </div>
            </td>
          </tr>
          </tbody>
        </table>

        <div class="office-actions">
          <div class="office-field" style="margin:0">
            <label for="priceFile">Выбрать файл с ценами (CSV)</label>
            <input id="priceFile" name="priceFile" type="file" accept=".csv,text/csv">
            <div style="opacity:.8;font-size:13px;margin-top:6px">Если файл не выбран — используется `price.csv` из модуля.</div>
          </div>

          <button id="submitBtn" class="btn primary" type="submit">Оформить заказ</button>
        </div>
      </form>

      <div id="errorBox" class="error" hidden></div>

      <div id="result" class="result" hidden>
        <h3>Готово</h3>
        <div><b>Номер накладной:</b> <span id="invoiceNumber"></span></div>
        <div><b>Цвет:</b> <span id="colorName"></span></div>
        <div><b>Товаров:</b> <span id="itemsCount"></span></div>
        <div><b>Сумма без наценки:</b> <span id="sumNoMarkup"></span></div>
        <div><b>Сумма с наценкой:</b> <span id="sumWithMarkup"></span></div>
        <div style="height: 10px"></div>
        <div id="downloadLinks" class="links"></div>
      </div>
    </div>
  </div>
</main>

<footer class="footer">
  <div class="footer-container">
    <div class="footer-content">
      <div class="footer-section">
        <h4>Информация</h4>
        <p>© 2025 Мой сайт. Все права защищены.</p>
      </div>
      <div class="footer-section">
        <h4>Контакты</h4>
        <p>Email: info@example.com</p>
        <p>Телефон: +7 (777) 777-77-77</p>
      </div>
      <div class="footer-section">
        <h4>Социальные сети</h4>
        <div class="social-links">
          <a href="#">VK</a>
          <a href="#">Telegram</a>
          <a href="#">Instagram</a>
        </div>
      </div>
    </div>
  </div>
</footer>

<script src="../js/script.js"></script>
<script src="script.js"></script>
</body>
</html>

