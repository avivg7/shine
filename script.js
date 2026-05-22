// ===============================================
// SHINE — Main JavaScript
// ===============================================
document.addEventListener('DOMContentLoaded', function() {

    // ===============================================
    // תפריט נגישות
    // ===============================================
    const accessibilityToggle = document.getElementById('accessibility-toggle');
    const accessibilityOptions = document.getElementById('accessibility-options');
    const accessibilityButtons = document.querySelectorAll('.accessibility-btn');
    const root = document.documentElement;
    let currentFontScale = 1;

    loadAccessibilitySettings();

    accessibilityToggle.addEventListener('click', function() {
        const isExpanded = accessibilityToggle.getAttribute('aria-expanded') === 'true';
        accessibilityToggle.setAttribute('aria-expanded', !isExpanded);
        accessibilityOptions.classList.toggle('active');
        accessibilityOptions.setAttribute('aria-hidden', isExpanded);
    });

    document.addEventListener('click', function(event) {
        if (!event.target.closest('.accessibility-menu')) {
            accessibilityOptions.classList.remove('active');
            accessibilityToggle.setAttribute('aria-expanded', 'false');
            accessibilityOptions.setAttribute('aria-hidden', 'true');
        }
    });

    accessibilityButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            switch(action) {
                case 'increase-font':   increaseFontSize(); break;
                case 'decrease-font':   decreaseFontSize(); break;
                case 'high-contrast':   toggleHighContrast(); break;
                case 'reset':           resetAccessibility(); break;
            }
        });
    });

    function increaseFontSize() {
        if (currentFontScale < 1.5) {
            currentFontScale = Math.round((currentFontScale + 0.1) * 10) / 10;
            root.style.setProperty('--font-size-scale', currentFontScale);
            saveAccessibilitySettings();
            announceToScreenReader('גופן הוגדל');
        }
    }

    function decreaseFontSize() {
        if (currentFontScale > 0.8) {
            currentFontScale = Math.round((currentFontScale - 0.1) * 10) / 10;
            root.style.setProperty('--font-size-scale', currentFontScale);
            saveAccessibilitySettings();
            announceToScreenReader('גופן הוקטן');
        }
    }

    function toggleHighContrast() {
        document.body.classList.toggle('high-contrast');
        const isHighContrast = document.body.classList.contains('high-contrast');
        saveAccessibilitySettings();
        announceToScreenReader(isHighContrast ? 'ניגודיות גבוהה הופעלה' : 'ניגודיות גבוהה בוטלה');
    }

    function resetAccessibility() {
        currentFontScale = 1;
        root.style.setProperty('--font-size-scale', 1);
        document.body.classList.remove('high-contrast');
        localStorage.removeItem('accessibilitySettings');
        announceToScreenReader('הגדרות נגישות אופסו');
    }

    function saveAccessibilitySettings() {
        const settings = {
            fontScale: currentFontScale,
            highContrast: document.body.classList.contains('high-contrast')
        };
        localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    }

    function loadAccessibilitySettings() {
        const savedSettings = localStorage.getItem('accessibilitySettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            currentFontScale = settings.fontScale || 1;
            root.style.setProperty('--font-size-scale', currentFontScale);
            if (settings.highContrast) {
                document.body.classList.add('high-contrast');
            }
        }
    }

    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        setTimeout(() => { document.body.removeChild(announcement); }, 1000);
    }

    // ===============================================
    // תפריט ניווט נייד
    // ===============================================
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('active');

            const hamburgers = mobileMenuToggle.querySelectorAll('.hamburger');
            if (navLinks.classList.contains('active')) {
                hamburgers[0].style.transform = 'rotate(45deg) translateY(7px)';
                hamburgers[1].style.opacity = '0';
                hamburgers[2].style.transform = 'rotate(-45deg) translateY(-7px)';
            } else {
                hamburgers[0].style.transform = 'none';
                hamburgers[1].style.opacity = '1';
                hamburgers[2].style.transform = 'none';
            }
        });

        const navLinksItems = navLinks.querySelectorAll('a');
        navLinksItems.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                const hamburgers = mobileMenuToggle.querySelectorAll('.hamburger');
                hamburgers[0].style.transform = 'none';
                hamburgers[1].style.opacity = '1';
                hamburgers[2].style.transform = 'none';
            });
        });
    }

    // ===============================================
    // גלילה חלקה לעוגנים
    // ===============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = target.offsetTop - navbarHeight - 20;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            }
        });
    });

    // ===============================================
    // Navbar scroll shrink
    // ===============================================
    const navbar = document.querySelector('.navbar');

    let navbarScrolled = false;
    let navbarRaf = null;
    window.addEventListener('scroll', function() {
        if (navbarRaf) return;
        navbarRaf = requestAnimationFrame(function() {
            navbarRaf = null;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (!navbarScrolled && scrollTop > 100) {
                navbarScrolled = true;
                navbar.classList.add('navbar-scrolled');
            } else if (navbarScrolled && scrollTop < 15) {
                navbarScrolled = false;
                navbar.classList.remove('navbar-scrolled');
            }
        });
    });

    // ===============================================
    // Scroll-in animations (Intersection Observer)
    // ===============================================
    const observerOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));

    // ===============================================
    // Keyboard navigation support
    // ===============================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (accessibilityOptions.classList.contains('active')) {
                accessibilityOptions.classList.remove('active');
                accessibilityToggle.setAttribute('aria-expanded', 'false');
                accessibilityOptions.setAttribute('aria-hidden', 'true');
                accessibilityToggle.focus();
            }
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (mobileMenuToggle) {
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    const hamburgers = mobileMenuToggle.querySelectorAll('.hamburger');
                    hamburgers[0].style.transform = 'none';
                    hamburgers[1].style.opacity = '1';
                    hamburgers[2].style.transform = 'none';
                }
            }
        }
    });

    // ===============================================
    // Screen reader helper style
    // ===============================================
    const srStyle = document.createElement('style');
    srStyle.textContent = `.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0;}`;
    document.head.appendChild(srStyle);

    console.log('SHINE — נטען בהצלחה');

    // ── Portfolio Load More ──
    const loadMoreBtn = document.getElementById('portfolio-load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function () {
            document.querySelectorAll('.portfolio-extra').forEach(function (item) {
                item.style.display = '';
                item.classList.remove('portfolio-extra');
            });
            loadMoreBtn.closest('.portfolio-load-more-wrap').style.display = 'none';
        });
    }

    // ── Audience Accordion ──
    document.querySelectorAll('.audience-header').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const item = btn.closest('.audience-item');
            const isOpen = item.classList.contains('open');
            // close all
            document.querySelectorAll('.audience-item.open').forEach(function (el) {
                el.classList.remove('open');
                el.querySelector('.audience-header').setAttribute('aria-expanded', 'false');
            });
            // open clicked (unless it was already open)
            if (!isOpen) {
                item.classList.add('open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });
});

