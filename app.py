from flask import Flask, render_template, request, jsonify, send_from_directory
import model
from dotenv import load_dotenv
import os


load_dotenv()
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
app = Flask(__name__)

@app.route('/new_posters/<filename>')
def get_poster(filename):
    poster_dir = r"C:/Users/quanm/RetroHubMovies/posters"
    return send_from_directory(poster_dir, filename)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/recommend')
def get_recommendation():
    movie = request.args.get('movie')
    return jsonify(model.recommend(movie))

@app.route("/api/latest")
def latest():
    top10moviesnewest = model.get_top_10_latest_movies(model.movies)
    return jsonify(top10moviesnewest)

if __name__ == "__main__":
    app.run(debug=True)