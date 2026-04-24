const translations = {
    vi: {
        currentLang: 'Tiếng Việt',
        pageTitle: 'Retro Movie Hub',
        headerLogoAlt: 'Logo của Retro Movie Hub',
        searchPlaceholder: 'Nhập tên phim...',
        movieTheater: 'Phim Chiếu Rạp',
        series: 'Phim Bộ',
        movieSingle: 'Phim Lẻ',
        genre: 'Thể Loại',
        country: 'Quốc Gia',
        login: 'Đăng nhập',
        noRecommendations: 'Không tìm thấy phim hoặc không có gợi ý',
        watchNow: 'XEM NGAY',
        genresPrefix: 'Thể loại: ',
        langEnglish: 'English',
        langKorean: 'Tiếng Hàn',
        langJapanese: 'Tiếng Nhật',
        langChinese: 'Tiếng Trung',
        langVietnamese: 'Tiếng Việt',
        NewestMovies: 'Phim mới nhất'
    },
    en: {
        currentLang: 'English',
        pageTitle: 'Retro Movie Hub',
        headerLogoAlt: 'Retro Movie Hub Logo',
        searchPlaceholder: 'Enter movie name...',
        movieTheater: 'Now Showing',
        series: 'Series',
        movieSingle: 'Movie',
        genre: 'Genre',
        country: 'Country',
        login: 'Login',
        noRecommendations: 'No movie found or no recommendations',
        watchNow: 'WATCH NOW',
        genresPrefix: 'Genres: ',
        langEnglish: 'English',
        langKorean: 'Korean',
        langJapanese: 'Japanese',
        langChinese: 'Chinese',
        langVietnamese: 'Vietnamese',
        NewestMovies: 'Newest Movies'
    },
    ko: {
        currentLang: 'Tiếng Hàn',
        pageTitle: 'Retro Movie Hub',
        headerLogoAlt: 'Retro Movie Hub 로고',
        searchPlaceholder: '영화 제목을 입력하세요...',
        movieTheater: '상영 중',
        series: '시리즈',
        movieSingle: '영화',
        genre: '장르',
        country: '국가',
        login: '로그인',
        noRecommendations: '영화를 찾을 수 없거나 추천이 없습니다',
        watchNow: '지금 보기',
        genresPrefix: '장르: ',
        langEnglish: '영어',
        langKorean: '한국어',
        langJapanese: '일본어',
        langChinese: '중국어',
        langVietnamese: '베트남어',
        NewestMovies: '최신 영화'
    },
    ja: {
        currentLang: 'Tiếng Nhật',
        pageTitle: 'Retro Movie Hub',
        headerLogoAlt: 'Retro Movie Hub ロゴ',
        searchPlaceholder: '映画タイトルを入力してください...',
        movieTheater: '上映中',
        series: 'シリーズ',
        movieSingle: '映画',
        genre: 'ジャンル',
        country: '国',
        login: 'ログイン',
        noRecommendations: '映画が見つからないか、おすすめがありません',
        watchNow: '今すぐ見る',
        genresPrefix: 'ジャンル: ',
        langEnglish: '英語',
        langKorean: '韓国語',
        langJapanese: '日本語',
        langChinese: '中国語',
        langVietnamese: 'ベトナム語',
        NewestMovies: '최신 영화'
    },
    zh: {
        currentLang: 'Tiếng Trung',
        pageTitle: 'Retro Movie Hub',
        headerLogoAlt: 'Retro Movie Hub 标志',
        searchPlaceholder: '请输入电影名称...',
        movieTheater: '正在上映',
        series: '系列',
        movieSingle: '电影',
        genre: '类型',
        country: '国家',
        login: '登录',
        noRecommendations: '未找到电影或没有推荐',
        watchNow: '立即观看',
        genresPrefix: '类型: ',
        langEnglish: '英文',
        langKorean: '韩文',
        langJapanese: '日文',
        langChinese: '中文',
        langVietnamese: '越南文',
        NewestMovies: '最新电影'
    }
};

function translatePage(langCode) {
    const strings = translations[langCode] || translations.vi;

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key in strings) {
            element.innerText = strings[key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (key in strings) {
            element.setAttribute('placeholder', strings[key]);
        }
    });

    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
        const key = element.getAttribute('data-i18n-alt');
        if (key in strings) {
            element.setAttribute('alt', strings[key]);
        }
    });

    document.title = strings.pageTitle;

    const display = document.getElementById('display-lang');
    if (display) {
        display.innerText = strings.currentLang;
    }

    document.querySelectorAll('.lang-dropdown li').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key && key in strings) {
            element.innerText = strings[key];
        }
    });
}

/*----------------------------RECOMMENDATION----------------------------*/

