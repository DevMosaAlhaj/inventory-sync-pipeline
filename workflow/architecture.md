# Architecture Diagram

## E-Commerce Inventory Sync Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│                        SHOPIFY STORE                             │
│                                                                  │
│  Webhook Events:                                                 │
│  • orders/create    → triggers stock decrement in Sheets         │
│  • products/update  → triggers stock sync to Sheets              │
└──────────────────────────┬───────────────────────────────────────┘
                           │ POST (webhook)
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                     n8n WORKFLOW ENGINE                           │
│                        (n8n.mosaahmad.com)                       │
│                                                                  │
│  ┌─────────────────────┐                                        │
│  │  WEBHOOK RECEIVERS   │                                        │
│  │  /shopify-order      │                                        │
│  │  /shopify-product    │                                        │
│  │  /sheets-update      │                                        │
│  └──────────┬──────────┘                                        │
│             │                                                    │
│             ▼                                                    │
│  ┌─────────────────────┐     ┌───────────────────────┐          │
│  │  DATA TRANSFORM      │     │  CONFLICT RESOLUTION   │          │
│  │  • Extract line items│     │  • Detect simultaneous │          │
│  │  • Map SKU to row    │     │    edits               │          │
│  │  • Calculate delta   │     │  • Flag for review     │          │
│  └──────────┬──────────┘     └───────────┬───────────┘          │
│             │                            │                       │
│             ▼                            ▼                       │
│  ┌───────────────────┐  ┌────────────────────────────┐          │
│  │  GOOGLE SHEETS     │  │  ALERT ENGINE               │          │
│  │  UPDATE            │  │  • Low stock check           │          │
│  │  • Update stock    │  │  • Threshold: configurable   │          │
│  │  • Log timestamp   │  │  • Route to Slack/Discord    │          │
│  └───────────────────┘  └────────────────────────────┘          │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  DAILY SUMMARY (Cron: 6:00 PM daily)                      │  │
│  │  • Total SKUs  • Out-of-stock count  • Low-stock items    │  │
│  │  • Sent to Slack #inventory-reports                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  REVERSE SYNC (Sheets → Shopify)                          │  │
│  │  • Webhook receives manual stock updates from Sheets       │  │
│  │  • Lookup Shopify variant by SKU                           │  │
│  │  • Update inventory level via Shopify Admin API            │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌───────────────┐  ┌────────────────────┐
│ GOOGLE SHEETS   │  │ SLACK/DISCORD │  │ SHOPIFY ADMIN API  │
│ Inventory Sheet │  │ Notifications │  │ Inventory Levels   │
│ SKU | Stock |   │  │ • #inventory  │  │ (via REST API)     │
│ Reorder | Date  │  │ • #reports    │  │                    │
└─────────────────┘  └───────────────┘  └────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    DASHBOARD (Angular)                            │
│  Live inventory table  •  Sync event log  •  Stock level bars   │
│  Stats cards  •  Low-stock alerts  •  Daily summaries           │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow Summary

| Flow | Trigger | Source | Destination | Action |
|------|---------|--------|-------------|--------|
| Order Decrement | Shopify webhook | Shopify orders | Google Sheets | Subtract ordered quantity from stock |
| Product Update | Shopify webhook | Shopify products | Google Sheets | Sync new stock level to Sheets |
| Manual Restock | Sheets webhook | Google Sheets | Shopify API | Update Shopify inventory level |
| Low Stock Alert | After Sheets write | n8n check | Slack | Send alert if stock ≤ threshold |
| Daily Summary | Cron (6PM daily) | Google Sheets | Slack | Post daily inventory report |
