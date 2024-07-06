from flask import render_template
from app import app

@app.route('/')
def home():
    return "Mi segundo docker"

@app.route('/home')
def root():
    return render_template( 'home.html' )
