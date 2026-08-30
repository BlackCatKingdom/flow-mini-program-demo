# FLOW — Booking & Membership Product Demo

FLOW is an **Independent Concept Project** designed and developed by SEEKBLACK to demonstrate a complete appointment-based digital product, including both the customer experience and merchant administration experience.

## Live Demo

- Customer: https://flow.seekblack.cn/
- Admin: https://flow.seekblack.cn/admin/

## Case Study

https://seekblack.cn/work/flow/

## What FLOW demonstrates

FLOW is not a static UI mockup. The demo is designed around a working booking flow and shared application state so a visitor can actually complete and inspect the product journey.

### Customer side

- Home
- Service list
- Service detail
- Date selection
- Time-slot selection
- Booking confirmation
- Booking result
- Order detail
- Member profile

### Merchant side

- Dashboard
- Booking management
- Order management
- Service configuration
- User / membership view
- Business settings

## Interaction model

The demo uses browser storage to keep the customer and admin experiences in sync. Service availability, booking state and business configuration can therefore visibly affect the other side of the product without requiring a production backend.

## Stack

- Semantic HTML
- CSS
- Vanilla JavaScript
- Hash-based client navigation
- `localStorage` / `sessionStorage` for demo state

## Important scope note

This repository demonstrates product architecture and interaction logic. It does not claim production payment, SMS, authentication or other third-party integrations that are not actually connected in the concept demo.

Source code is published for portfolio review. No open-source license is granted unless explicitly stated otherwise.
