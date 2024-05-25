// Navbar data
const navbarData = [
  { text: "Asset", target: "asset" },
  { text: "Rates", target: "rates" },
  { text: "Exchanges", target: "exchanges" },
  { text: "Markets", target: "markets" },
];

// Content data
const contentData = [
  { id: "asset", title: "Asset", api: "https://api.coincap.io/v2/assets" },
  { id: "rates", title: "Rates", api: "https://api.coincap.io/v2/rates" },
  { id: "exchanges", title: "Exchanges", api: "https://api.coincap.io/v2/exchanges" },
  { id: "markets", title: "Market", api: "https://api.coincap.io/v2/markets" },
];

// Create navbar
const navbar = document.createElement("nav");
navbar.className = "navbar navbar-expand-lg navbar-dark bg-primary";

const brand = document.createElement("a");
brand.className = "navbar-brand";
brand.innerText = "Cryptocurrency";
navbar.appendChild(brand);

const navDiv = document.createElement("div");
navDiv.className = "collapse navbar-collapse";

const ul = document.createElement("ul");
ul.className = "navbar-nav mr-auto";
navbar.appendChild(navDiv);
navDiv.appendChild(ul);

navbarData.forEach((item) => {
  const li = document.createElement("li");
  li.className = "nav-item";

  const a = document.createElement("a");
  a.className = "nav-link";
  a.textContent = item.text;
  a.href = "#";
  a.dataset.target = item.target;

  a.addEventListener("click", () => {
    resetSearchAndContent(item.target);
    showContent(item.target);
    if (item.target === "markets") {
      document.getElementById("search-bar").classList.add("hidden");
    } else {
      document.getElementById("search-bar").classList.remove("hidden");
    }    
  });
  
  li.appendChild(a);
  ul.appendChild(li);
});

// Append navbar to the document body
document.body.appendChild(navbar);

// Create search bar
const searchDiv = document.createElement("div");
searchDiv.className = "input-group mb-3";
searchDiv.id = "search-bar";
searchDiv.innerHTML = `
  <input type="text" class="form-control" placeholder="Search" aria-label="Search" id="search-input">
  <div class="input-group-append">
    <button class="btn btn-outline-secondary" type="button" id="search-button">Search</button>
  </div>
`;
document.body.appendChild(searchDiv);
const content = document.createElement("div");
content.id = "content";
contentData.forEach((item) => {
  const section = document.createElement("div");
  section.classList.add("content");
  section.id = item.id;
  content.appendChild(section);
});
document.body.appendChild(content);
document.querySelectorAll(".content").forEach((content) => {
  content.style.display = "none";
});
showContent("asset");
document.getElementById("search-button").addEventListener("click", () => {
  const inputValue = document.getElementById("search-input").value.trim();
  if (inputValue !== "") {
    search(inputValue);
  }
});

