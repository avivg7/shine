// SHINE — i18n Engine
(function () {
    var SUPPORTED = ['he', 'en', 'ru', 'ar', 'es', 'it', 'fr', 'de'];
    var DEFAULT_LANG = 'he';
    var STORAGE_KEY = 'shineLang';

    var LANG_LABELS = {
        he: 'עב', en: 'EN', ru: 'RU', ar: 'عر', es: 'ES', it: 'IT', fr: 'FR', de: 'DE'
    };

    // Country code → preferred language
    var COUNTRY_LANG = {
        IL: 'he',
        // English
        US: 'en', GB: 'en', AU: 'en', CA: 'en', NZ: 'en', IE: 'en', ZA: 'en', SG: 'en', IN: 'en',
        // Russian
        RU: 'ru', UA: 'ru', BY: 'ru', KZ: 'ru', UZ: 'ru', MD: 'ru',
        // Arabic
        SA: 'ar', AE: 'ar', EG: 'ar', IQ: 'ar', JO: 'ar', KW: 'ar', LB: 'ar',
        LY: 'ar', MA: 'ar', DZ: 'ar', TN: 'ar', YE: 'ar', OM: 'ar', QA: 'ar',
        BH: 'ar', SY: 'ar', PS: 'ar', SD: 'ar', MR: 'ar',
        // Spanish
        ES: 'es', MX: 'es', CO: 'es', PE: 'es', CL: 'es', AR: 'es', EC: 'es',
        VE: 'es', GT: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es', SV: 'es',
        NI: 'es', CR: 'es', PA: 'es', UY: 'es', GQ: 'es', CU: 'es',
        // Italian
        IT: 'it',
        // French
        FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr', SN: 'fr', CI: 'fr', CM: 'fr',
        // German
        DE: 'de', AT: 'de', LI: 'de', CH: 'de',
    };

    function getLangFromBrowser() {
        var navLangs = navigator.languages ? Array.from(navigator.languages) : [navigator.language || ''];
        for (var i = 0; i < navLangs.length; i++) {
            var code = navLangs[i].split('-')[0].toLowerCase();
            if (SUPPORTED.indexOf(code) !== -1) return code;
        }
        return null;
    }

    function detectLangFromIP() {
        return new Promise(function (resolve) {
            var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
            var timer = setTimeout(function () {
                if (controller) controller.abort();
                resolve(null);
            }, 3000);

            var opts = controller ? { signal: controller.signal } : {};
            fetch('https://api.country.is/', opts)
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    clearTimeout(timer);
                    var lang = data && data.country ? COUNTRY_LANG[data.country] || null : null;
                    resolve(lang);
                })
                .catch(function () {
                    clearTimeout(timer);
                    resolve(null);
                });
        });
    }

    function t(lang, key) {
        var T = window.TRANSLATIONS;
        if (!T) return null;
        if (T[lang] && T[lang][key] !== undefined) return T[lang][key];
        if (T['en'] && T['en'][key] !== undefined) return T['en'][key];
        if (T['he'] && T['he'][key] !== undefined) return T['he'][key];
        return null;
    }

    function applyLang(code, save) {
        var T = window.TRANSLATIONS;
        if (!T) return;
        var langData = T[code] || T[DEFAULT_LANG];

        document.documentElement.lang = langData.lang || code;
        document.documentElement.dir = langData.dir || 'rtl';
        if (save !== false) localStorage.setItem(STORAGE_KEY, code);

        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var val = t(code, el.getAttribute('data-i18n'));
            if (val !== null) el.textContent = val;
        });

        document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
            var val = t(code, el.getAttribute('data-i18n-html'));
            if (val !== null) el.innerHTML = val;
        });

        document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
            var raw = el.getAttribute('data-i18n-aria');
            raw.split(';').forEach(function (pair) {
                var idx = pair.indexOf(':');
                if (idx === -1) return;
                var attr = pair.slice(0, idx);
                var key  = pair.slice(idx + 1);
                var val  = t(code, key);
                if (val !== null) el.setAttribute(attr, val);
            });
        });

        var currentLabel = document.getElementById('lang-current-label');
        if (currentLabel) currentLabel.textContent = LANG_LABELS[code] || code.toUpperCase();

        document.querySelectorAll('.lang-btn').forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === code);
        });

        window._shineLang = code;
    }

    window.applyLang = applyLang;

    document.addEventListener('DOMContentLoaded', function () {
        // 1. localStorage — apply immediately if set
        var saved = localStorage.getItem(STORAGE_KEY);
        if (saved && SUPPORTED.indexOf(saved) !== -1) {
            applyLang(saved, false);
            wireButtons();
            return;
        }

        // Apply a temporary language while we wait for IP detection:
        // use browser language or default so the page isn't stuck in Hebrew if JS is slow
        var browserLang = getLangFromBrowser();
        applyLang(browserLang || DEFAULT_LANG, false);
        wireButtons();

        // 2. IP geolocation (async, result saved to localStorage)
        detectLangFromIP().then(function (ipLang) {
            if (ipLang && SUPPORTED.indexOf(ipLang) !== -1) {
                applyLang(ipLang, true);
            } else {
                // 3. Browser language
                var bl = getLangFromBrowser();
                if (bl) {
                    applyLang(bl, true);
                } else {
                    // 4. Default
                    applyLang(DEFAULT_LANG, true);
                }
            }
        });
    });

    function wireButtons() {
        var toggleBtn = document.getElementById('lang-toggle-btn');
        var dropdown  = document.getElementById('lang-dropdown');

        if (toggleBtn && dropdown) {
            toggleBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                var isOpen = dropdown.classList.contains('open');
                dropdown.classList.toggle('open', !isOpen);
                toggleBtn.setAttribute('aria-expanded', String(!isOpen));
            });

            document.addEventListener('click', function () {
                dropdown.classList.remove('open');
                if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
            });

            dropdown.addEventListener('click', function (e) {
                e.stopPropagation();
            });
        }

        document.querySelectorAll('.lang-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                applyLang(btn.getAttribute('data-lang'), true);
                if (dropdown) dropdown.classList.remove('open');
                if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }
})();
