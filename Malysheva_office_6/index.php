<?php
declare(strict_types=1);

require_once __DIR__ . '/order_service.php';

use SiteMalysheva\OfficeVariant6\OrderException;
use SiteMalysheva\OfficeVariant6\OrderService;

$colors = ['Орех', 'Дуб мореный', 'Палисандр', 'Эбеновое дерево', 'Клен', 'Лиственница'];
$items = ['Банкетка', 'Кровать', 'Комод', 'Шкаф', 'Стул', 'Стол'];

$old = $_POST;
$today = (new DateTime('today'))->format('Y-m-d');
$error = '';
$result = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  try {
    $result = OrderService::handle($_POST, $_FILES);
  } catch (OrderException $e) {
    $error = $e->getMessage();
  } catch (Throwable $e) {
    $error = 'Ошибка сервера: ' . $e->getMessage();
  }
}

function h(mixed $v): string {
  return htmlspecialchars(is_scalar($v) ? (string)$v : '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function oldv(array $old, string $key, string $default = ''): string {
  $v = $old[$key] ?? $default;
  return is_string($v) ? $v : $default;
}

function oldChecked(array $old, string $val): bool {
  $arr = $old['items'] ?? [];
  if (!is_array($arr)) return false;
  return in_array($val, array_map('strval', $arr), true);
}

function oldQty(array $old, string $item): string {
  $q = $old['qty'][$item] ?? '';
  if (is_string($q) || is_numeric($q)) {
    $q = (string)$q;
    return preg_match('/^\d+$/', $q) ? $q : '';
  }
  return '';
}
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

      <form enctype="multipart/form-data" method="post" action="./index.php">
        <div class="office-grid">
          <div class="office-field">
            <label for="lastName">Фамилия</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              placeholder="Иванова"
              autocomplete="family-name"
              value="<?= h(oldv($old, 'lastName')) ?>"
            >
          </div>

          <div class="office-field">
            <label for="city">Город доставки</label>
            <select id="city" name="city" required autocomplete="shipping address-level2">
              <option value="">— выберите —</option>
              <?php
              $cities = ['Москва', 'Санкт‑Петербург', 'Новосибирск', 'Екатеринбург', 'Казань'];
              $oldCity = oldv($old, 'city');
              foreach ($cities as $c):
                $sel = ($oldCity === $c) ? 'selected' : '';
                ?>
                <option <?= $sel ?>><?= h($c) ?></option>
              <?php endforeach; ?>
            </select>
          </div>

          <div class="office-field">
            <label for="deliveryDate">Дата доставки</label>
            <input
              id="deliveryDate"
              name="deliveryDate"
              type="date"
              required
              autocomplete="off"
              min="<?= h($today) ?>"
              value="<?= h(oldv($old, 'deliveryDate')) ?>"
            >
          </div>

          <div class="office-field">
            <label for="address">Адрес</label>
            <input
              id="address"
              name="address"
              type="text"
              required
              placeholder="ул. Пушкина, дом 1"
              autocomplete="shipping street-address"
              value="<?= h(oldv($old, 'address')) ?>"
            >
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
                $oldColor = oldv($old, 'color', $colors[0]);
                foreach ($colors as $i => $c):
                  $id = 'color_' . $i;
                  $checked = ($oldColor === $c) ? 'checked' : '';
                  ?>
                  <label class="option" for="<?= htmlspecialchars($id) ?>">
                    <input id="<?= htmlspecialchars($id) ?>" type="radio" name="color" value="<?= htmlspecialchars($c) ?>" <?= $checked ?>>
                    <span><?= htmlspecialchars($c) ?></span>
                  </label>
                <?php endforeach; ?>
              </div>
            </td>
            <td>
              <div class="options inline-2">
                <?php foreach ($items as $i => $it):
                  $id = 'item_' . $i;
                  $checked = oldChecked($old, $it) ? 'checked' : '';
                  ?>
                  <label class="option" for="<?= htmlspecialchars($id) ?>">
                    <input
                      id="<?= htmlspecialchars($id) ?>"
                      class="furniture-check"
                      type="checkbox"
                      name="items[]"
                      value="<?= htmlspecialchars($it) ?>"
                      <?= $checked ?>
                    >
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
                    <?php $qtyEnabled = oldChecked($old, $it); ?>
                    <input
                      type="number"
                      name="qty[<?= htmlspecialchars($it) ?>]"
                      placeholder="0"
                      min="0"
                      value="<?= $qtyEnabled ? h(oldQty($old, $it)) : '' ?>"
                      data-qty-item="<?= htmlspecialchars($it) ?>"
                      <?= $qtyEnabled ? '' : 'disabled' ?>
                    >
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
          </div>

            <a class="btn" href="./index.php">Очистить форму</a>
          <button id="submitBtn" class="btn primary" type="submit">Оформить заказ</button>
        </div>
      </form>

      <?php if ($error !== ''): ?>
        <div class="error"><?= h($error) ?></div>
      <?php endif; ?>

      <?php if (is_array($result)): ?>
        <div class="result">
          <h3>Готово</h3>
          <div><b>Номер накладной:</b> <?= h($result['invoiceNumber'] ?? '') ?></div>
          <div><b>Цвет:</b> <?= h($result['colorName'] ?? '') ?></div>
          <div><b>Товаров:</b> <?= h($result['itemsCount'] ?? '') ?></div>
          <div><b>Сумма без наценки:</b> <?= h((string)($result['sumNoMarkup'] ?? '')) ?></div>
          <div><b>Сумма с наценкой:</b> <?= h((string)($result['sumWithMarkup'] ?? '')) ?></div>
          <div style="height: 10px"></div>
          <div class="links">
            <?php if (!empty($result['invoiceDownloadUrl'])): ?>
              <a class="btn primary" href="<?= h($result['invoiceDownloadUrl']) ?>" download>Скачать накладную (Excel)</a>
            <?php endif; ?>
            <?php if (!empty($result['recordsOdtUrl'])): ?>
              <a class="btn" href="<?= h($result['recordsOdtUrl']) ?>" download>Запись о документах (ODT)</a>
            <?php endif; ?>
            <?php if (!empty($result['recordsPdfUrl'])): ?>
              <a class="btn" href="<?= h($result['recordsPdfUrl']) ?>" download>Запись о документах (PDF)</a>
            <?php endif; ?>
          </div>
        </div>
      <?php endif; ?>
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
<script src="qty-toggle.js"></script>
</body>
</html>