async function search(inputValue) {
  try {
    const activeContentId = document.querySelector('.content[style="display: block;"]').id;
    const activeContent = contentData.find(item => item.id === activeContentId);
    const apiUrl = `${activeContent.api}/${inputValue}`;

    let response;
    try {
      response = await fetch(apiUrl);
    } catch (fetchError) {
      console.error("Error fetching data:", fetchError);
      displayError("Error fetching data. Please try again later.");
      return;
    }

    if (!response.ok) {
      if (response.status === 404) {
        displayError("No data found.");
      } else {
        displayError(`Error: ${response.statusText}`);
      }
      return;
    }

    const data = await response.json();
    if (data.data) {
      if (activeContentId === "rates") {
        const rate = data.data;
        const rateSection = document.getElementById("rates");
        rateSection.innerHTML = `
          <div class="col-md-4 mb-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">${rate.id.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</h5>
                <p class="card-text">Symbol: ${rate.symbol}</p>
                <p class="card-text">Currency Symbol: ${rate.currencySymbol || 'N/A'}</p>
                <p class="card-text">Type: ${rate.type}</p>
                <p class="card-text">Rate Usd: $${parseFloat(rate.rateUsd).toFixed(4)}</p>
              </div>
            </div>
          </div>`;
      } else if (activeContentId === "exchanges") {
        const exchange = data.data;
        const exchangeSection = document.getElementById("exchanges");
        exchangeSection.innerHTML = `
          <div class="col-md-4 mb-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">${exchange.name}</h5>
                <p class="card-text">Rank: ${exchange.rank}</p>
                <p class="card-text">Percent Total Volume: ${parseFloat(exchange.percentTotalVolume).toFixed(4)}%</p>
                <p class="card-text">Trading Pairs: ${exchange.tradingPairs}</p>
                <p class="card-text">Socket: ${exchange.socket}</p>
                <p class="card-text">Updated: ${new Date(exchange.updated).toLocaleString()}</p>
                <p class="card-text"><a href="${exchange.exchangeUrl}">Exchange</a></p>
              </div>
            </div>
          </div>`;
      } else if (activeContentId === "asset") {
        const asset = data.data;
        const assetSection = document.getElementById("asset");
        assetSection.innerHTML = `
          <div class="col-md-4 mb-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">${asset.name}</h5>
                <p class="card-text">Rank: ${asset.rank}</p>
                <p class="card-text">Symbol: ${asset.symbol}</p>
                <p class="card-text">Supply: ${parseFloat(asset.supply).toFixed(4)}</p>
                <p class="card-text">Max Supply: ${parseFloat(asset.maxSupply).toFixed(4) || 'N/A'}</p>
                <p class="card-text">Market Cap USD: ${parseFloat(asset.marketCapUsd).toFixed(4) || 'N/A'}</p>
                <p class="card-text">Volume USD(24Hr): ${parseFloat(asset.volumeUsd24Hr).toFixed(4)}</p>
                <p class="card-text">Price USD: ${parseFloat(asset.priceUsd).toFixed(4)}</p>
                <p class="card-text">Change Percent (24Hr): ${parseFloat(asset.changePercent24Hr).toFixed(4)}%</p>
                <p class="card-text">Volume-Weighted Average (24hr): ${parseFloat(asset.vwap24Hr).toFixed(4)}</p>
                <p class="card-text"><a href="${asset.explorer}">More Info</a></p>
              </div>
            </div>
          </div>`;
      }
    } else {
      displayError("No data found.");
    }
  } catch (error) {
    console.error("Error:", error);
    displayError("An unexpected error occurred. Please try again later.");
  }
}

