import requests
import os

class StockQuoteService:
    def __init__(self):
        self.api_key = os.getenv('API_KEY')
        self.base_url = 'https://www.alphavantage.co/query'

    
    def get_quote(self, symbol):
        params = {
            'function': 'GLOBAL_QUOTE',
            'symbol': symbol,
            'apikey': self.api_key
        }
        
        try:
            response = requests.get(self.base_url, params=params)
            data = response.json()

            if 'Global Quote' in data and data['Global Quote']:
                price = data['Global Quote']['05. price']
                formatted_price = f"{float(price):,.2f}"
            else:
                raise ValueError(f"Invalid data received for {symbol}")
            
        except requests.RequestException as e:
            raise Exception(f"Error fetching stock data: {e}")
        
        return formatted_price
        

if __name__ == '__main__':
    stock = StockQuoteService()
    stock.get_quote('IBM')

