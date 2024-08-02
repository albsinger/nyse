from database import db

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