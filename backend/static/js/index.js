document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-stock');
    const addButton = document.getElementById('add-stock');

    searchButton.addEventListener('click', searchStock);

});

async function searchStock() {
    const searchInput = document.getElementById('search-input').value.toUpperCase();
    const stockTicker = document.getElementById('stock-ticker');
    const stockPrice = document.getElementById('stock-price');
    const searchError = document.getElementById('search-error')
    const displayError = (msg) => {
        searchError.innerText = msg;
        searchError.style.display = 'block';
        searchError.classList.add('is-invalid')
    }

    if (!searchInput) {
        displayError("Enter valid symbol");
        return
    }
 
    try {
        const response = await fetch(`/api/search?symbol=${encodeURIComponent(searchInput)}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }
        const data = await response.json();
        stockTicker.innerText = data.symbol
        stockPrice.innerText =  `$${data.price}`
        console.log(`${data.symbol}: $${data.price}`);
    } catch (error) {
        displayError("Failed to fetch stock data");
        console.error(error);
        throw error;
    }

    searchError.innerText = '';
        searchError.style.display = 'none';
        searchError.classList.remove('is-invalid')
}