function getRec() {
    let movie = document.getElementById("movie").value;

    fetch(`/recommend?movie=${encodeURIComponent(movie)}`)
        .then(res => res.json())
        .then(data => {

            let container = document.getElementById("result");
            container.innerHTML = "";

            let genreBox = document.getElementById("genres");

            if (!data.recommendations || data.recommendations.length === 0) {
                genreBox.innerText = "";
                container.innerHTML = "<p>Không tìm thấy phim hoặc không có gợi ý</p>";
                return;
            }

            // Hiển thị thể loại
            genreBox.innerText = "Thể loại: " + data.genres.join(", ");

            // Hiển thị phim
            data.recommendations.forEach(item => {
                let card = document.createElement("div");
                card.className = "movie-card";

                card.innerHTML = `
                    <div class="poster-placeholder">🎬</div>
                    <h3>${item}</h3>
                    <button class="btn">XEM NGAY</button>
                `;

                container.appendChild(card);
            });
        })
        .catch(err => console.error(err));
}

document.getElementById("movie").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        getRec();
    }
});

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
        genresPrefix: 'Thể loại: '
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
        genresPrefix: 'Genres: '
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
        genresPrefix: '장르: '
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
        genresPrefix: 'ジャンル: '
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
        genresPrefix: '类型: '
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
}

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

            if (!data.recommendations || data.recommendations.length === 0) {
                genreBox.innerText = '';
                container.innerHTML = `<p>${strings.noRecommendations}</p>`;
                return;
            }

            genreBox.innerText = strings.genresPrefix + data.genres.join(', ');

            data.recommendations.forEach(item => {
                let card = document.createElement('div');
                card.className = 'movie-card';

                card.innerHTML = `
                    <div class="poster-placeholder">🎬</div>
                    <h3>${item}</h3>
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

window.onload = function() {
    let savedLang = localStorage.getItem('preferredLang');
    let initialLang = savedLang || document.documentElement.lang || 'vi';
    setLanguage(initialLang);
};

function setLanguage(langCode) {
    let normalizedLang = translations[langCode] ? langCode : 'vi';
    document.documentElement.lang = normalizedLang;
    translatePage(normalizedLang);
    localStorage.setItem('preferredLang', normalizedLang);
}