function displayError(message) {
  const existingAlert = document.querySelector(".alert");
  if (existingAlert) {
    existingAlert.remove();
  }
  const errorDiv = document.createElement("div");
  errorDiv.className = "alert alert-danger";
  errorDiv.setAttribute("role", "alert");
  errorDiv.textContent = message;
  errorDiv.style.position = "fixed";
  errorDiv.style.top = "10px";
  errorDiv.style.right = "10px";
  errorDiv.style.zIndex = "9999";
  errorDiv.style.width = "30%";
  const searchBar = document.getElementById("search-bar");
  if (searchBar) {
    searchBar.insertAdjacentElement("beforebegin", errorDiv);
  }

  setTimeout(() => {
    if (errorDiv && errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 3000);
}

async function showContent(targetId) {
  document.querySelectorAll(".content").forEach((content) => {
    content.style.display = "none";
  });

  const targetContent = document.getElementById(targetId);
  if (targetContent) {
    targetContent.style.display = "block";
    if (targetContent.innerHTML.trim().length === 0) {
      const item = contentData.find(item => item.id === targetId);
      try {
        const response = await fetch(item.api);
        const data = await response.json();
        let innerHTML = `<h2>${item.title}</h2>`;
        let cardList = "";
        if (item.id === "asset") {
          data.data.forEach((asset) => {
            cardList += `
              <div class="col-md-4 mb-4">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">${asset.name}</h5>
                    <p class="card-text">Rank: ${asset.rank}</p>
                    <p class="card-text">Symbol: ${asset.symbol}</p>
                    <p class="card-text">Supply: ${parseFloat(asset.supply).toFixed(4)}</p>
                    <p class="card-text">Max Supply: ${parseFloat(asset.maxSupply).toFixed(4) || 'N/A'}</p>
                    <p class="card-text">Market Cap USD: ${parseFloat(asset.marketCapUsd).toFixed(4) || 'N/A'}</p>
                    <p class="card-text">Volume USD(24Hr): ${parseFloat(asset.volumeUsd24Hr).toFixed(4)}</p>
                    <p class="card-text">Price USD: ${parseFloat(asset.priceUsd).toFixed(4)}</p>
                    <p class="card-text">Change Percent (24Hr): ${parseFloat(asset.changePercent24Hr).toFixed(4)}%</p>
                    <p class="card-text">Volume-Weighted Average (24hr): ${parseFloat(asset.vwap24Hr).toFixed(4)}</p>
                    <p class="card-text"><a href="${asset.explorer}">More Info</a></p>
                  </div>
                </div>
              </div>`;
          });
        } else if (item.id === "rates") {
          data.data.forEach((rate) => {
            const name = rate.id.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
            cardList += `
              <div class="col-md-4 mb-4">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">${name}</h5>
                    <p class="card-text">Symbol: ${rate.symbol}</p>
                    <p class="card-text">Currency Symbol: ${rate.currencySymbol || 'N/A'}</p>
                    <p class="card-text">Type: ${rate.type}</p>
                    <p class="card-text">Rate Usd: $${parseFloat(rate.rateUsd).toFixed(4)}</p>
                  </div>
                </div>
              </div>`;
          });
        } else if (item.id === "exchanges") {
          data.data.forEach((exchange) => {
            cardList += `
              <div class="col-md-4 mb-4">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">${exchange.name}</h5>
                    <p class="card-text">Rank: ${exchange.rank}</p>
                    <p class="card-text">Percent Total Volume: ${parseFloat(exchange.percentTotalVolume).toFixed(4)}%</p>
                    <p class="card-text">Trading Pairs: ${exchange.tradingPairs}</p>
                    <p class="card-text">Socket: ${exchange.socket}</p>
                    <p class="card-text">Updated: ${new Date(exchange.updated).toLocaleString()}</p>
                    <p class="card-text"><a href="${exchange.exchangeUrl}">Exchange</a></p>
                  </div>
                </div>
              </div>`;
          });
        } else if (item.id === "markets") {
          data.data.forEach((market) => {
            const name = market.exchangeId.replace(/\b\w/g, char => char.toUpperCase());
            const base = market.baseId.replace(/\b\w/g, char => char.toUpperCase());
            const quote = market.quoteId.replace(/\b\w/g, char => char.toUpperCase());
            cardList += `
              <div class="col-md-4 mb-4">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">${name}</h5>
                    <p class="card-text">Rank: ${market.rank}</p>
                    <p class="card-text">Base Symbol: ${market.baseSymbol}</p>
                    <p class="card-text">Base Id: ${base}</p>
                    <p class="card-text">Quote Symbol: ${market.quoteSymbol}</p>
                    <p class="card-text">Quote Id: ${quote}</p>
                    <p class="card-text">Price Quote: $${parseFloat(market.priceQuote).toFixed(4)}</p>
                    <p class="card-text">Price USD: $${parseFloat(market.priceUsd).toFixed(4)}</p>
                    <p class="card-text">Volume USD (24Hr): $${parseFloat(market.volumeUsd24Hr).toFixed(4)}</p>
                    <p class="card-text">Exchange Volume: ${parseFloat(market.percentExchangeVolume).toFixed(4)}%</p>
                    <p class="card-text">Trades Count (24Hr): ${market.tradesCount24Hr}</p>
                    <p class="card-text">Updated: ${new Date(market.updated).toLocaleString()}</p>
                  </div>
                </div>
              </div>`;
          });
        }
        innerHTML += `<div class="row">${cardList}</div>`;
        targetContent.innerHTML = innerHTML;
      } catch (error) {
        console.error("Error fetching data:", error);
        displayError("Error fetching data. Please try again later.");
      }
    }
  }
}

// Function to reset search input and content
function resetSearchAndContent(target) {
  document.getElementById("search-input").value = "";
  const targetContent = document.getElementById(target);
  if (targetContent) {
    targetContent.innerHTML = "";
    showContent(target);
  } else {
    console.error("Content section not found for target:", target);
  }
}