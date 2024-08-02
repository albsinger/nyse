from flask import Flask, render_template, jsonify, request
from werkzeug.exceptions import BadRequest

from database import db
from models import Stock, StockFactory
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
    if not symbol:
        raise BadRequest('Symbol is required')
    try:
        price = StockQuoteService.get_quote(symbol)
        return jsonify({'symbol': symbol, 'price': price})
    except Exception as e:
        raise BadRequest(str(e))

@app.route('/api/portfolio', methods=['GET', 'POST'])
def manage_portfolio():
    if request.method == 'GET':
        portfolio = StockFactory.get_portfolio_with_prices()
        return jsonify(portfolio)
    
    elif request.method == 'POST':
        data = request.json
        if not data or 'symbol' not in data:
            raise BadRequest('Symbol is required')
        
        symbol = data['symbol'].upper()
        
        if Stock.query.count() >= 5:
            raise BadRequest('Portfolio is full (maximum 5 stocks)')
        
        stock = Stock.query.filter_by(symbol=symbol).first()
        
        if not stock:
            stock = Stock(symbol=symbol, shares=0)
            db.session.add(stock)
        
        db.session.commit()
        return jsonify(stock.to_dict()), 201
    

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)