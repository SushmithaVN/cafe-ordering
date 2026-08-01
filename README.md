# Paradise Cafe - Ordering Website

A QR-code menu and ordering system for Paradise Cafe. Customers scan one QR code
(same code on every table), select their table number, browse the menu, add items
to a cart, and place their order via WhatsApp. No payment integration - orders are
paid for at the counter as usual.

Live site: https://sushmithavn.github.io/cafe-ordering/index.html

---

## How to run this project locally

1. Open this folder in VS Code
2. Open terminal (Terminal → New Terminal)
3. Run: `python -m http.server 8000`
4. Open browser and go to: http://localhost:8000/index.html
5. To stop the server: press Ctrl+C in the terminal

If you make changes and don't see them in the browser, do a hard refresh
(Ctrl+Shift+R) or open the page in an Incognito window - the browser often
caches old versions of the files.

---

## How to publish changes to the live site

The live link (GitHub Pages) only updates after you push your changes:

```
git add .
git commit -m "describe what you changed"
git push
```

Wait 30-60 seconds, then check the live link (hard refresh if it looks outdated).

---

## Project structure

```
cafe-ordering/
  index.html      -> page structure (welcome screen, menu, cart, sticky bar)
  style.css        -> all visual styling (Warm Bistro color palette)
  script.js        -> menu loading, filters, cart logic, WhatsApp ordering, order logging
  images/          -> logo + category banner photos
  README.md        -> this file
```

---

## Menu data (owner-editable, no code needed)

The entire menu lives in a Google Sheet, not in the code. The website fetches
it live every time it loads.

- **Menu sheet (edit this to change the menu):**
  https://docs.google.com/spreadsheets/d/1HS9WSwwZUh7TymcB7ABavl6qNWiyxlXHZJFpctGYhLM/edit?gid=409951925

- **Published CSV feed (used by the code, do not edit directly):**
  https://docs.google.com/spreadsheets/d/e/2PACX-1vSL24iA2RQTpRyDr2Z_upfRle5XCCeG6TIG4EKv-f9WiVpXXyhaVd7pPyYJACbMR97Sv5x6mQ_3362i/pub?gid=409951925&single=true&output=csv

**Columns:** `Category | Item | Price | Type`
- `Type` is `Veg`, `Non-Veg`, or `Other` (used for things like Cigarettes that
  aren't food - these don't get a veg/non-veg dot and are skipped by the
  Veg/Non-Veg filter buttons, only visible under "All")

**To add/edit/remove a menu item:** just edit the sheet directly - add a row,
change a price, delete a row. The website reflects it automatically, no code
changes needed.

**To pin a category to the top of the menu** (like Cigarettes currently is):
edit the `pinnedOrder` array near the top of the `buildMenu()` function in
`script.js`.

---

## Category photos

Each category can have a banner photo shown above its section. The code looks
for a file in the `images/` folder matching the category name, lowercase with
hyphens instead of spaces - e.g. category "Rice Bowl" -> `images/rice-bowl.jpg`

- Tries `.jpg` first, then falls back to `.png` automatically
- If neither file exists, the banner is simply hidden - nothing breaks

**Categories currently with photos:** Hot Beverage, Cold Coffee, Mojito,
Smoothies, Soda, Pizza, Rice Bowl, Starters, Momo, Rolls, Oil Fries, Corn,
Maggie, Burger, Noodles, Pasta, Cigarettes, Sandwich, Crispy Chicken

**Categories still without a photo:** none currently known - add any new
category's photo the same way (correct filename, correct folder) and it will
appear automatically.

---

## WhatsApp ordering

When a customer places an order, the site opens WhatsApp Web/App with a
pre-filled message addressed to the owner's number - the customer just taps
Send. This is the free "click-to-chat" method (`wa.me` links), not the paid
WhatsApp Business API, so there's no approval process and no per-message cost.

The owner's WhatsApp number is set in `script.js`:
```javascript
const OWNER_WHATSAPP_NUMBER = "919036308008";
```

---

## Order logging & sales analysis

Every time an order is placed, the details (table, item, quantity, price,
total, timestamp) are also silently logged to a separate Google Sheet, so the
owner can analyze sales over time - separate from the WhatsApp messages, which
are just for immediate kitchen notifications.

- **Orders Log sheet:** the spreadsheet named "Paradise Cafe Orders Log"
- **Logging endpoint (Apps Script Web App):**
  https://script.google.com/macros/s/AKfycbzmkk2c2YYk1u6KR82MuEDWAnz-ewvriIl-PMY_-b9ioueemcVpCIKP9NRjRItCBYBJKg/exec

### Viewing sales insights

The Orders Log spreadsheet has 3 pivot table tabs already set up:

1. **Bestsellers** - every item, sorted by quantity sold (highest first)
2. **Revenue per item** - quantity AND total ₹ earned per item, side by side
   (useful because the most-ordered item isn't always the highest earner)
3. **Daily revenue** - one row per calendar date with that day's total ₹,
   useful for spotting trends (busy days, slow days, week-over-week growth)

**To refresh these with the latest orders:** right-click anywhere inside a
pivot table → Refresh. Reopening the spreadsheet usually refreshes it too.

---

## Table number entry

Customers pick their table number on a welcome screen that appears before the
menu loads - they can't reach the menu without selecting one. This exists
because a single QR code is used for every table (rather than one QR code per
table), so the app needs to ask instead of already knowing.

They can change their selected table anytime via the "Change" link next to
the table badge in the header.

---

## Known limitations / things to know

- No payment integration - cash/counter payment only, by design
- No login system for customers - fully anonymous ordering
- WhatsApp ordering requires the customer to tap Send themselves (it's not
  fully silent/automatic) - this was a deliberate choice to avoid the cost and
  complexity of the WhatsApp Business API. Can be upgraded later if needed.
- Cigarettes section has no age-verification step - this is a legal/compliance
  consideration for the owner to handle at the counter, not something the
  website enforces
- Some menu photos are stand-ins per category, not per individual dish (150+
  items made individual photos impractical) - swap in real per-dish photos
  later by adding an Image column to the sheet, if ever wanted

---

## Progress log

- [x] Basic HTML page working
- [x] Menu pulled live from Google Sheet
- [x] Cart logic (add items, quantity +/-, running total)
- [x] WhatsApp order button
- [x] Deployed live on GitHub Pages
- [x] QR code generated pointing to live link
- [x] Search + Veg/Non-Veg filters
- [x] Category jump menu (bottom sheet, Zomato-style)
- [x] Welcome screen requiring table number before menu access
- [x] Order logging to Google Sheets
- [x] Cafe logo + Warm Bistro color palette
- [x] Category banner photos (jpg/png fallback)
- [x] Cigarettes section (no veg/non-veg dot, pinned to top)
- [x] Sales analysis pivot tables (bestsellers, revenue per item, daily revenue)
- [ ] Sandwich / Crispy Chicken photos are in - double check none are still missing
- [ ] Consider WhatsApp Business API for fully automatic order delivery (optional, costs money, needs Meta approval)
