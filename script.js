const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSL24iA2RQTpRyDr2Z_upfRle5XCCeG6TIG4EKv-f9WiVpXXyhaVd7pPyYJACbMR97Sv5x6mQ_3362i/pub?gid=409951925&single=true&output=csv";

let cart = [];

fetch(SHEET_URL)
  .then(response => response.text())
  .then(csvText => {
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    buildMenu(parsed.data);
  })
  .catch(error => {
    document.getElementById("menuContainer").innerHTML =
      "<p>Sorry, couldn't load the menu. Please refresh.</p>";
    console.error("Menu load error:", error);
  });

function buildMenu(items) {
  const container = document.getElementById("menuContainer");
  container.innerHTML = "";

  const grouped = {};
  items.forEach(item => {
    if (!item.Category || !item.Item || !item.Price) return;
    if (!grouped[item.Category]) grouped[item.Category] = [];
    grouped[item.Category].push(item);
  });

  for (const category in grouped) {
    const heading = document.createElement("h2");
    heading.textContent = category;
    container.appendChild(heading);

    grouped[category].forEach(item => {
      const row = document.createElement("div");
      row.className = "menu-item";

      const label = document.createElement("span");
      label.textContent = `${item.Item} - ₹${item.Price}`;

      // This div will hold either the "Add" button OR the "- 1 +" controls
      const controlsDiv = document.createElement("div");
      renderAddButton(controlsDiv, item.Item, parseInt(item.Price));

      row.appendChild(label);
      row.appendChild(controlsDiv);
      container.appendChild(row);
    });
  }
}

// Shows the plain "Add" button (used when item isn't in cart / qty is 0)
function renderAddButton(container, name, price) {
  container.innerHTML = "";
  const addBtn = document.createElement("button");
  addBtn.textContent = "Add";
  addBtn.addEventListener("click", () => {
    changeQuantity(name, price, 1, container);
  });
  container.appendChild(addBtn);
}

// Shows the "- qty +" control (used when item IS in cart)
function renderQtyControls(container, name, price, quantity) {
  container.innerHTML = "";
  container.className = "qty-controls";

  const minusBtn = document.createElement("button");
  minusBtn.textContent = "−";
  minusBtn.addEventListener("click", () => {
    changeQuantity(name, price, -1, container);
  });

  const qtyText = document.createElement("span");
  qtyText.textContent = quantity;

  const plusBtn = document.createElement("button");
  plusBtn.textContent = "+";
  plusBtn.addEventListener("click", () => {
    changeQuantity(name, price, 1, container);
  });

  container.appendChild(minusBtn);
  container.appendChild(qtyText);
  container.appendChild(plusBtn);
}

// Central function: adjusts quantity up or down, updates cart + UI
function changeQuantity(name, price, delta, container) {
  const existingItem = cart.find(i => i.name === name);

  if (existingItem) {
    existingItem.quantity += delta;
    if (existingItem.quantity <= 0) {
      // Remove item entirely from cart
      cart = cart.filter(i => i.name !== name);
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

  stickyText.textContent = `${totalItems} items - ₹${total}`;
}

// PASTE OWNER'S NUMBER HERE (with country code, no + sign, no spaces)
const OWNER_WHATSAPP_NUMBER = "919036308008";

document.getElementById("placeOrderBtn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Please add at least one item before placing your order.");
    return;
  }

  const tableNumber = document.getElementById("tableNumber").value;

  // Build the message text
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

  // Encode the message so it's safe to put in a URL
  const encodedMessage = encodeURIComponent(message);

  // Build the WhatsApp link and open it
  const whatsappURL = `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${encodedMessage}`;
  window.open(whatsappURL, "_blank");
});