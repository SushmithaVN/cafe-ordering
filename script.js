const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSL24iA2RQTpRyDr2Z_upfRle5XCCeG6TIG4EKv-f9WiVpXXyhaVd7pPyYJACbMR97Sv5x6mQ_3362i/pub?gid=409951925&single=true&output=csv";

let cart = [];
let allItems = [];
let currentDiet = "all";
let currentSearch = "";

fetch(SHEET_URL)
  .then(response => response.text())
  .then(csvText => {
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    allItems = parsed.data.filter(item => item.Category && item.Item && item.Price);
    renderFilteredMenu();
  })
  .catch(error => {
    document.getElementById("menuContainer").innerHTML =
      "<p class='empty-state'>Sorry, couldn't load the menu. Please refresh.</p>";
    console.error("Menu load error:", error);
  });

// Diet filter buttons (All / Veg / Non-Veg)
document.querySelectorAll(".diet-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentDiet = btn.dataset.diet;
    document.querySelectorAll(".diet-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderFilteredMenu();
  });
});

// Search box
document.getElementById("searchInput").addEventListener("input", (e) => {
  currentSearch = e.target.value.toLowerCase().trim();
  renderFilteredMenu();
});

function renderFilteredMenu() {
  const filtered = allItems.filter(item => {
    const matchesDiet = currentDiet === "all" || item.Type.toLowerCase() === currentDiet;
    const matchesSearch = item.Item.toLowerCase().includes(currentSearch);
    return matchesDiet && matchesSearch;
  });
  buildMenu(filtered);
}

function buildMenu(items) {
  const container = document.getElementById("menuContainer");
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = "<p class='empty-state'>No dishes match. Try a different search or filter.</p>";
    document.getElementById("categoryListItems").innerHTML = "";
    return;
  }

  const grouped = {};
  items.forEach(item => {
    if (!grouped[item.Category]) grouped[item.Category] = [];
    grouped[item.Category].push(item);
  });

  for (const category in grouped) {
    const slug = "cat-" + category.replace(/\s+/g, "-").toLowerCase();

    const heading = document.createElement("h2");
    heading.className = "category-heading";
    heading.id = slug;
    heading.textContent = category;
    container.appendChild(heading);

    grouped[category].forEach(item => container.appendChild(buildItemRow(item)));
  }

  populateCategorySheet(Object.keys(grouped));
}

// Fills the bottom sheet with a clickable list of the categories currently visible
function populateCategorySheet(categories) {
  const listDiv = document.getElementById("categoryListItems");
  listDiv.innerHTML = "";

  categories.forEach(category => {
    const slug = "cat-" + category.replace(/\s+/g, "-").toLowerCase();
    const btn = document.createElement("button");
    btn.className = "category-list-item";
    btn.textContent = category;
    btn.addEventListener("click", () => {
      document.getElementById("categorySheetOverlay").classList.remove("open");
      document.getElementById(slug).scrollIntoView({ behavior: "smooth", block: "start" });
    });
    listDiv.appendChild(btn);
  });
}

// Open/close the bottom sheet
document.getElementById("menuJumpBtn").addEventListener("click", () => {
  document.getElementById("categorySheetOverlay").classList.add("open");
});

document.getElementById("categorySheetOverlay").addEventListener("click", (e) => {
  // Only close if the dark backdrop itself was clicked, not the sheet content
  if (e.target.id === "categorySheetOverlay") {
    e.currentTarget.classList.remove("open");
  }
});

function buildItemRow(item) {
  const row = document.createElement("div");
  row.className = "menu-item";

  const info = document.createElement("div");
  info.className = "item-info";

  const dietDot = document.createElement("span");
  dietDot.className = "diet-indicator " + (item.Type.toLowerCase() === "veg" ? "veg" : "nonveg");

  const name = document.createElement("span");
  name.className = "item-name";
  name.textContent = item.Item;

  info.appendChild(dietDot);
  info.appendChild(name);

  const price = document.createElement("span");
  price.className = "item-price";
  price.textContent = `₹${item.Price}`;

  const controls = document.createElement("div");
  controls.className = "item-controls";

  const existing = cart.find(i => i.name === item.Item);
  if (existing) {
    renderQtyControls(controls, item.Item, parseInt(item.Price), existing.quantity);
  } else {
    renderAddButton(controls, item.Item, parseInt(item.Price));
  }

  row.appendChild(info);
  row.appendChild(price);
  row.appendChild(controls);

  return row;
}

function renderAddButton(container, name, price) {
  container.innerHTML = "";
  const addBtn = document.createElement("button");
  addBtn.textContent = "Add";
  addBtn.addEventListener("click", () => changeQuantity(name, price, 1, container));
  container.appendChild(addBtn);
}

function renderQtyControls(container, name, price, quantity) {
  container.innerHTML = "";
  container.className = "item-controls qty-controls";

  const minusBtn = document.createElement("button");
  minusBtn.textContent = "−";
  minusBtn.addEventListener("click", () => changeQuantity(name, price, -1, container));

  const qtyText = document.createElement("span");
  qtyText.textContent = quantity;

  const plusBtn = document.createElement("button");
  plusBtn.textContent = "+";
  plusBtn.addEventListener("click", () => changeQuantity(name, price, 1, container));

  container.appendChild(minusBtn);
  container.appendChild(qtyText);
  container.appendChild(plusBtn);
}

function changeQuantity(name, price, delta, container) {
  const existingItem = cart.find(i => i.name === name);

  if (existingItem) {
    existingItem.quantity += delta;
    if (existingItem.quantity <= 0) {
      cart = cart.filter(i => i.name !== name);
      container.className = "item-controls";
      renderAddButton(container, name, price);
    } else {
      renderQtyControls(container, name, price, existingItem.quantity);
    }
  } else if (delta > 0) {
    cart.push({ name, price, quantity: 1 });
    renderQtyControls(container, name, price, 1);
  }

  updateCartDisplay();
}

function updateCartDisplay() {
  const cartDiv = document.getElementById("cart");
  const stickyText = document.getElementById("stickyText");
  cartDiv.innerHTML = "";

  let total = 0;
  let totalItems = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    totalItems += item.quantity;

    const line = document.createElement("p");
    line.textContent = `${item.name} x${item.quantity} - ₹${itemTotal}`;
    cartDiv.appendChild(line);
  });

  stickyText.textContent = `${totalItems} items · ₹${total}`;
}

// ---- WhatsApp ordering ----
const OWNER_WHATSAPP_NUMBER = "919036308008"; // <-- put your real number back here

document.getElementById("placeOrderBtn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Please add at least one item before placing your order.");
    return;
  }

  const tableNumber = document.getElementById("tableNumber").value;

  let message = `*New Order - Paradise Cafe*\n`;
  message += `Table No: ${tableNumber}\n\n`;
  message += `*Order Details:*\n`;

  let total = 0;
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    message += `• ${item.quantity}x ${item.name} - ₹${itemTotal}\n`;
  });

  message += `\n*Total: ₹${total}*`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${encodedMessage}`;
  window.open(whatsappURL, "_blank");
});