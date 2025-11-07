document.addEventListener('DOMContentLoaded', () => {
    // Проверка на task-page для мобильных
    const isTaskPage = document.body.classList.contains('task-page') || document.querySelector('.task-page');
    const isMobile = window.innerWidth <= 768;

    if (isTaskPage && isMobile) {
        const curtains = document.querySelectorAll('.curtain');
        const columns = document.querySelectorAll('.column');
        const heroWrapper = document.querySelector('.hero-wrapper');

        curtains.forEach(c => c.style.display = 'none');
        columns.forEach(c => c.style.display = 'none');
        if (heroWrapper) heroWrapper.style.display = 'none';

        window.removeEventListener('scroll', handleScroll);
        return;
    }

    // Управление шторами
    const curtainLeft = document.querySelector('.curtain-left');
    const curtainRight = document.querySelector('.curtain-right');
    const heroSection = document.querySelector('.hero');
    const reveals = document.querySelectorAll('.reveal');

    if (curtainLeft && curtainRight && heroSection) {
        let currentX = -80;
        let targetX = -80;
        let inertiaX = -80;
        let animating = false;

        const animateCurtains = () => {
            if (Math.abs(targetX - currentX) < 0.1 && Math.abs(inertiaX - currentX) < 0.1) {
                currentX = targetX;
                inertiaX = targetX;
                animating = false;
                return;
            }

            inertiaX += (targetX - inertiaX) * 0.08;
            currentX += (inertiaX - currentX) * 0.15;

            curtainLeft.style.transform = `translateX(${currentX}%)`;
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
            targetX = -80;
            inertiaX = -80;
            curtainLeft.style.transform = 'translateX(-80%)';
            curtainRight.style.transform = 'translateX(80%)';
        };
        setTimeout(initCurtains, 100);

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
                const newTarget = -80 + 80 * progress;
                setTargetX(newTarget);
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
        window.addEventListener('resize', () => {
            lastScrollY = window.scrollY;
            requestAnimationFrame(updateCurtains);
        });
    }

    // Intersection Observer для .reveal
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });

    reveals.forEach(el => observer.observe(el));

    // Обработка кликов по .show-item
    document.querySelectorAll('.show-item').forEach(item => {
        item.addEventListener('click', () => {
            const slug = item.dataset.slug;
            window.location.href = `${slug}.html`;
        });
    });

    // Обработка кликов по .buy-ticket
    document.querySelectorAll('.buy-ticket').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const slug = btn.closest('.show-item').dataset.slug;
            window.location.href = `${slug}.html`;
        });
    });

    // Плавная прокрутка для якорей
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

    // Обработка ошибок загрузки изображений
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', () => {
            console.error('Не удалось загрузить изображение:', img.src);
        });
    });

    // Карусель
    const carousel = document.querySelector('.carousel');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const hero = document.querySelector('.play-hero');

    if (carousel && prevBtn && nextBtn) {
        const slides = carousel.querySelectorAll('img');
        const slideCount = slides.length;
        const slideDuration = window.matchMedia("(max-width: 768px)").matches ? 5000 : 4000;
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

        if (hero) {
            hero.addEventListener('mouseenter', () => clearTimeout(timeout));
            hero.addEventListener('mouseleave', resetTimer);
        }

        goToSlide(0);
        startAutoPlay();
    }

    // Аккордеон
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

        header.addEventListener('touchend', e => {
            if (header.contains(e.target)) {
                e.preventDefault();
                header.click();
            }
        });
    });

    // Гамбургер-меню
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const menuClose = document.querySelector('.menu-close');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    if (menuToggle && navMenu && menuClose) {
        const toggleMenu = () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        };

        menuToggle.addEventListener('click', e => {
            e.stopPropagation();
            toggleMenu();
        });

        menuClose.addEventListener('click', e => {
            e.stopPropagation();
            toggleMenu();
        });

        document.addEventListener('click', e => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                toggleMenu();
            }
        });

        // Закрытие меню при клике на ссылки
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggleMenu();
            });
        });

        // Управление выпадающим подменю
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', e => {
                if (window.innerWidth <= 768) {
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
                }
            });
        });

        // Закрытие меню при смене на десктоп
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
                document.querySelectorAll('.dropdown').forEach(item => {
                    item.classList.remove('active');
                    const menu = item.querySelector('.dropdown-menu');
                    if (menu) menu.style.display = '';
                });
            }
        });
    }

    // Модальное окно видео
    const initVideoModal = () => {
        const title = document.querySelector('.hero-text h1');
        const modal = document.getElementById('videoModal');
        const closeBtn = document.querySelector('.close');
        const iframe = document.getElementById('videoIframe');

        if (!title || !modal || !closeBtn || !iframe) {
            console.warn('Отсутствуют элементы для модального окна видео');
            return;
        }

        const originalSrc = iframe.src;
        const cleanSrc = originalSrc.replace(/([?&])autoplay=1(&|$)/, '$1').replace(/[?&]$/, '');
        iframe.src = cleanSrc;

        const openModal = () => {
            let currentSrc = iframe.src;
            if (!currentSrc.includes('autoplay=1')) {
                const separator = currentSrc.includes('?') ? '&' : '?';
                iframe.src = currentSrc + separator + 'autoplay=1';
            }

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            setTimeout(() => modal.classList.add('show'), 10);
        };

        const closeModal = () => {
            modal.classList.remove('show');
            modal.addEventListener('transitionend', handleTransitionEnd, { once: true });
        };

        const handleTransitionEnd = () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            iframe.src = cleanSrc;
        };

        const handleOutsideClick = event => {
            if (event.target === modal) {
                closeModal();
            }
        };

        const handleEscape = e => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
            }
        };

        title.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);
        window.addEventListener('click', handleOutsideClick);
        document.addEventListener('keydown', handleEscape);
    };

    initVideoModal();
});