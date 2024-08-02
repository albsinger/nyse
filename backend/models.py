from database import db
from services import StockQuoteService

class Stock(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), unique=True, nullable=False)
    shares = db.Column(db.Float, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'symbol': self.symbol,
            'shares': self.shares
        }

class StockFactory:
    @staticmethod
    def create_stock_dict_with_price(stock):
        stock_dict = stock.to_dict()
        try:
            stock_dict['price'] = StockQuoteService.get_quote(stock_dict['symbol'])
        except Exception as e:
            stock_dict['price'] = None  
            print(f"Error fetching price for {stock_dict['symbol']}: {e}")
        return stock_dict

    @staticmethod
    def get_portfolio_with_prices():
        stocks = Stock.query.all()
        return [StockFactory.create_stock_dict_with_price(stock) for stock in stocks]