// ===============================================
// Portfolio Project Modal
// ===============================================
const PROJECTS = {
    a: {
        title: 'תיעוד לחברת ביטוח',
        images: [
            './images/projects/a_pic1.jpg',
            './images/projects/a_pic2.jpg',
        ],
        videoId: 'bpcFJ_7AXOI',
    },
    b: {
        title: 'סיור וירטואלי ומדידה לשיפוץ גינה',
        images: [
            './images/projects/b_pic1.jpg',
            './images/projects/b_pic2.jpg',
            './images/projects/b_pic3.jpg',
            './images/projects/b_pic4.jpg',
            './images/projects/b_pic5.jpg',
        ],
        videoId: 'Zz3dVQOJLpE',
    },
    c: {
        title: 'סיור וירטואלי ומדידה לדירת גג',
        images: [
            './images/projects/c_pic1.jpg',
            './images/projects/c_pic2.jpg',
            './images/projects/c_pic3.jpg',
            './images/projects/c_pic4.jpg',
            './images/projects/c_pic5.jpg',
        ],
        videoId: 'rIWB_cBPuK8',
    },
    d: {
        title: 'סיור וירטואלי ומדידה לפני שיפוץ בית קרקע',
        images: [
            './images/projects/d_pic1.jpg',
            './images/projects/d_pic2.jpg',
            './images/projects/d_pic3.jpg',
            './images/projects/d_pic4.jpg',
            './images/projects/d_pic5.jpg',
        ],
        videoId: 'zfyEY8mB9Fw',
    },
    e: {
        title: 'בית פרטי לשיפוץ במעלה אדומים',
        images: [
            './images/projects/e_pic1.jpg',
            './images/projects/e_pic2.jpg',
            './images/projects/e_pic3.jpg',
            './images/projects/e_pic4.jpg',
        ],
        videoId: null,
    },
    f: {
        title: 'בית למכירה בתל אביב',
        images: [
            './images/projects/f_pic1.jpg',
            './images/projects/f_pic2.jpg',
        ],
        videoId: 'CFJvgAg9WMM',
    },
    g: {
        title: 'דירה לשיפוץ בפתח תקווה',
        images: [
            './images/projects/g_pic1.jpg',
            './images/projects/g_pic2.jpg',
            './images/projects/g_pic3.jpg',
        ],
        videoId: null,
    },
    h: {
        title: 'בית לשיפוץ בכפר יונה',
        images: [
            './images/projects/h_pic1.jpg',
            './images/projects/h_pic2.jpg',
            './images/projects/h_pic3.jpg',
            './images/projects/h_pic4.jpg',
        ],
        videoId: null,
    },
    i: {
        title: 'דירת גג לשיפוץ',
        images: [
            './images/projects/i_pic1.jpg',
            './images/projects/i_pic2.jpg',
            './images/projects/i_pic3.jpg',
            './images/projects/i_pic4.jpg',
        ],
        videoId: null,
    },
};

