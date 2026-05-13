import pandas as pd
import requests
import os
import re
from dotenv import load_dotenv

load_dotenv() 
API_KEY = os.getenv("TMDB_API_KEY") 

INPUT_FILE = "C:/Users/quanm/project01/ml-100k/ml-100k/u.item"
OUTPUT_DIR = "C:/Users/quanm/project01/static/image/posters"
BASE_URL = "https://api.themoviedb.org/3/search/movie"
IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"
df = pd.read_csv(INPUT_FILE, sep='|', header=None, encoding='latin-1', usecols=[0, 1])
df.columns = ['id', 'full_title']

if not API_KEY:
    print("Lỗi: Không tìm thấy TMDB_API_KEY trong file .env")
    exit()

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)


def download_poster(movie_id, full_title):
    img_data = requests.get(IMAGE_BASE_URL + poster_path).content
    file_path = os.path.join(OUTPUT_DIR, f"{movie_id}.jpg")
    match = re.search(r'(.*)\s\((\d{4})\)', full_title)

    if os.path.exists(file_path):
        print(f"Bỏ qua: {movie_id} đã tồn tại.")
        return 

    if match:
        title = match.group(1).strip()
        year = match.group(2)
    else:
        title = full_title.strip()
        year = None

    params = {
        "api_key": API_KEY,
        "query": title,
        "year": year
    }
    
    try:
        response = requests.get(BASE_URL, params=params).json()
        results = response.get('results', [])
        
        if not results:
            print(f"Không tìm thấy: {title}")
            return

        poster_path = results[0].get('poster_path')
        if not poster_path:
            return
        
        with open(file_path, 'wb') as handler:
            handler.write(img_data)
        print(f"Đã tải: {movie_id} - {title}")

    except Exception as e:
        print(f"Lỗi khi xử lý {title}: {e}")


for _, row in df.iterrows():
    download_poster(row['id'], row['full_title'])