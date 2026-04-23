import os
import pandas as pd
import requests
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

movie_data = "C:/Users/quanm/project01/ml-100k/ml-100k/u.item"
genre_movie = "C:/Users/quanm/project01/ml-100k/ml-100k/u.genre"


genre_df = pd.read_csv(genre_movie, sep="|", header=None)
genre_df = genre_df.dropna()  # bỏ dòng rỗng cuối
genre_map = dict(zip(genre_df[1], genre_df[0]))  # {index: genre_name}


columns = ["movieId", "title", "release_date", "video_release_date", "IMDb_URL"] + list(genre_map.values())

movies = pd.read_csv(
    movie_data,
    sep="|",
    encoding="latin-1",
    header=None,
    names=columns
)

genre_cols = list(genre_map.values())

movies['genres'] = movies[genre_cols].apply(
    lambda x: ' '.join([genre for genre in genre_cols if x[genre] == 1]),
    axis=1
)


cv = CountVectorizer()
matrix = cv.fit_transform(movies['genres'])


similarity = cosine_similarity(matrix)


def fetch_poster_from_tmdb(title, movie_id):
    """Try to download poster from TMDb and save to static/image/posters/<movie_id>.jpg.
    Return local static URL on success, or None on failure.
    Requires TMDB_API_KEY environment variable.
    """
    api_key = os.getenv('TMDB_API_KEY')
    poster_dir = os.path.join(os.path.dirname(__file__), 'static', 'image', 'posters')
    os.makedirs(poster_dir, exist_ok=True)
    poster_filename = f"{movie_id}.jpg"
    poster_path = os.path.join(poster_dir, poster_filename)

    # If already exists, return local URL
    if os.path.exists(poster_path):
        return f"/static/image/posters/{poster_filename}"

    if not api_key:
        return None

    try:
        resp = requests.get(
            'https://api.themoviedb.org/3/search/movie',
            params={'api_key': api_key, 'query': title},
            timeout=6
        )
        resp.raise_for_status()
        data = resp.json()
        results = data.get('results') or []
        if not results:
            return None

        poster_path_tmdb = results[0].get('poster_path')
        if not poster_path_tmdb:
            return None

        image_url = f"https://image.tmdb.org/t/p/w500{poster_path_tmdb}"
        img_resp = requests.get(image_url, timeout=10)
        img_resp.raise_for_status()

        with open(poster_path, 'wb') as f:
            f.write(img_resp.content)

        return f"/static/image/posters/{poster_filename}"
    except Exception:
        # on any failure, return None and let caller fallback
        return None


def recommend(movie_name, top_n=5):
    movie_name = movie_name.strip().lower()

    matches = movies[movies['title'].str.lower().str.contains(movie_name, na=False)]

    if matches.empty:
        return {"genres": [], "recommendations": [], "searched": None}

    idx = matches.index[0]


    target_genres = movies.loc[idx, genre_cols]

    
    movies['match_count'] = movies[genre_cols].apply(
        lambda x: sum((x == 1) & (target_genres == 1)),
        axis=1
    )

    recs = movies[(movies['match_count'] >= 2) & (movies.index != idx)]

    recs = recs.sort_values(by='match_count', ascending=False).head(top_n)

    def _poster_url_for_movie(row):
        movie_id = row['movieId']
        poster_dir = os.path.join(os.path.dirname(__file__), 'static', 'image', 'posters')
        # check common extensions in order
        for ext in ('jpg', 'png', 'svg'):
            poster_filename = f"{movie_id}.{ext}"
            poster_path = os.path.join(poster_dir, poster_filename)
            if os.path.exists(poster_path):
                return f"/static/image/posters/{poster_filename}"

        # Try to fetch from TMDb (will save as <movieId>.jpg on success)
        tmdb_url = fetch_poster_from_tmdb(row['title'], movie_id)
        if tmdb_url:
            return tmdb_url

        # Fallback
        return '/static/image/logo.png'

    searched = {
        'title': movies.loc[idx, 'title'],
        'poster': _poster_url_for_movie(movies.loc[idx])
    }

    recommendations = []
    for _, row in recs.iterrows():
        recommendations.append({
            'title': row['title'],
            'poster': _poster_url_for_movie(row)
        })

    return {
        "genres": movies.loc[idx, 'genres'].split(),
        "searched": searched,
        "recommendations": recommendations
    }