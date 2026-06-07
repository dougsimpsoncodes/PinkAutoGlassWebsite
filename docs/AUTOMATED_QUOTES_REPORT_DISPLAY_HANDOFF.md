# Automated Quotes Report Display Handoff

Date: 2026-06-06

## Goal

Slim down the existing **Automated Quotes** admin report display without changing any data, notification logic, database tables, or API semantics.

This is a presentation-layer cleanup only.

## Current Issue

The report currently shows too much row-level detail at once:

- long details copy
- reason chips
- full comms breakdown
- action/signal columns
- duplicate operational state
- VIN/plate and vehicle diagnostics mixed into the main queue

The page became harder to scan as an operator queue.

## User Direction

Doug preferred the customer-first layout from the static mockups, specifically **Version 2** from:

`tmp/automated-quotes-customer-first-options.html`

Key direction:

- Customer should always be first.
- Keep useful columns because there is enough horizontal room.
- Include source, phone, email, vehicle, VIN/plate lookup, quote, stage, and timestamp.
- Do not include a comms column in the default table.
- Use timestamp, not relative age.
- Keep all data available in the modal/details view.

## Recommended Table

Implement this default column set:

`Customer | Source | Vehicle | Lookup | Quote | Stage | Timestamp`

Where the **Customer** cell stacks:

- customer name
- phone
- email

Recommended row behavior:

- Entire row or customer/name click opens existing quote modal.
- Do not add a separate `Action` column.
- Do not add a separate `Comms` column.
- Keep source visible as `Google Ads`, `Bing Ads`, `Homepage`, `Organic`, etc.
- Keep lookup visible as `VIN` or `PLATE` with the code underneath.
- Keep exact timestamp, for example `Jun 6, 10:43 AM`.

## Move/Keep In Modal

Keep these out of the default table and available in the existing modal:

- full communication history
- notification event details
- reason/confidence chips
- long details explanation
- supplier/brand/glass match details
- NAGS/product data
- full booking details
- session/campaign attribution details

## Mockup Files Created

These are static review artifacts only and are not part of production code:

- `tmp/automated-quotes-display-options.html`
- `tmp/automated-quotes-v4-options.html`
- `tmp/automated-quotes-customer-first-options.html`

The final preferred direction is **customer-first Version 2** from the last file.

## Resume Tomorrow

Start with `src/app/admin/dashboard/quotes/page.tsx`.

Suggested implementation scope:

1. Remove default table columns for `Type`, `Details`, `Comms`, and `Actions`.
2. Render `Customer` as a stacked cell with name, phone, and email.
3. Keep `Source`, `Vehicle`, `Lookup`, `Quote`, `Stage`, and `Timestamp`.
4. Preserve all existing data and modal behavior.
5. Re-run lint/build and do a production-safe visual check before deploy.
