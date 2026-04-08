async function injectPartial(targetId, filePath) {
  const node = document.getElementById(targetId);
  if (!node) return;
  try {
    const res = await fetch(filePath);
    if (!res.ok) return;
    const html = await res.text();
    node.innerHTML = html;
  } catch (e) {
    // Keep page usable even if partial load fails.
  }
}

const CART_KEY = "rabitat_cart";
let cartDrawerApi = {
  open: () => {},
  close: () => {}
};

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function parsePriceToNumber(priceText) {
  const numeric = String(priceText || "")
    .replace(/[^\d.]/g, "");
  return Number(numeric || 0);
}

function formatINR(amount) {
  return `₹${new Intl.NumberFormat("en-IN").format(Math.round(amount))}`;
}

function getAllProducts() {
  const src = window.PRODUCT_DATA || {};
  return []
    .concat(src.homePrimary || [])
    .concat(src.homeSecondary || [])
    .concat(src.rabitTab1 || [])
    .concat(src.rabitTab2 || []);
}

function findProductById(id) {
  return getAllProducts().find((p) => p.id === id);
}

function getCurrentDetailsProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function updateCartUI() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + parsePriceToNumber(item.price) * (item.qty || 0),
    0
  );

  document.querySelectorAll(".cart .count").forEach((node) => {
    node.textContent = String(totalItems);
  });

  const title = document.getElementById("cartDrawerTitle");
  if (title) {
    title.textContent = `Your Cart (${totalItems} items)`;
  }

  const listNode = document.getElementById("cartDrawerItems");
  const emptyNode = document.getElementById("cartDrawerEmpty");
  const footerNode = document.getElementById("cartDrawerFooter");
  const subtotalNode = document.getElementById("cartSubtotal");
  if (!listNode || !emptyNode || !footerNode || !subtotalNode) return;

  if (cart.length === 0) {
    listNode.innerHTML = "";
    emptyNode.style.display = "block";
    footerNode.style.display = "none";
    subtotalNode.textContent = "₹0";
    return;
  }

  emptyNode.style.display = "none";
  footerNode.style.display = "block";
  subtotalNode.textContent = formatINR(subtotal);
  listNode.innerHTML = cart
    .map(
      (item) => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p class="cart-item-sub">${item.sub || ""}</p>
          <div class="cart-item-price-row">
            <span class="cart-item-sale">${item.price}</span>
            <span class="cart-item-compare">${item.compare || ""}</span>
            <span class="cart-item-off">${item.off || ""}</span>
          </div>
          <p class="cart-item-variant">${item.variant || ""}</p>
          <button class="cart-remove-btn" data-action="remove" data-id="${item.id}">Remove</button>
        </div>
        <div class="cart-qty-controls">
          <button data-action="decrease" data-id="${item.id}">-</button>
          <span class="cart-item-qty">${item.qty}</span>
          <button data-action="increase" data-id="${item.id}">+</button>
        </div>
      </div>`
    )
    .join("");
}

function addToCart(productId) {
  if (!productId) return;
  const product = findProductById(productId);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      sub: product.sub,
      price: product.price,
      compare: product.compare,
      off: product.off,
      variant: product.variant,
      image: product.image,
      qty: 1
    });
  }
  saveCart(cart);
  updateCartUI();
  sendAddToCartEvent(product);
}

function sendAddToCartEvent(product) {
  if (!product || !window.SalesforceInteractions || !SalesforceInteractions.sendEvent) return;

  const priceValue = Number(String(product.price || "").replace(/[^\d.]/g, "")) || 0;
  const quantity = 1;
  const lineItem = {
    catalogObjectType: "Product",
    catalogObjectId: product.id,
    quantity,
    price: priceValue,
    attributes: {
      name: product.name,
      sku: { id: product.id }
    }
  };

  SalesforceInteractions.sendEvent({
    interaction: {
      name: SalesforceInteractions.CartInteractionName?.AddToCart || "AddToCart",
      lineItem
    }
  });

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    MCP: {
      event: "add_to_cart",
      item: {
        id: product.id,
        name: product.name,
        price: product.price,
        url: window.location.href,
        imageUrl: product.image,
        quantity
      }
    }
  });
}

function changeQty(productId, delta) {
  const cart = getCart();
  const item = cart.find((p) => p.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    const filtered = cart.filter((p) => p.id !== productId);
    saveCart(filtered);
  } else {
    saveCart(cart);
  }
  updateCartUI();
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  updateCartUI();
}

function initAddToCartEvents() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".cart-btnn, .product-card__cta, .xmas-add-to-cart, .cart-btn");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();

    const cardWithId = button.closest("[data-id]");
    const cardWithProductId = button.closest("[data-product-id]");
    const productId =
      (cardWithId && cardWithId.getAttribute("data-id")) ||
      (cardWithProductId && cardWithProductId.getAttribute("data-product-id")) ||
      getCurrentDetailsProductId();

    addToCart(productId);
    cartDrawerApi.open();
  });
}

function initCartItemActions() {
  document.addEventListener("click", (event) => {
    const control = event.target.closest("[data-action][data-id]");
    if (!control) return;

    const action = control.getAttribute("data-action");
    const productId = control.getAttribute("data-id");
    if (!productId) return;

    if (action === "increase") changeQty(productId, 1);
    if (action === "decrease") changeQty(productId, -1);
    if (action === "remove") removeFromCart(productId);
  });
}

function initCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartDrawerOverlay");
  const closeBtn = document.getElementById("cartDrawerClose");
  const triggers = document.querySelectorAll(".cart-trigger");

  if (!drawer || !overlay || !closeBtn || triggers.length === 0) return;

  const openDrawer = () => {
    drawer.classList.add("is-open");
    overlay.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-open");
  };

  const closeDrawer = () => {
    drawer.classList.remove("is-open");
    overlay.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-open");
  };

  cartDrawerApi = {
    open: openDrawer,
    close: closeDrawer
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", openDrawer);
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDrawer();
      }
    });
  });

  closeBtn.addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  await injectPartial("site-header", "./header.html");
  await injectPartial("site-footer", "./footer.html");
  initCartDrawer();
  initAddToCartEvents();
  initCartItemActions();
  updateCartUI();
});
