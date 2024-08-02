document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-stock');
    const addButton = document.getElementById('add-stock');

    searchButton.addEventListener('click', searchStock);
    addButton.addEventListener('click', addToPortfolio);
    loadPortfolio();
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
        console.log(`${data.symbol}: $${data.price}`);
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
        loadPortfolio();
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
        updatePortfolioTable(portfolio);
    } catch (error) {
        console.error(error);
    }
}

function updatePortfolioTable(portfolio) {
    const portfolioTable = document.getElementById('portfolio-table');
    portfolioTable.innerHTML = '';
    portfolio.forEach(stock => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stock.symbol}</td>
            <td>$${stock.price}</td>
            <td>${stock.shares}</td>
            <td>$${(stock.price * stock.shares)}</td>
            <td><button class="btn btn-danger btn-sm" onclick="removeStock('${stock.symbol}')">Remove</button></td>
        `;
        portfolioTable.appendChild(row);
    });
}

async function removeStock(symbol) {
    try {
        const response = await fetch(`/api/portfolio?symbol=${encodeURIComponent(symbol)}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to remove stock from portfolio');
        }
        loadPortfolio();
    } catch (error) {
        console.error(error);
    }
}