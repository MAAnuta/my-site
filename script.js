document.addEventListener('DOMContentLoaded', () => {
    // === ПРОВЕРКА: ЭТО СТРАНИЦА ЗАДАНИЙ? ===
    const taskPage = document.querySelector('.task-page');
    const isMobile = window.innerWidth <= 768;

    // === ЕСЛИ task-page + мобильное → скрываем ТОЛЬКО ЗДЕСЬ ===
    if (taskPage && isMobile) {
        // Скрываем ТОЛЬКО внутри .task-page
        taskPage.querySelectorAll('.curtain, .column, .hero-wrapper').forEach(el => {
            if (el) el.style.display = 'none';
        });
        // Анимация занавесов НЕ запускается
        return;
    }

    // === ДАЛЬШЕ: ГЛАВНАЯ, СПЕКТАКЛИ, ДРУГИЕ СТРАНИЦЫ ===
    // Проверяем, есть ли элементы для анимации занавесов
    const curtainLeft  = document.querySelector('.curtain-left');
    const curtainRight = document.querySelector('.curtain-right');
    const heroSection  = document.querySelector('.hero');

    // Если занавесов нет — пропускаем их анимацию (но не ломаем страницу!)
    if (curtainLeft && curtainRight && heroSection) {
        /* ---------- ПЕРЕМЕННЫЕ АНИМАЦИИ ---------- */
        let currentX = -80;
        let targetX  = -80;
        let inertiaX = -80;
        let animating = false;

        /* ---------- АНИМАЦИЯ С ИНЕРЦИЕЙ ---------- */
        const animateCurtains = () => {
            if (Math.abs(targetX - currentX) < 0.1 && Math.abs(inertiaX - currentX) < 0.1) {
                currentX = targetX;
                inertiaX = targetX;
                animating = false;
                return;
            }

            inertiaX += (targetX - inertiaX) * 0.08;
            currentX += (inertiaX - currentX) * 0.15;

            curtainLeft.style.transform  = `translateX(${currentX}%)`;
            curtainRight.style.transform = `translateX(${-currentX}%)`;

            requestAnimationFrame(animateCurtains);
        };

        const setTargetX = value => {
            if (Math.abs(targetX - value) > 0.1) {
                targetX = value;
                if (!animating) {
                    animating = true;
                    requestAnimationFrame(animateCurtains);
                }
            }
        };

        /* ---------- ИНИЦИАЛИЗАЦИЯ ---------- */
        const initCurtains = () => {
            currentX = targetX = inertiaX = -80;
            curtainLeft.style.transform  = 'translateX(-80%)';
            curtainRight.style.transform = 'translateX(80%)';
        };
        setTimeout(initCurtains, 100);

        /* ---------- SCROLL LOGIC ---------- */
        let ticking = false;

        const updateCurtains = () => {
            const rect = heroSection.getBoundingClientRect();
            const winH = window.innerHeight;
            const winW = window.innerWidth;
            const buffer = winW <= 768 ? winH * 0.8 : winH * 1.5;

            if (rect.top > -150 && rect.top < winH * 0.4) {
                setTargetX(-80);
                ticking = false;
                return;
            }

            if (rect.bottom > 0 && rect.top < buffer) {
                const progress = Math.max(0, Math.min(1, (winH - rect.top) / (winH + rect.height)));
                setTargetX(-80 + 80 * progress);
            } else if (rect.bottom <= 0) {
                setTargetX(0);
            }

            ticking = false;
        };

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateCurtains);
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', () => requestAnimationFrame(updateCurtains));
    }

    // === REVEAL АНИМАЦИИ (работают везде) ===
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    reveals.forEach(el => observer.observe(el));
});

/* ---------- КЛИК ПО КАРТОЧКЕ СПЕКТАКЛЯ ---------- */
document.querySelectorAll('.show-item').forEach(item => {
    item.addEventListener('click', () => {
        const slug = item.dataset.slug;
        window.location.href = `${slug}.html`;
    });
});

/* Кнопка "Купить билет" — остаётся, но без stopPropagation */
document.querySelectorAll('.buy-ticket').forEach(btn => {
    btn.addEventListener('click', e => {
        e.stopPropagation(); // ← Важно! Чтобы не сработал клик по карточке
        const slug = btn.closest('.show-item').dataset.slug;
        window.location.href = `${slug}.html`;
    });
});

/* ---------- ПЛАВНАЯ ПРОКРУТКА ПО ЯКОРЯМ ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.alt = 'Изображение не загружено';
            console.warn('Не удалось загрузить изображение:', this.src);
        });
    });
});

/* ---------- КАРУСЕЛЬ С ЭФФЕКТОМ FADE ---------- */
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const hero = document.querySelector('.play-hero');

    if (!carousel || !prevBtn || !nextBtn) return;

    const slides = carousel.querySelectorAll('img');
    const slideCount = slides.length;
    const slideDuration = 4000; // 4 секунды
    let currentSlide = 0;
    let timeout = null;

    // === Переход к слайду ===
    const goToSlide = (index) => {
        slides.forEach(slide => slide.classList.remove('active'));
        currentSlide = (index + slideCount) % slideCount;
        slides[currentSlide].classList.add('active');
    };

    const nextSlide = () => goToSlide(currentSlide + 1);
    const prevSlide = () => goToSlide(currentSlide - 1);

    // === Автопрокрутка через setTimeout (рекурсивная) ===
    const startAutoPlay = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            nextSlide();
            startAutoPlay(); // запускаем следующий цикл
        }, slideDuration);
    };

    // === Сброс таймера (после кнопки или наведения) ===
    const resetTimer = () => {
        clearTimeout(timeout);
        startAutoPlay();
    };

    // === Кнопки ===
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetTimer();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetTimer();
    });

    // === Пауза при наведении ===
    if (hero) {
        hero.addEventListener('mouseenter', () => clearTimeout(timeout));
        hero.addEventListener('mouseleave', resetTimer);
    }

    // === Инициализация ===
    goToSlide(0);
    startAutoPlay();
});

// Имитация hover по тапу
document.querySelectorAll('.flexbox-role').forEach(role => {
    role.addEventListener('touchstart', function() {
        this.classList.add('tapped');
    });

    role.addEventListener('touchend', function() {
        setTimeout(() => this.classList.remove('tapped'), 3000);
    });

    // Для мыши — оставляем :hover
    role.addEventListener('mouseenter', () => role.classList.add('tapped'));
    role.addEventListener('mouseleave', () => role.classList.remove('tapped'));
});
