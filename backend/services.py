import os
import finnhub

class StockQuoteService:
    finnhub_client = finnhub.Client(api_key="cqmeim9r01qjs6oc0s60cqmeim9r01qjs6oc0s6g")

    @classmethod
    def get_quote(cls, symbol): 
        try:
            data = cls.finnhub_client.quote(symbol)

            if 'c' in data and data['c']:
                current_price = data['c']
                formatted_price = f"{float(current_price):,.2f}"
            else:
                raise ValueError(f"Invalid data received for {symbol}: {data}")
            
        except Exception as e:
            raise Exception(f"Error fetching stock data: {e}")
        
        return formatted_price