function openProject(id) {
    const project = PROJECTS[id];
    if (!project) return;

    document.getElementById('modal-title').textContent = project.title;

    const imagesEl = document.getElementById('modal-images');
    imagesEl.innerHTML = project.images
        .map((src, i) => `<img src="${src}" alt="${project.title}" class="modal-img" loading="lazy" data-index="${i}" tabindex="0">`)
        .join('');

    const videoWrap = document.querySelector('.modal-video-wrap');
    if (project.videoId) {
        document.getElementById('modal-video').src = `https://www.youtube.com/embed/${project.videoId}`;
        videoWrap.style.display = '';
    } else {
        document.getElementById('modal-video').src = '';
        videoWrap.style.display = 'none';
    }

    const modal = document.getElementById('project-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.getElementById('modal-close-btn').focus();
}

function closeProject() {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('active');
    document.getElementById('modal-video').src = '';
    document.body.style.overflow = '';
}

// ===============================================
// Image Lightbox
// ===============================================
let lightboxImages = [];
let lightboxIndex  = 0;

function openLightbox(images, index) {
    lightboxImages = images;
    lightboxIndex  = index;
    renderLightbox();
    document.getElementById('lightbox').classList.add('active');
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    lightboxImages = [];
}

function renderLightbox() {
    document.getElementById('lightbox-img').src = lightboxImages[lightboxIndex];
    document.getElementById('lightbox-counter').textContent =
        (lightboxIndex + 1) + ' / ' + lightboxImages.length;
}

function lightboxPrev() {
    lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    renderLightbox();
}

function lightboxNext() {
    lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
    renderLightbox();
}

document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    document.getElementById('modal-close-btn').addEventListener('click', closeProject);
    document.getElementById('modal-backdrop').addEventListener('click', closeProject);

    // Lightbox controls
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-backdrop').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-prev').addEventListener('click', lightboxPrev);
    document.getElementById('lightbox-next').addEventListener('click', lightboxNext);

    // Clicks on modal images → open lightbox
    document.getElementById('modal-images').addEventListener('click', function (e) {
        const img = e.target.closest('.modal-img');
        if (!img) return;
        const index  = parseInt(img.getAttribute('data-index'), 10);
        const images = Array.from(document.querySelectorAll('#modal-images .modal-img'))
                            .map(el => el.src);
        openLightbox(images, index);
    });

    document.addEventListener('keydown', function (e) {
        const lightbox = document.getElementById('lightbox');

        if (lightbox.classList.contains('active')) {
            if (e.key === 'Escape')      closeLightbox();
            if (e.key === 'ArrowRight')  lightboxPrev();
            if (e.key === 'ArrowLeft')   lightboxNext();
            return;
        }

        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeProject();
        }
    });

    // Keyboard support for portfolio cards
    document.querySelectorAll('.portfolio-item[tabindex="0"]').forEach(function (card) {
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
});
