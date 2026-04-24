# Loom Demo Script

## E-Commerce Inventory Sync Pipeline — 3-4 Minute Demo

### Hook (0:00-0:30)
"Here's how I eliminated manual inventory sync for a Shopify store using an n8n pipeline. Most small e-commerce businesses waste an hour every day manually copying stock numbers between their Shopify store and a spreadsheet. This pipeline makes that completely automatic — in both directions."

### The Setup (0:30-1:15)
- Show the Shopify dev store with test products
- Show the Google Sheet inventory tracker
- Show the n8n workflow canvas at n8n.mosaahmad.com
- Point out: "Three webhook endpoints — order created, product updated, and manual stock update from Sheets"

### Demo — Order Flow (1:15-2:00)
- Place a test order on Shopify for 2 units of "Wireless Bluetooth Headphones"
- Switch to the Google Sheet — watch the stock column decrement from 45 to 43 in real-time
- Switch to the dashboard — the sync event appears in the event log

### Demo — Low Stock Alert (2:00-2:30)
- Place an order that drives a product below the reorder threshold
- Show the Slack notification that fires automatically
- Point out: "The threshold is configurable — you set it once in the env variables"

### Demo — Bidirectional Sync (2:30-3:00)
- Open the Google Sheet
- Manually update the stock for "Wireless Mouse" from 3 to 25
- Switch to Shopify admin — the product quantity updates to 25 automatically
- Point out: "This is the reverse sync — warehouse staff can update the sheet and Shopify reflects it immediately"

### Architecture Walkthrough (3:00-3:30)
- Show the n8n workflow canvas
- Trace the flow: Webhook → Transform → Lookup SKU → Update Sheet → Check Low Stock → Alert
- Show the daily summary cron node
- Point out error handling and retry logic

### Close (3:30-4:00)
"This pipeline handles hundreds of SKUs and runs 24/7 on a self-hosted n8n instance — zero recurring costs. I can adapt it for WooCommerce, BigCommerce, or any platform with an API. The whole system is deployed in under a day."

---

## Screenshots to Capture

1. **n8n workflow canvas** — full pipeline with all nodes visible
2. **Google Sheet before/after** — stock column changing after an order
3. **Slack low-stock alert** — formatted notification with product details
4. **Shopify admin** — product quantity updating automatically
5. **Dashboard** — inventory table with stock level bars and sync events
6. **Daily summary Slack message** — end-of-day report

## Before Recording

- [ ] Ensure Shopify dev store has 10+ test products
- [ ] Google Sheet has all products with current stock
- [ ] n8n workflow is activated and running
- [ ] Slack workspace has #inventory-alerts and #inventory-reports channels
- [ ] Dashboard is running and showing live data
- [ ] Test the full order flow once to make sure everything works
