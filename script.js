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

        window.removeEventListener('scroll', handleScroll);
        return;
    }

    const curtainLeft  = document.querySelector('.curtain-left');
    const curtainRight = document.querySelector('.curtain-right');
    const heroSection  = document.querySelector('.hero');
    const reveals      = document.querySelectorAll('.reveal');

    let currentX = -80;
    let targetX  = -80;
    let inertiaX = -80;
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

    const initCurtains = () => {
        currentX = -80;
        targetX = -80;
        inertiaX = -80;
        curtainLeft.style.transform  = 'translateX(-80%)';
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
    btn.addEventListener('click', e => {
        e.stopPropagation();
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

        header.addEventListener('touchend', (e) => {
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
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        menuClose.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        });

        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                menuToggle.classList.toggle('active');
            }
        });
    }

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
});

