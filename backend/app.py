from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from werkzeug.exceptions import BadRequest

from database import db
from models import Stock
from services import StockQuoteService


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db.init_app(app)   


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/search', methods=['GET'])
def search_stock():
    symbol = request.args.get('symbol').upper()
    self = 1
    if not symbol:
        raise BadRequest('Symbol is required')
    try:
        price = StockQuoteService.get_quote(symbol)
        return jsonify({'symbol': symbol, 'price': price})
    except Exception as e:
        raise BadRequest(str(e))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)