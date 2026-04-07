import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

movie_data = "C:/Users/quanm/project01/ml-100k/ml-100k/u.item"
genre_movie = "C:/Users/quanm/project01/ml-100k/ml-100k/u.genre"


# ====== LOAD GENRE ======
genre_df = pd.read_csv(genre_movie, sep="|", header=None)
genre_df = genre_df.dropna()  # bỏ dòng rỗng cuối
genre_map = dict(zip(genre_df[1], genre_df[0]))  # {index: genre_name}

# ====== LOAD MOVIES ======
columns = ["movieId", "title", "release_date", "video_release_date", "IMDb_URL"] + list(genre_map.values())

movies = pd.read_csv(
    movie_data,
    sep="|",
    encoding="latin-1",
    header=None,
    names=columns
)

# ====== TẠO CỘT GENRES (MAP ĐÚNG INDEX) ======
genre_cols = list(genre_map.values())

movies['genres'] = movies[genre_cols].apply(
    lambda x: ' '.join([genre for genre in genre_cols if x[genre] == 1]),
    axis=1
)

# ====== VECTOR HÓA ======
cv = CountVectorizer()
matrix = cv.fit_transform(movies['genres'])

# ====== SIMILARITY ======
similarity = cosine_similarity(matrix)

# ====== HÀM GỢI Ý ======
def recommend(movie_name, top_n=5):
    movie_name = movie_name.strip().lower()

    matches = movies[movies['title'].str.lower().str.contains(movie_name, na=False)]

    if matches.empty:
        return {"genres": [], "recommendations": ["Không tìm thấy phim"]}

    idx = matches.index[0]

    # Lấy vector thể loại của phim gốc
    target_genres = movies.loc[idx, genre_cols]

    # Tính số lượng thể loại trùng
    movies['match_count'] = movies[genre_cols].apply(
        lambda x: sum((x == 1) & (target_genres == 1)),
        axis=1
    )

    # Lọc phim có ít nhất 2 thể loại trùng
    recs = movies[(movies['match_count'] >= 2) & (movies.index != idx)]

    # Sắp xếp theo số lượng trùng giảm dần
    recs = recs.sort_values(by='match_count', ascending=False).head(top_n)

    return {
        "genres": movies.loc[idx, 'genres'].split(),
        "recommendations": recs['title'].tolist()
    }