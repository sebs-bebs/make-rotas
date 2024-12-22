from flask import Flask, render_template, jsonify, request
from datetime import datetime, timedelta

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/default-dates')
def get_default_dates():
    # Get the current week's Monday and following Sunday
    today = datetime.now()
    monday = today - timedelta(days=today.weekday())
    dates = [(monday + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(7)]
    return jsonify(dates)

if __name__ == '__main__':
    app.run(debug=True)
