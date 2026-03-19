document.addEventListener('DOMContentLoaded', () => {
  const boxes = Array.from(document.querySelectorAll('input.furniture-check[type="checkbox"]'));
  const qtyInputs = Array.from(document.querySelectorAll('input[data-qty-item]'));
  const map = new Map();
  qtyInputs.forEach((inp) => map.set(inp.dataset.qtyItem, inp));

  function sync() {
    boxes.forEach((cb) => {
      const inp = map.get(cb.value);
      if (!inp) return;
      inp.disabled = !cb.checked;
      if (inp.disabled) inp.value = '';
    });
  }

  boxes.forEach((cb) => cb.addEventListener('change', sync));
  sync();
});

