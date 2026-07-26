# Paradise Cafe - Ordering Website

## How to run this project locally
1. Open this folder in VS Code
2. Open terminal (Terminal → New Terminal)
3. Run: python -m http.server 8000
4. Open browser and go to: http://localhost:8000/index.html
5. To stop the server: press Ctrl+C in the terminal

## Menu data
- Menu is stored in a Google Sheet, not in the code
- Sheet link (view-only, publish-to-web CSV): 
  https://docs.google.com/spreadsheets/d/e/2PACX-1vSL24iA2RQTpRyDr2Z_upfRle5XCCeG6TIG4EKv-f9WiVpXXyhaVd7pPyYJACbMR97Sv5x6mQ_3362i/pub?gid=409951925&single=true&output=csv
- To add/edit/remove menu items: just edit the Google Sheet directly, no code changes needed
- Columns: Category, Item, Price, Type (Veg/Non-Veg)

## Project status / progress log
- [x] Basic HTML page working
- [x] Menu pulled live from Google Sheet
- [x] Cart logic (add items, quantity, total)
- [x] WhatsApp order button
- [ ] Deploy live (not done yet)

## Notes
- No payment system needed (cash/counter payment only)
- No login system for customers
- Owner edits menu via Google Sheet only, no admin panel needed