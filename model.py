import os
import pandas as pd
import requests
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

movie_data = "C:/Users/quanm/project01/ml-100k/ml-100k/u.item"
genre_movie = "C:/Users/quanm/project01/ml-100k/ml-100k/u.genre"

genre_df = pd.read_csv(genre_movie, sep="|", header=None)
genre_df = genre_df.dropna()
genre_map = dict(zip(genre_df[1], genre_df[0]))

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
    api_key = os.getenv('TMDB_API_KEY')
    poster_dir = os.path.join(os.path.dirname(__file__), 'static', 'image', 'posters')
    os.makedirs(poster_dir, exist_ok=True)
    poster_filename = f"{movie_id}.jpg"
    poster_path = os.path.join(poster_dir, poster_filename)

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
        return None

def get_top_10_latest_movies():
    import datetime
    
    def extract_year(date_str):
        try:
            if pd.isna(date_str) or date_str == '':
                return 0
            date_obj = datetime.datetime.strptime(date_str, "%d-%b-%Y")
            return date_obj.year
        except:
            return 0
    
    movies['year'] = movies['release_date'].apply(extract_year)
    
    top_10 = movies[movies['year'] > 0].sort_values(by='year', ascending=False).head(10)
    
    def _poster_url_for_movie(row):
        movie_id = row['movieId']
        poster_dir = os.path.join(os.path.dirname(__file__), 'static', 'image', 'posters')
        # check common extensions in order
        for ext in ('jpg', 'png', 'svg'):
            poster_filename = f"{movie_id}.{ext}"
            poster_path = os.path.join(poster_dir, poster_filename)
            if os.path.exists(poster_path):
                return f"/static/image/posters/{poster_filename}"

        tmdb_url = fetch_poster_from_tmdb(row['title'], movie_id)
        if tmdb_url:
            return tmdb_url

        return '/static/image/logo.png'
    
    result = []
    for _, row in top_10.iterrows():
        result.append({
            'movieId': int(row['movieId']),
            'title': row['title'],
            'year': int(row['year']),
            'poster': _poster_url_for_movie(row)
        })
    
    return result

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

        tmdb_url = fetch_poster_from_tmdb(row['title'], movie_id)
        if tmdb_url:
            return tmdb_url

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

#---------------------------TOP-10-NEWEST-MOVIES---------------------------
df = pd.read_csv(movie_data, sep="|", names=columns, encoding="latin-1")
df["year"] = df["title"].str.extract(r"\((\d{4})\)").astype(float)

def get_latest_movies(n=10):
    latest = df.sort_values("year", ascending=False).head(n)
    return latest[["movieId", "title", "year"]].to_dict(orient="records")