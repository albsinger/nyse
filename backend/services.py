import requests
import os

class StockQuoteService:
    api_key = os.getenv('API_KEY')
    base_url = 'https://www.alphavantage.co/query'

    @classmethod
    def get_quote(cls, symbol):
        params = {
            'function': 'GLOBAL_QUOTE',
            'symbol': symbol,
            'apikey': cls.api_key
        }
        
        try:
            response = requests.get(cls.base_url, params=params)
            data = response.json()

            if 'Global Quote' in data and data['Global Quote']:
                price = data['Global Quote']['05. price']
                formatted_price = f"{float(price):,.2f}"
            else:
                raise ValueError(f"Invalid data received for {symbol}: {data}")
            
        except requests.RequestException as e:
            raise Exception(f"Error fetching stock data: {e}")
        
        return formatted_price
