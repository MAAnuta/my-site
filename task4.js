// Глобальные переменные
let Tokens = [];
let IdCounter = 0;

// DOM элементы
const DOM = {
    block3: document.getElementById('block3'),
    block2: document.getElementById('block2'),
    leftContainer: document.getElementById('leftContainer'),
    parseBtn: document.getElementById('parseBtn'),
    inputText: document.getElementById('inputText'),
    selectedWords: document.getElementById('selectedWords'),
    right: document.querySelector('.right')
};

// Вспомогательные функции
const IsNumberStr = str => /^-?(0|[1-9]\d*)(\.\d+)?$/.test(str);
const IsFirstCharUpper = str => str && str[0] !== str[0].toLowerCase();
const RndColor = () => {
    const h = Math.floor(Math.random() * 360); // оттенок (0-359)
    const s = 60 + Math.floor(Math.random() * 20); // насыщенность (60-79)
    const l = 55 + Math.floor(Math.random() * 5); // светлота (55-59)
    return `hsl(${h} ${s}% ${l}%)`;
};

// Очистка зон
const ClearAreas = () => {
    DOM.block3.querySelectorAll('.oval').forEach(el => el.remove());
    DOM.leftContainer.innerHTML = '';
    DOM.selectedWords.innerHTML = '';
};

// Создание элемента-овала
const MakeOvalElement = token => {
    const span = document.createElement('span');
    span.className = 'oval';
    span.draggable = true;
    span.dataset.id = token.id;
    span.textContent = `${token.key} ${token.raw}`;
    span.addEventListener('dragstart', OnDragStart);
    span.addEventListener('click', () => {
        if (span.parentElement === DOM.leftContainer) {
            AppendSelectedWord(token);
        }
    });
    return span;
};

// Разбор ввода и создание, сортировка и отображение токенов
const BuildAssociativeArrayAndRender = input => {
    ClearAreas();
    Tokens = [];
    IdCounter = 0;

    const parts = input.split('-').map(s => s.trim()).filter(Boolean);
    const lowers = [], uppers = [], nums = [];

    parts.forEach((p, i) => {
        if (IsNumberStr(p)) nums.push({ raw: p, origIndex: i });
        else if (IsFirstCharUpper(p)) uppers.push({ raw: p, origIndex: i });
        else lowers.push({ raw: p, origIndex: i });
    });

    lowers.sort((a, b) => a.raw.localeCompare(b.raw, 'ru'));
    uppers.sort((a, b) => a.raw.localeCompare(b.raw, 'ru'));
    nums.sort((a, b) => Number(a.raw) - Number(b.raw));

    let aIdx = 1, bIdx = 1, nIdx = 1;
    const addToken = (type, obj) => {
        const key = type === 'a' ? `a${aIdx++}` : type === 'b' ? `b${bIdx++}` : `n${nIdx++}`;
        const token = {
            id: `t${IdCounter++}`,
            raw: obj.raw,
            type,
            key,
            originalIndex: obj.origIndex,
            color: null,
            block3Index: Tokens.length
        };
        Tokens.push(token);
        return token;
    };

    [...lowers, ...uppers, ...nums].forEach(obj => {
        const type = lowers.includes(obj) ? 'a' : uppers.includes(obj) ? 'b' : 'n';
        const token = addToken(type, obj);
        const el = MakeOvalElement(token);
        token.element = el;
        DOM.block3.appendChild(el);
        const rect = el.getBoundingClientRect();
        token.widthPx = rect.width;
        token.heightPx = rect.height;
    });
};

// Обработчики перетаскивания
// начало перетаскивания
const OnDragStart = e => {
    const id = e.target.dataset.id; // чтоб потом найти соответствующий токен в массиве при сбросе овала
    e.dataTransfer.setData('text/plain', id); // чтоб потом удобно достать в drop
    e.dataTransfer.setData('from', e.target.closest('.top') ? 'block3' : 'block2');
    e.dataTransfer.effectAllowed = 'move';
};
// разрешение сброса
const AllowDrop = e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drop-target');
};

const ClearDropHighlights = () => {
    DOM.block2.classList.remove('drop-target');
    DOM.block3.classList.remove('drop-target');
};

