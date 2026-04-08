(function () {
  const data = window.PRODUCT_DATA || {};

  function renderHomePrimary(products) {
    const grid = document.getElementById("homePrimaryGrid");
    if (!grid || !Array.isArray(products)) return;
    grid.innerHTML = products
      .map(
        (p) => `
      <div class="product-card" data-id="${p.id}">
        <span class="badge ${p.badgeClass || ""}">${p.badge || ""}</span>
        <div class="product-img">
          <img src="${p.image}" alt="${p.name}">
        </div>
        <div class="product-info">
          <h4>${p.name}</h4>
          <p class="sub">${p.sub}</p>
          <div class="price">${p.price} <span>${p.compare}</span><label>${p.off}</label></div>
          <p class="brand">${p.variant}</p>
          <button class="cart-btnn">ADD TO CART</button>
        </div>
      </div>`
      )
      .join("");
  }

  function renderHomeSecondary(products) {
    const grid = document.getElementById("homeSecondaryGrid");
    if (!grid || !Array.isArray(products)) return;
    grid.innerHTML = products
      .map(
        (p) => `
      <div class="product-card" data-id="${p.id}">
        ${p.badge ? `<span class="product-card__badge">${p.badge}</span>` : ""}
        <div class="product-img">
          <img src="${p.image}" alt="${p.name}">
          ${p.rating ? `<span class="product-card__rating">⭐ ${p.rating}</span>` : ""}
        </div>
        <div class="product-card__body">
          <h3 class="product-card__title">${p.name}</h3>
          <small class="product-card__meta">${p.sub}</small>
          <div class="product-card__price"><span>${p.price}</span><small>${p.compare}</small><b>${p.off}</b></div>
          <p class="product-card__variant">${p.variant}</p>
          <div class="product-card__colors"><span></span><span></span><span></span></div>
          <button class="product-card__cta">ADD TO CART</button>
        </div>
      </div>`
      )
      .join("");
  }

  function renderRabitGrid(products, containerId) {
    const grid = document.getElementById(containerId);
    if (!grid || !Array.isArray(products)) return;
    grid.innerHTML = products
      .map((p) => {
        const badges = (p.badges || [])
          .map((b, i) => `<div class="xmas-pdp-badge ${i > 0 ? "xmas-pdp-badge--second" : "xmas-pdp-badge--first"}">${b}</div>`)
          .join("");
        return `
        <div class="xmas-card" data-product-id="${p.id}">
          <div class="xmas-card-inner">
            <div class="xmas-image-container">
              <a href="./details.html?id=${p.id}" class="xmas-image-link">
                <img src="${p.image}" alt="${p.name}" class="xmas-product-img" loading="lazy">
                <div class="xmas-pdp-badge-wrap">${badges}</div>
                <div class="xmas-rating-badge"><span class="xmas-star">★</span><span class="xmas-rating-number">${p.rating || ""}</span></div>
              </a>
            </div>
            <div class="xmas-info">
              <h3 class="xmas-title"><a href="./details.html?id=${p.id}">${p.name}</a></h3>
              <p class="xmas-subheading">${p.sub}</p>
              <div class="xmas-price-section">
                <span class="xmas-sale-price">${p.price}</span>
                <span class="xmas-original-price">${p.compare}</span>
                <span class="xmas-save-badge">${p.off}</span>
              </div>
              <p class="xmas-variant-name">${p.variant}</p>
              <div class="xmas-button-wrapper"><button class="xmas-add-to-cart">ADD TO CART</button></div>
            </div>
          </div>
        </div>`;
      })
      .join("");
  }

  window.addEventListener("DOMContentLoaded", () => {
    renderHomePrimary(data.homePrimary);
    renderHomeSecondary(data.homeSecondary);
    renderRabitGrid(data.rabitTab1, "rabitTab1Grid");
    renderRabitGrid(data.rabitTab2, "rabitTab2Grid");
  });
})();
