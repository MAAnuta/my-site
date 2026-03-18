const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function rub(n) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(n);
}

function setQtyEnabled(item, enabled) {
  const input = $(`input[name="qty[${item}]"]`);
  if (!input) return;
  input.disabled = !enabled;
  if (!enabled) input.value = '';
  input.min = 1;
}

function syncQtyWithChecks() {
  $$('.furniture-check').forEach((cb) => {
    setQtyEnabled(cb.value, cb.checked);
  });
}

async function submitOrder(e) {
  e.preventDefault();

  const form = $('#orderForm');
  const btn = $('#submitBtn');
  const res = $('#result');
  const err = $('#errorBox');

  err.hidden = true;
  res.hidden = true;
  btn.disabled = true;
  btn.textContent = 'Формируем документы...';

  try {
    const fd = new FormData(form);
    const r = await fetch('process.php', { method: 'POST', body: fd });
    const raw = await r.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(`Сервер вернул не-JSON ответ (${r.status}). Проверьте error.log XAMPP.`);
    }
    if (!r.ok || !data.ok) throw new Error(data?.error || 'Ошибка обработки заказа');

    $('#invoiceNumber').textContent = data.invoiceNumber;
    $('#colorName').textContent = data.colorName;
    $('#itemsCount').textContent = String(data.itemsCount);
    $('#sumNoMarkup').textContent = rub(data.sumNoMarkup);
    $('#sumWithMarkup').textContent = rub(data.sumWithMarkup);

    const links = $('#downloadLinks');
    links.innerHTML = '';
    const a1 = document.createElement('a');
    a1.href = data.invoiceDownloadUrl;
    a1.textContent = 'Скачать накладную (Excel)';
    a1.className = 'btn primary';
    a1.setAttribute('download', '');
    links.appendChild(a1);

    if (data.recordsOdtUrl) {
      const a2 = document.createElement('a');
      a2.href = data.recordsOdtUrl;
      a2.textContent = 'Запись о документах (ODT)';
      a2.className = 'btn';
      a2.setAttribute('download', '');
      links.appendChild(a2);
    }
    if (data.recordsPdfUrl) {
      const a3 = document.createElement('a');
      a3.href = data.recordsPdfUrl;
      a3.textContent = 'Запись о документах (PDF)';
      a3.className = 'btn';
      a3.setAttribute('download', '');
      links.appendChild(a3);
    }

    res.hidden = false;
  } catch (ex) {
    err.textContent = ex?.message || String(ex);
    err.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Оформить заказ';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  $$('.furniture-check').forEach((cb) => cb.addEventListener('change', syncQtyWithChecks));
  syncQtyWithChecks();
  $('#orderForm').addEventListener('submit', submitOrder);
});