function getRec() {
    let movie = document.getElementById('movie').value;
    let currentLang = localStorage.getItem('preferredLang') || document.documentElement.lang || 'vi';
    let strings = translations[currentLang] || translations.vi;

    fetch(`/recommend?movie=${encodeURIComponent(movie)}`)
        .then(res => res.json())
        .then(data => {
            let container = document.getElementById('result');
            container.innerHTML = '';

            let genreBox = document.getElementById('genres');


            const searchTitle = movie && movie.trim() ? movie.trim() : null;
            let searchContainer = document.getElementById('search-result');
            if (!searchContainer) {
                searchContainer = document.createElement('div');
                searchContainer.id = 'search-result';
              
                container.parentNode.insertBefore(searchContainer, container);
            }
            // reset
            searchContainer.innerHTML = '';

            if (data.searched) {
                let targetCard = document.createElement('div');
                targetCard.className = 'movie-card target';

                targetCard.innerHTML = `
                    <div class="poster-placeholder"><img src="${data.searched.poster}" alt="${data.searched.title}" class="poster-img"></div>
                    <h3>${data.searched.title}</h3>
                    <button class="btn">${strings.watchNow}</button>
                `;

                searchContainer.appendChild(targetCard);
            } else if (searchTitle) {
                let targetCard = document.createElement('div');
                targetCard.className = 'movie-card target';

                targetCard.innerHTML = `
                    <div class="poster-placeholder">🎯</div>
                    <h3>${searchTitle}</h3>
                    <button class="btn">${strings.watchNow}</button>
                `;

                searchContainer.appendChild(targetCard);
            }

            if (!data.recommendations || data.recommendations.length === 0) {
                genreBox.innerText = '';
                container.innerHTML = `<p>${strings.noRecommendations}</p>`;
                return;
            }

            genreBox.innerText = strings.genresPrefix + data.genres.join(', ');

            data.recommendations.forEach(item => {
                const title = item.title || item;
                if (data.searched && title.toLowerCase() === data.searched.title.toLowerCase()) return;

                let card = document.createElement('div');
                card.className = 'movie-card';

                const poster = item.poster || null;

                card.innerHTML = `
                    <div class="poster-placeholder">${poster ? `<img src="${poster}" alt="${title}" class="poster-img">` : '🎬'}</div>
                    <h3>${title}</h3>
                    <button class="btn">${strings.watchNow}</button>
                `;

                container.appendChild(card);
            });
        })
        .catch(err => console.error(err));
}

document.getElementById('movie').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        getRec();
    }
});

/*----------------------------HEADER SELECTION----------------------------*/

window.onload = function() {
    let savedLang = localStorage.getItem('preferredLang');
    let initialLang = savedLang || document.documentElement.lang || 'vi';
    setLanguage(initialLang);

    const languageSelector = document.querySelector('.language-selector');
    const langDropdown = document.querySelector('.lang-dropdown');
    const category = document.querySelector('.Category');
    const categoryDropdown = document.querySelector('.Category-dropdown');
    let hideTimeout;

    if (languageSelector && langDropdown) {
        languageSelector.addEventListener('mouseenter', function() {
            clearTimeout(hideTimeout);
            langDropdown.style.opacity = '1';
            langDropdown.style.visibility = 'visible';
            langDropdown.style.animation = 'slideDown 0.3s ease';
        });

        languageSelector.addEventListener('mouseleave', function() {
            hideTimeout = setTimeout(function() {
                langDropdown.style.opacity = '0';
                langDropdown.style.visibility = 'hidden';
                langDropdown.style.animation = '';
            }, 100);
        });

        langDropdown.addEventListener('mouseenter', function() {
            clearTimeout(hideTimeout);
        });

        langDropdown.addEventListener('mouseleave', function() {
            hideTimeout = setTimeout(function() {
                langDropdown.style.opacity = '0';
                langDropdown.style.visibility = 'hidden';
                langDropdown.style.animation = '';
            }, 100);
        });
    }

    if (category && categoryDropdown) {
        category.addEventListener('mouseenter', function() {
            clearTimeout(hideTimeout);
            categoryDropdown.style.opacity = '1';
            categoryDropdown.style.visibility = 'visible';
            categoryDropdown.style.animation = 'slideDown 0.3s ease';
        });

        category.addEventListener('mouseleave', function() {
            hideTimeout = setTimeout(function() {
                categoryDropdown.style.opacity = '0';
                categoryDropdown.style.visibility = 'hidden';
                categoryDropdown.style.animation = '';
            }, 100);
        });

        categoryDropdown.addEventListener('mouseenter', function() {
            clearTimeout(hideTimeout);
        });

        categoryDropdown.addEventListener('mouseleave', function() {
            hideTimeout = setTimeout(function() {
                categoryDropdown.style.opacity = '0';
                categoryDropdown.style.visibility = 'hidden';
                categoryDropdown.style.animation = '';
            }, 100);
        });
    }
};

function setLanguage(langCode) {
    let normalizedLang = translations[langCode] ? langCode : 'vi';
    document.documentElement.lang = normalizedLang;
    translatePage(normalizedLang);
    localStorage.setItem('preferredLang', normalizedLang);
}

/*----------------------------TOP-10-MOVIES--------------------------------------- */
let movies = [];
let loaded = false;

function createMovieCard(movie) {
    const div = document.createElement("div");
    div.className = "movie-card";

    div.innerHTML = `
        <div class="movie-img"></div>
        <div class="movie-info">
            <div class="movie-title">${movie.title}</div>
            <button class="watch-btn" data-i18n="watchNow">XEM PHIM</button>
        </div>
    `;

    setTimeout(() => {
        div.classList.add("slide-in");
    }, 50);

    return div;
}

function renderFirst5() {
    const container = document.getElementById("movieContainer");

    for (let i = 0; i < 5 && i < movies.length; i++) {
        container.appendChild(createMovieCard(movies[i]));
    }
}

function renderNext5() {
    if (loaded) return;

    const container = document.getElementById("movieContainer");

    for (let i = 5; i < 10 && i < movies.length; i++) {
        container.appendChild(createMovieCard(movies[i]));
    }

    loaded = true;
}

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("movieContainer");

    container.addEventListener("wheel", (e) => {
        e.preventDefault();
        container.scrollLeft += e.deltaY;

        if (
            container.scrollLeft + container.clientWidth >=
            container.scrollWidth - 50
        ) {
            renderNext5();
        }
    });

    fetch("/api/latest")
        .then(res => res.json())
        .then(data => {
            movies = data;
            renderFirst5();
        });
});
