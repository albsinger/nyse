document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-stock');
    const addButton = document.getElementById('add-stock');

    searchButton.addEventListener('click', searchStock);
    addButton.addEventListener('click', addToPortfolio);
    updatePortfolioTable(); 
    setInterval(updatePortfolioValues, 5000);
});

async function searchStock() {
    const searchInput = document.getElementById('search-input').value.toUpperCase();
    const stockTicker = document.getElementById('stock-ticker');
    const stockPrice = document.getElementById('stock-price');
    const searchError = document.getElementById('search-error');
    const displayError = (msg) => {
        searchError.innerText = msg;
        searchError.style.display = 'block';
        searchError.classList.add('is-invalid');
    }

    if (!searchInput) {
        displayError("Enter valid symbol");
        return;
    }
 
    try {
        const response = await fetch(`/api/search?symbol=${encodeURIComponent(searchInput)}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }
        const data = await response.json();
        stockTicker.innerText = data.symbol;
        stockPrice.innerText =  `$${data.price}`;
    } catch (error) {
        displayError("Failed to fetch stock data");
        console.error(error);
        throw error;
    }

    searchError.innerText = '';
        searchError.style.display = 'none';
        searchError.classList.remove('is-invalid');
}

async function addToPortfolio() {
    const stockTicker = document.getElementById('stock-ticker').innerText;
    
    try {
        const response = await fetch('/api/portfolio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ symbol: stockTicker}),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add stock to portfolio');
        }
        updatePortfolioTable();
    } catch (error) {
        console.error(error);
    }
}

async function removeFromPortfolio(symbol) {
    try {
        const response = await fetch(`/api/portfolio?symbol=${encodeURIComponent(symbol)}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to remove stock from portfolio');
        }
        updatePortfolioTable();
    } catch (error) {
        console.error(error);
    }
}

async function loadPortfolio() {
    try {
        const response = await fetch('/api/portfolio');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to load portfolio');
        }
        const portfolio = await response.json();
        return portfolio; 
    } catch (error) {
        console.error(error);
    }
}

async function updatePortfolioTable() {
    portfolio = await loadPortfolio(); 
    const portfolioTable = document.getElementById('portfolio-table');
    portfolioTable.innerHTML = '';
    portfolio.forEach(stock => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td id="symbol-of-${stock.symbol}">${stock.symbol}</td>
            <td id="price-of-${stock.symbol}">$${Number(stock.price).toFixed(2)}</td>
            <td id="shares-of-${stock.symbol}">${stock.shares}</td>
            <td id="value-of-${stock.symbol}">$${(stock.price * stock.shares).toFixed(2)}</td>
            <td>
                <div class="input-group">
                    <button class="btn btn-info btn-sm" onclick="buyStock('${stock.symbol}')">Buy</button>
                        <div class="col-auto">
                            <input type="number" id="${stock.symbol}-shares-order" class="form-control" style="width: 6ch;" min="0" placeholder="0">
                        </div>
                    <button class="btn btn-warning btn-sm" onclick="sellStock('${stock.symbol}')">Sell</button>
                </div>
            </td>
            <td><button class="btn btn-danger btn-sm" onclick="removeFromPortfolio('${stock.symbol}')">Remove</button></td>
        `;
        portfolioTable.appendChild(row);
    });
}

async function updatePortfolioValues(portfolio) {
    portfolio = await loadPortfolio();
    portfolio.forEach(stock => {
        document.getElementById(`price-of-${stock.symbol}`).innerText = `$${Number(stock.price).toFixed(2)}`;  
        document.getElementById(`shares-of-${stock.symbol}`).innerText = stock.shares;
        document.getElementById(`value-of-${stock.symbol}`).innerText = '$' + (stock.price * stock.shares).toFixed(2);
    });
}

async function buyStock(symbol) {
    let sharesElement = document.getElementById(`${symbol}-shares-order`);
    let shares = sharesElement.value; 
    sharesElement.value = 0; 
    shares = shares ? shares : 0; 
    const buyOrder = {symbol: symbol, shares: shares}; 
    executeOrder(buyOrder); 
}

async function sellStock(symbol) {
    let sharesElement = document.getElementById(`${symbol}-shares-order`);
    let shares = sharesElement.value; 
    sharesElement.value = 0; 
    let holdings = document.getElementById(`shares-of-${symbol}`).innerText; 
    holdings = holdings ? holdings : 0; 
    const totalOrder = holdings - shares > 0 ? shares : holdings; 
    const negateOrder = -Number(totalOrder); 
    const sellOrder = {symbol: symbol, shares: negateOrder}; 
    executeOrder(sellOrder); 
}

async function executeOrder(order) {
    try {
        const response = await fetch('/api/portfolio', 
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(order)
            }
        );
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to remove stock from portfolio');
        }
        updatePortfolioValues();
    } catch (error) {
        console.error(error);
    }
}