# E-Commerce Inventory Sync Pipeline

> Real-time bidirectional inventory synchronization between Shopify and Google Sheets using n8n.

## Overview

A production-ready n8n workflow that connects a Shopify storefront to a Google Sheets inventory tracker. When orders are placed, products are updated, or stock levels change in Shopify, the pipeline automatically reflects those changes in a structured spreadsheet — and vice versa.

### Features

- **Shopify → Sheets:** Order placed → stock decremented in Sheets automatically
- **Sheets → Shopify:** Inventory count updated in Sheets → Shopify product quantities synced
- **Conflict resolution:** Detects simultaneous edits and flags for review
- **Low-stock alerts:** Sends Slack/Discord notification when any SKU drops below threshold
- **Daily summary:** Automated end-of-day inventory report emailed to the store owner

### Business Value

- Eliminates 1-3 hours/day of manual inventory reconciliation
- Reduces overselling incidents to near-zero
- Cuts stockout duration by enabling faster reorder decisions
- Estimated savings: $500-1,500/month for a typical SMB

## Architecture

```
Shopify Store
    │
    ├── Webhook (product/update, orders/create)
    │       │
    │       ▼
    │   ┌──────────────────────────────────┐
    │   │         n8n Workflow Engine        │
    │   │                                    │
    │   │  ┌─────────┐  ┌───────────────┐   │
    │   │  │ Transform│  │ Conflict      │   │
    │   │  │ & Map    │  │ Resolution    │   │
    │   │  └────┬────┘  └───────┬───────┘   │
    │   │       │                │           │
    │   │  ┌────▼────┐  ┌───────▼───────┐   │
    │   │  │ Sheets  │  │ Alert Engine  │   │
    │   │  │ Update  │  │ (Low Stock)   │   │
    │   │  └─────────┘  └───────┬───────┘   │
    │   └───────────────────────┼───────────┘
    │                           │
    ▼                           ▼
Google Sheets               Slack/Discord
(Inventory Tracker)         (Notifications)
    ▲
    │
    ├── Manual stock update → n8n → Shopify sync
```

## Prerequisites

| Requirement | Purpose | Cost |
|------------|---------|------|
| n8n instance (self-hosted or Cloud) | Workflow engine | Free (self-hosted) or $20/mo |
| Shopify Partner account + Development Store | Test storefront with API access | Free |
| Google Cloud project + Service Account | Google Sheets API access | Free |
| Slack or Discord workspace | Notification delivery | Free |
| Gmail account | Daily report delivery | Free |

## Setup

### 1. Google Sheets Setup

1. Create a Google Cloud project at [console.cloud.google.com](https://console.cloud.google.com)
2. Enable the Google Sheets API
3. Create a Service Account and download the JSON credentials
4. Create a Google Sheet with these columns:

| SKU | Product Name | Current Stock | Reorder Level | Last Updated |
|-----|-------------|---------------|---------------|--------------|

5. Share the sheet with the Service Account email

### 2. Shopify Setup

1. Create a [Shopify Partner account](https://partners.shopify.com)
2. Create a Development Store with test products
3. Create a Custom App with permissions: `read_products`, `write_products`, `read_orders`
4. Note the Admin API access token
5. Set up webhooks for: `orders/create`, `products/update`

### 3. n8n Setup

1. Import the workflow JSON from `workflow.json`
2. Configure credentials:
   - Google Sheets API (Service Account)
   - Shopify Admin API
   - Slack/Discord webhook
3. Update the Google Sheet ID in the workflow nodes
4. Activate the workflow

### 4. Dashboard Setup

```bash
cd dashboard/
npm install
npm start
```

The dashboard runs on port 4200 and displays:
- Live sync status
- Recent sync events
- Low-stock alerts
- Daily summary

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
GOOGLE_SHEET_ID=1xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/xxx/xxx
REORDER_THRESHOLD=5
```

## Tech Stack

- **Workflow Engine:** n8n
- **E-Commerce:** Shopify REST/GraphQL API
- **Spreadsheet:** Google Sheets API
- **Notifications:** Slack Webhooks
- **Dashboard:** Angular 21 + Tailwind CSS

## Monetization

| Service | Price Range |
|---------|-------------|
| One-time setup | $300-800 |
| Monthly retainer | $100-300/mo |
| Template sale | $29-79 |
| Multi-store package | $1,500-3,000 |

## License

MIT