const PositionElement = (el, x, y, containerRect, elementRect) => {
    const halfWidth = elementRect.width / 2;
    const halfHeight = elementRect.height / 2;
    x = Math.max(halfWidth, Math.min(x, containerRect.width - halfWidth));
    y = Math.max(halfHeight, Math.min(y, containerRect.height - halfHeight));
    el.style.position = 'absolute';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transform = 'translate(-50%, -50%)';
};

const OnDropToBlock2 = e => {
    if (e.target.classList.contains('oval')) {
        return;
    }

    e.preventDefault();
    ClearDropHighlights();
    const id = e.dataTransfer.getData('text/plain');
    const from = e.dataTransfer.getData('from');
    const token = Tokens.find(t => t.id === id);
    if (!token) return;

    const el = token.element;
    if (from === 'block3' && el.parentElement === DOM.block3) el.remove();

    if (!token.color) token.color = RndColor();
    el.style.background = token.color;
    if (token.widthPx) {
        el.style.width = `${token.widthPx}px`;
        el.style.height = `${token.heightPx}px`;
        el.style.lineHeight = `${token.heightPx}px`;
    }

    DOM.leftContainer.appendChild(el);
    const containerRect = DOM.leftContainer.getBoundingClientRect();
    const elementRect = el.getBoundingClientRect();
    PositionElement(el, e.clientX - containerRect.left, e.clientY - containerRect.top, containerRect, elementRect);
};

const OnDropToBlock3 = e => {
    e.preventDefault();
    ClearDropHighlights();
    const id = e.dataTransfer.getData('text/plain');
    const from = e.dataTransfer.getData('from');
    const token = Tokens.find(t => t.id === id);
    if (!token || from !== 'block2') return;

    const el = token.element;
    if (el.parentElement === DOM.leftContainer) el.remove();

    token.color = null;
    el.style.background = '#e2e8f0';
    el.style.width = '';
    el.style.height = '';
    el.style.lineHeight = '';
    el.style.position = '';
    el.style.left = '';
    el.style.top = '';
    el.style.transform = '';

    const children = Array.from(DOM.block3.children).filter(c => c.classList.contains('oval'));
    let inserted = false;
    for (const child of children) {
        const childToken = Tokens.find(t => t.id === child.dataset.id); // токен текущего овала
        if (childToken && childToken.block3Index > token.block3Index) {
            DOM.block3.insertBefore(el, child);
            inserted = true;
            break;
        }
    }
    if (!inserted) DOM.block3.appendChild(el);
};

const AppendSelectedWord = token => {
    const span = document.createElement('span');
    span.className = 'selected-item';
    span.textContent = token.raw;
    span.style.color = token.color;
    DOM.selectedWords.appendChild(span);
};

// Установка обработчиков событий
const SetupEventListeners = () => {
    DOM.block2.addEventListener('dragover', AllowDrop);
    DOM.block3.addEventListener('dragover', AllowDrop);
    DOM.block2.addEventListener('drop', OnDropToBlock2);
    DOM.block3.addEventListener('drop', OnDropToBlock3);
    DOM.block2.addEventListener('dragenter', e => {
        if (e.target === DOM.block2) DOM.block2.classList.add('drop-target');
    });
    DOM.block3.addEventListener('dragenter', e => {
        if (e.target === DOM.block3) DOM.block3.classList.add('drop-target');
    });
    DOM.right.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'none';
    });
    DOM.right.addEventListener('drop', e => e.preventDefault());
    document.addEventListener('dragend', ClearDropHighlights);
    document.addEventListener('selectstart', e => {
        if (e.target.classList.contains('oval')) e.preventDefault();
    });
    DOM.parseBtn.addEventListener('click', () => BuildAssociativeArrayAndRender(DOM.inputText.value || ''));
};

// Инициализация
const initTask4 = () => {
    SetupEventListeners();
    DOM.inputText.value = 'лес-бабочка-20-бык-крик-3-Бок';
    BuildAssociativeArrayAndRender(DOM.inputText.value);
};

// Вызов инициализации
initTask4();