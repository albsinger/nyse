# test_app.py
import pytest
from app import app
from database import db
from models import Stock
from unittest.mock import patch

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.session.remove()
            db.drop_all()

def test_add_stock_to_portfolio(client):
    response = client.post('/api/portfolio', json={'symbol': 'TSLA'})
    assert response.status_code == 201
    data = response.get_json()
    assert data['symbol'] == 'TSLA'
    response = client.get('/api/portfolio')
    data = response.get_json()
    assert any(stock['symbol'] == 'TSLA' for stock in data) 
    
def test_get_portfolio(client):
    client.post('/api/portfolio', json={'symbol': 'AAPL'})
    client.post('/api/portfolio', json={'symbol': 'GOOGL'})

    response = client.get('/api/portfolio')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 2
    assert any(stock['symbol'] == 'AAPL' for stock in data)
    assert any(stock['symbol'] == 'GOOGL' for stock in data)

def test_portfolio_limit(client):
    for symbol in ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'FB']:
        client.post('/api/portfolio', json={'symbol': symbol})
    
    response = client.post('/api/portfolio', json={'symbol': 'TSLA', 'shares': 1})
    assert response.status_code == 400
    assert b'<p>Portfolio is full (maximum 5 stocks)</p>' in response.data

def test_update_portfolio(client):
    client.post('/api/portfolio', json={'symbol': 'AAPL'})
    response = client.put('/api/portfolio', json={'symbol': 'AAPL', 'shares': 10})
    assert response.status_code == 201
    response = client.get('/api/portfolio')
    data = response.get_json()
    assert any(stock['symbol'] == 'AAPL' for stock in data)
    assert data[0]['shares'] == 10 
    assert data[0]['symbol'] == 'AAPL'

    response = client.put('/api/portfolio', json={'symbol': 'AAPL', 'shares': 5})
    assert response.status_code == 201
    response = client.get('/api/portfolio')
    data = response.get_json()
    assert any(stock['symbol'] == 'AAPL' for stock in data)
    assert data[0]['shares'] == 15 
    assert data[0]['symbol'] == 'AAPL'

    response = client.put('/api/portfolio', json={'symbol': 'AAPL', 'shares': -10})
    assert response.status_code == 201
    response = client.get('/api/portfolio')
    data = response.get_json()
    assert any(stock['symbol'] == 'AAPL' for stock in data)
    assert data[0]['shares'] == 5
    assert data[0]['symbol'] == 'AAPL'

    response = client.put('/api/portfolio', json={'symbol': 'AAPL', 'shares': -10})
    assert response.status_code == 201
    response = client.get('/api/portfolio')
    data = response.get_json()
    assert any(stock['symbol'] == 'AAPL' for stock in data)
    assert data[0]['shares'] == 0
    assert data[0]['symbol'] == 'AAPL'

def test_remove_stock_from_portfolio(client):
    client.post('/api/portfolio', json={'symbol': 'AAPL'})
    response = client.delete('/api/portfolio?symbol=AAPL')
    assert response.status_code == 204

def test_search_stock(client):
    with patch('services.StockQuoteService.get_quote') as mock_get_quote:
        mock_get_quote.return_value = 150.0

        response = client.get('/api/search?symbol=AAPL')
        assert response.status_code == 200
        data = response.get_json()
        assert data['symbol'] == 'AAPL'
        assert data['price'] == 150.0
