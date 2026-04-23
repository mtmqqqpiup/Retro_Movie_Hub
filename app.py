from flask import Flask, render_template, request, jsonify
from model import recommend
from dotenv import load_dotenv
import os

load_dotenv()  # đọc .env vào environment
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/recommend')
def get_recommendation():
    movie = request.args.get('movie')
    return jsonify(recommend(movie))

if __name__ == "__main__":
    app.run(debug=True)