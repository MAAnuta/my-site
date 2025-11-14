document.addEventListener('DOMContentLoaded', () => {
    const isTaskPage = document.body.classList.contains('task-page') ||
        document.querySelector('.task-page');
    const isMobile = window.innerWidth <= 768;

    if (isTaskPage && isMobile) {
        const curtains = document.querySelectorAll('.curtain');
        const columns = document.querySelectorAll('.column');
        const heroWrapper = document.querySelector('.hero-wrapper');

        curtains.forEach(c => c.style.display = 'none');
        columns.forEach(c => c.style.display = 'none');
        if (heroWrapper) heroWrapper.style.display = 'none';
    }

    const curtainLeft = document.querySelector('.curtain-left');
    const curtainRight = document.querySelector('.curtain-right');
    const heroSection = document.querySelector('.hero');
    const reveals = document.querySelectorAll('.reveal');

    let currentX = -80;
    let targetX  = 0;
    let inertiaX = 0;
    let animating = false;
    let lastScrollY = 0;

    const animateCurtains = () => {
        if (Math.abs(targetX - currentX) < 0.1 && Math.abs(inertiaX - currentX) < 0.1) {
            currentX = targetX;
            inertiaX = targetX;
            animating = false;
            return;
        }

        inertiaX += (targetX - inertiaX) * 0.08;
        currentX += (inertiaX - currentX) * 0.08;

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

    const initCurtains = () => {
        currentX = -80;
        targetX = 0;
        inertiaX = 0;
        curtainLeft.style.transform  = 'translateX(-80%)';
        curtainRight.style.transform = 'translateX(80%)';
    };
    setTimeout(initCurtains, 100);

    let ticking = false;

    const updateCurtains = () => {
        // позиция и размеры hero-секции относительно видимой области
        const rect = heroSection.getBoundingClientRect();
        const winH = window.innerHeight; // высота видимой области браузера
        const winW = window.innerWidth; // ширина видимой области браузера
        // расчет области, в которой будет проходить анимация закрытия занавеса
        const buffer = winW <= 768 ? winH * 0.8 : winH * 1.5;

        if (rect.top > -150 && rect.top < winH * 0.4) {
            setTargetX(-80);
            ticking = false;
            return;
        }

        if (rect.bottom > 0 && rect.top < buffer) {
            const progress = Math.max(0, Math.min(1,
                (winH - rect.top) / (winH + rect.height)
            ));
            const newTarget = -80 + 80 * progress;
            setTargetX(newTarget);
        }

        else if (rect.bottom <= 0) {
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
    window.addEventListener('resize', () => {
        lastScrollY = window.scrollY;
        requestAnimationFrame(updateCurtains);
    });

    // для плавного появления блоков сайта
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });

    reveals.forEach(el => observer.observe(el));
});

document.querySelectorAll('.show-item').forEach(item => {
    item.addEventListener('click', () => {
        const slug = item.dataset.slug;
        window.location.href = `${slug}.html`;
    });
});

document.querySelectorAll('.buy-ticket').forEach(btn => {
    btn.addEventListener('click',() => {
        const slug = btn.closest('.show-item').dataset.slug;
        window.location.href = `${slug}.html`;
    });
});

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

document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');

    if (!carousel || !prevBtn || !nextBtn) return;

    const slides = carousel.querySelectorAll('img');
    const slideCount = slides.length;
    const slideDuration = 4000; // 4 секунды
    let currentSlide = 0;
    let timeout = null;

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
            startAutoPlay();
        }, slideDuration);
    };
    // после ручного клика
    const resetTimer = () => {
        clearTimeout(timeout);
        startAutoPlay();
    };

    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetTimer();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetTimer();
    });

    goToSlide(0);
    startAutoPlay();
});

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

document.addEventListener('DOMContentLoaded', () => {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            const accordionContent = header.nextElementSibling;
            const isActive = accordionItem.classList.contains('active');

            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.accordion-content').classList.remove('active');
                item.querySelector('.accordion-header').classList.remove('active');
            });

            if (!isActive) {
                accordionItem.classList.add('active');
                accordionContent.classList.add('active');
                header.classList.add('active');
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    function initVideoModal() {
        const title = document.querySelector('.hero-text h1');
        const modal = document.getElementById('videoModal');
        const closeBtn = document.querySelector('.close');
        const iframe = document.getElementById('videoIframe');

        if (!title || !modal || !iframe) return;

        const originalSrc = iframe.src;
        iframe.src = originalSrc.replace(/([?&])autoplay=1(&|$)/, '$1').replace(/[?&]$/, '');

        title.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);
        window.addEventListener('click', handleOutsideClick);
        document.addEventListener('keydown', handleEscape);

        function openModal() {
            let currentSrc = iframe.src;
            if (!currentSrc.includes('autoplay=1')) {
                const separator = currentSrc.includes('?') ? '&' : '?';
                iframe.src = currentSrc + separator + 'autoplay=1';
            }

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }

        function closeModal() {
            modal.classList.remove('show');
            modal.addEventListener('transitionend', handleTransitionEnd, { once: true });
        }

        function handleTransitionEnd() {
            modal.style.display = 'none';
            document.body.style.overflow = '';

            let currentSrc = iframe.src;
            iframe.src = currentSrc.replace(/([?&])autoplay=1(&|$)/, '$1').replace(/[?&]$/, '');
        }

        function handleOutsideClick(event) {
            if (event.target === modal) {
                closeModal();
            }
        }

        function handleEscape(e) {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
            }
        }
    }
    initVideoModal();
});

document.addEventListener('DOMContentLoaded', () => {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('touchend', (e) => {
            e.preventDefault();
            header.click(); // имитация клика
        });
    });
});

// Гамбургер-меню
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const menuClose = document.querySelector('.menu-close');
const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

if (menuToggle && navMenu && menuClose) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    menuClose.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
    });

    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
}

// Управление выпадающим подменю
dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const dropdown = toggle.parentElement;
        const isActive = dropdown.classList.contains('active');
        document.querySelectorAll('.dropdown').forEach(item => {
            item.classList.remove('active');
            const menu = item.querySelector('.dropdown-menu');
            if (menu) menu.style.display = 'none';
        });
        if (!isActive) {
            dropdown.classList.add('active');
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) menu.style.display = 'block';
        }
    });
});
