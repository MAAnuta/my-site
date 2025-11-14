(function () {
    let tokens = [];
    let idCounter = 0;

    const block3 = document.getElementById('block3');
    const block2 = document.getElementById('block2');
    block2.addEventListener("dragover", allowDrop);
    block3.addEventListener("dragover", allowDrop);
    block2.addEventListener("drop", onDropToBlock2);
    block3.addEventListener("drop", onDropToBlock3);
    const leftContainer = document.getElementById('leftContainer');
    const parseBtn = document.getElementById('parseBtn');
    const inputText = document.getElementById('inputText');
    const selectedWords = document.getElementById('selectedWords');

    function isNumberStr(string) { return /^\d+$/.test(string); }
    function isFirstCharUpper(string) { return string && string[0] !== string[0].toLowerCase(); }

    function rndColor() {
        const h = Math.floor(Math.random() * 360); // оттенок 0-359
        const s = 60 + Math.floor(Math.random() * 20); // насыщенность 60-79%
        const l = 55 + Math.floor(Math.random() * 5); // светлота 55-59%
        return `hsl(${h} ${s}% ${l}%)`;
    }

    function clearAreas() {
        Array.from(block3.querySelectorAll('.oval')).forEach(n => n.remove());
        leftContainer.innerHTML = '';
        selectedWords.innerHTML = '';
    }

    function buildAssociativeArrayAndRender(input) {
        clearAreas();
        tokens = [];
        idCounter = 0;

        const parts = input.split('-').map(s => s.trim()).filter(Boolean);
        const lowers = [], uppers = [], nums = [];

        parts.forEach((p, i) => {
            if (isNumberStr(p)) nums.push({ raw: p, origIndex: i });
            else if (isFirstCharUpper(p)) uppers.push({ raw: p, origIndex: i });
            else lowers.push({ raw: p, origIndex: i });
        });

        lowers.sort((a, b) => a.raw.localeCompare(b.raw, 'ru'));
        uppers.sort((a, b) => a.raw.localeCompare(b.raw, 'ru'));
        nums.sort((a, b) => Number(a.raw) - Number(b.raw));

        let aIdx = 1, bIdx = 1, nIdx = 1;
        const addToken = (type, obj) => {
            const key = (type === 'a' ? 'a' + (aIdx++) :
                type === 'b' ? 'b' + (bIdx++) : 'n' + (nIdx++));
            const t = {
                id: 't' + (idCounter++), raw: obj.raw, type, key,
                originalIndex: obj.origIndex, color: null,
                block3Index: tokens.length
            };
            tokens.push(t);
            return t;
        };

        lowers.forEach(x => addToken('a', x));
        uppers.forEach(x => addToken('b', x));
        nums.forEach(x => addToken('n', x));

        tokens.forEach(t => {
            const el = makeOvalElement(t);
            t.element = el;
            block3.appendChild(el);
            const rect = el.getBoundingClientRect();
            t.widthPx = rect.width;
            t.heightPx = rect.height;
        });
    }

    function makeOvalElement(token) {
        const span = document.createElement('span');
        span.className = 'oval';
        span.draggable = true;
        span.dataset.id = token.id;
        span.textContent = `${token.key} ${token.raw}`;
        span.addEventListener('dragstart', onDragStart);
        span.addEventListener('click', () => {
            if (span.parentElement.id === 'leftContainer') {
                appendSelectedWord(token);
            }
        });
        return span;
    }

    function onDragStart(e) {
        const id = e.target.dataset.id;
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.setData('from',
            e.target.closest('.top') ? 'block3' :
                (e.target.closest('.left') ? 'block2' : 'other'));
        e.dataTransfer.effectAllowed = 'move';
    }

    function allowDrop(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drop-target');
    }

    function clearDropHighlights() {
        block2.classList.remove('drop-target');
        block3.classList.remove('drop-target');
    }

    /* DROP В БЛОК 2 */
    function onDropToBlock2(e) {
        e.preventDefault();
        clearDropHighlights();
        const id = e.dataTransfer.getData('text/plain');
        const from = e.dataTransfer.getData('from');
        const token = tokens.find(t => t.id === id);
        if (!token) return;

        const el = token.element;
        if (from === 'block3' && el.parentElement === block3) el.remove();

        // Фиксируем размеры
        if (token.widthPx) {
            el.style.width = token.widthPx + 'px';
            el.style.height = token.heightPx + 'px';
            el.style.lineHeight = token.heightPx + 'px';
        }

        // Цвет только при первом попадании
        if (!token.color) token.color = rndColor();
        el.style.background = token.color;

        leftContainer.appendChild(el);

        // Позиционируем по месту отпускания с ограничениями
        const containerRect = leftContainer.getBoundingClientRect();
        const elementRect = el.getBoundingClientRect();

        // Рассчитываем позицию с учетом границ
        let x = e.clientX - containerRect.left;
        let y = e.clientY - containerRect.top;

        // Ограничиваем позицию, чтобы элемент не выходил за границы
        const halfWidth = elementRect.width / 2;
        const halfHeight = elementRect.height / 2;

        x = Math.max(halfWidth, Math.min(x, containerRect.width - halfWidth));
        y = Math.max(halfHeight, Math.min(y, containerRect.height - halfHeight));

        el.style.position = 'absolute';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.transform = 'translate(-50%, -50%)';

        makeElementReorderable(el);
    }

    /* DROP В БЛОК 3 (возврат на исходную позицию) */
    function onDropToBlock3(e) {
        e.preventDefault();
        clearDropHighlights();
        const id = e.dataTransfer.getData('text/plain');
        const from = e.dataTransfer.getData('from');
        const token = tokens.find(t => t.id === id);
        if (!token || from !== 'block2') return;

        const el = token.element;
        if (el.parentElement === leftContainer) el.remove();

        // Сбрасываем всё
        token.color = null;
        el.style.background = '#e2e8f0';
        el.style.width = '';
        el.style.height = '';
        el.style.lineHeight = '';
        el.style.position = '';
        el.style.left = '';
        el.style.top = '';
        el.style.transform = '';

        // Вставляем на исходную позицию (по block3Index)
        const children = Array.from(block3.children).filter(c => c.classList.contains('oval'));
        let inserted = false;
        for (let i = 0; i < children.length; i++) {
            const childToken = tokens.find(t => t.id === children[i].dataset.id);
            if (childToken && childToken.block3Index > token.block3Index) {
                block3.insertBefore(el, children[i]);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            block3.appendChild(el);
        }

        removeElementReorderable(el);
    }

    /* Перетаскивание внутри блока 2 с ограничениями ---------- */
    function makeElementReorderable(el) {
        el.addEventListener('dragover', elementAllowDrop);
        el.addEventListener('drop', elementDropHandler);
        el.style.cursor = 'grab';
    }

    function removeElementReorderable(el) {
        el.removeEventListener('dragover', elementAllowDrop);
        el.removeEventListener('drop', elementDropHandler);
        el.style.cursor = '';
    }

    function elementAllowDrop(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function elementDropHandler(e) {
        e.preventDefault();
        e.stopPropagation();

        const id = e.dataTransfer.getData('text/plain');
        const from = e.dataTransfer.getData('from');
        const token = tokens.find(t => t.id === id);
        const elDropped = token.element;
        if (!elDropped) return;

        // Если из блока 3 – делаем как при обычном drop в block2
        if (from === 'block3') {
            if (elDropped.parentElement === block3) elDropped.remove();

            if (!token.color) token.color = rndColor();
            elDropped.style.background = token.color;

            if (token.widthPx) {
                elDropped.style.width = token.widthPx + 'px';
                elDropped.style.height = token.heightPx + 'px';
                elDropped.style.lineHeight = token.heightPx + 'px';
            }

            leftContainer.appendChild(elDropped);
            makeElementReorderable(elDropped);
        }

        // Позиционируем по месту сброса с ограничениями
        const containerRect = leftContainer.getBoundingClientRect();
        const elementRect = elDropped.getBoundingClientRect();

        let x = e.clientX - containerRect.left;
        let y = e.clientY - containerRect.top;

        // Ограничиваем позицию, чтобы элемент не выходил за границы
        const halfWidth = elementRect.width / 2;
        const halfHeight = elementRect.height / 2;

        x = Math.max(halfWidth, Math.min(x, containerRect.width - halfWidth));
        y = Math.max(halfHeight, Math.min(y, containerRect.height - halfHeight));

        elDropped.style.position = 'absolute';
        elDropped.style.left = x + 'px';
        elDropped.style.top = y + 'px';
        elDropped.style.transform = 'translate(-50%, -50%)';
    }

    function appendSelectedWord(token) {
        const span = document.createElement('span');
        span.className = 'selected-item';
        span.textContent = token.raw;
        span.style.color = token.color || '#333';
        selectedWords.appendChild(span);
    }

    /* Общие обработчики */
    document.addEventListener('dragend', clearDropHighlights);

    document.querySelector('.right').addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'none';
    });
    document.querySelector('.right').addEventListener('drop', e => e.preventDefault());

    block2.addEventListener('dragenter', e => {
        if (e.target === block2) block2.classList.add('drop-target');
    });
    block3.addEventListener('dragenter', e => {
        if (e.target === block3) block3.classList.add('drop-target');
    });

    parseBtn.addEventListener('click', () => {
        buildAssociativeArrayAndRender(inputText.value || '');
    });

    window.allowDrop = allowDrop;
    window.onDropToBlock2 = onDropToBlock2;
    window.onDropToBlock3 = onDropToBlock3;

    // пример по умолчанию
    inputText.value = 'лес-бабочка-20-бык-крик-3-Бок';
    buildAssociativeArrayAndRender(inputText.value);

    document.addEventListener('selectstart', e => {
        if (e.target.classList.contains('oval')) e.preventDefault();
    });
})();