document.addEventListener('DOMContentLoaded', () => {
    const isTaskPage = document.body.classList.contains('task-page') ||
        document.querySelector('.task-page');
    const isMobile = window.innerWidth <= 768;

    // Если это страница задания И мобильное устройство — отключаем занавесы
    if (isTaskPage && isMobile) {
        const curtains = document.querySelectorAll('.curtain');
        const columns = document.querySelectorAll('.column');
        const heroWrapper = document.querySelector('.hero-wrapper');

        curtains.forEach(c => c.style.display = 'none');
        columns.forEach(c => c.style.display = 'none');
        if (heroWrapper) heroWrapper.style.display = 'none';

        // Отключаем scroll-событие для занавесов
        window.removeEventListener('scroll', handleScroll);
        return; // Прерываем инициализацию анимации
    }
    /* ---------- ELEMENTS ---------- */
    const curtainLeft  = document.querySelector('.curtain-left');
    const curtainRight = document.querySelector('.curtain-right');
    const heroSection  = document.querySelector('.hero');
    const reveals      = document.querySelectorAll('.reveal');

    /* ---------- ПЛАВНЫЙ Занавес с ИНЕРЦИЕЙ ---------- */
    /* ---------- ПЕРЕМЕННЫЕ ---------- */
    let currentX = -80;
    let targetX  = -80;
    let inertiaX = -80;
    let animating = false;
    let lastScrollY = 0;

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
        currentX = -80;
        targetX = -80;
        inertiaX = -80;
        curtainLeft.style.transform  = 'translateX(-80%)';
        curtainRight.style.transform = 'translateX(80%)';
    };
    setTimeout(initCurtains, 100);

    /* ---------- SCROLL LOGIC — ПОЛНОЕ ЗАКРЫТИЕ + ТОЧНОЕ ВОЗВРАЩЕНИЕ ---------- */
    let ticking = false;

    const updateCurtains = () => {
        const rect = heroSection.getBoundingClientRect();
        const winH = window.innerHeight;
        const winW = window.innerWidth;

        const buffer = winW <= 768 ? winH * 0.8 : winH * 1.5;

        // === 1. ВОЗВРАТ В НАЧАЛЬНОЕ СОСТОЯНИЕ (ТОЧНО -80%) ===
        if (rect.top > -150 && rect.top < winH * 0.4) {
            setTargetX(-80); // ← ТОЧНОЕ ПОЛОЖЕНИЕ, КАК ПРИ ЗАГРУЗКЕ
            ticking = false;
            return;
        }

        // === 2. В ЗОНЕ ВИДИМОСТИ — ПЛАВНО ЗАКРЫВАТЬ ДО ПОЛНОГО ЗАКРЫТИЯ ===
        if (rect.bottom > 0 && rect.top < buffer) {
            const progress = Math.max(0, Math.min(1,
                (winH - rect.top) / (winH + rect.height)
            ));
            const newTarget = -80 + 80 * progress; // от -80% до 0%
            setTargetX(newTarget);
        }
        // === 3. СЕКЦИЯ УШЛА ВВЕРХ — ПОЛНОСТЬЮ ЗАКРЫТЬ ===
        else if (rect.bottom <= 0) {
            setTargetX(0); // ← ПОЛНОСТЬЮ ЗАКРЫТ
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
    window.addEventListener('resize', () => {
        lastScrollY = window.scrollY;
        requestAnimationFrame(updateCurtains);
    });

    /* ---------- REVEAL АНИМАЦИИ ---------- */
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
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

    role.addEventListener('mouseenter', () => role.classList.add('tapped'));
    role.addEventListener('mouseleave', () => role.classList.remove('tapped'));
});

/* ---------- АККОРДЕОН ---------- */
document.addEventListener('DOMContentLoaded', () => {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            const accordionContent = header.nextElementSibling;
            const isActive = accordionItem.classList.contains('active');

            // Закрываем все открытые секции
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.accordion-content').classList.remove('active');
                item.querySelector('.accordion-header').classList.remove('active');
            });

            // Открываем или закрываем текущую секцию
            if (!isActive) {
                accordionItem.classList.add('active');
                accordionContent.classList.add('active');
                header.classList.add('active');
            }
        });
    });
});

/* ---------- МОДАЛЬНОЕ ОКНО ДЛЯ ВИДЕО ---------- */
document.addEventListener('DOMContentLoaded', () => {
    const title = document.querySelector('.hero-text h1');
    const modal = document.getElementById('videoModal');
    const closeBtn = document.querySelector('.close');
    const iframe = document.getElementById('videoIframe');

    if (title && modal) {
        title.addEventListener('click', () => {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        });

        closeBtn.addEventListener('click', closeModal);

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
            }
        });

        function closeModal() {
            modal.classList.remove('show');
            modal.addEventListener('transitionend', handleTransitionEnd, { once: true });
        }

        function handleTransitionEnd() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            const currentSrc = iframe.src;
            iframe.src = '';
            setTimeout(() => {
                iframe.src = currentSrc;
            }, 100);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Оптимизация карусели для мобильных
    const carousel = document.querySelector('.carousel');
    if (carousel && window.innerWidth <= 768) {
        // Увеличиваем интервал между слайдами на мобильных
        const slideDuration = 5000; // 5 секунд вместо 4
        // Остальной код карусели остается без изменений
    }

    // Оптимизация аккордеона для сенсорных устройств
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        // Добавляем обработчик для touch устройств
        header.addEventListener('touchend', (e) => {
            e.preventDefault();
            header.click();
        });
    });
});
