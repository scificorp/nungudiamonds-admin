# Admin Portal User Guide

## Daily Entry Points

- Dashboard: review order status, revenue totals, and top-selling products.
- Product Orders: handle normal jewellery orders.
- Giftset Orders: handle curated gift-set orders.
- All Products: manage catalog status, featured/trending flags, and collection assignments.
- Quick Add Product: preferred product creation workflow.
- Bulk Upload: import larger product batches.

## Catalog Workflow

### Create A Product

1. Open `Catalog > Quick Add Product`.
2. Enter product name, SKU, short description, and long description.
3. Select the required category.
4. Add optional tags, gender, sizes, and lengths.
5. Add metal or diamond details when available.
6. Add product images when available.
7. Save as active only when the product is ready to publish.

Jewellery inventory is usually made to order. Do not treat missing stock as a catalog blocker unless the item is explicitly meant to be stocked.

### Manage Existing Products

Use `Catalog > All Products` for routine catalog operations:

- Search by name or SKU.
- Toggle active/inactive status.
- Toggle featured products for landing-page merchandising.
- Toggle trending products where campaign merchandising requires it.
- Assign products to collections when they belong to a campaign or curated range.
- Use the Variants tab in edit mode to add size and single-metal child variants. View mode keeps variant controls read-only.

Collections are optional merchandising groups. A product does not need to belong to a collection.

### Bulk Upload

Use `Catalog > Bulk Upload` when adding many products at once. If the import fails:

- Check required fields in the template.
- Confirm images are named consistently with the expected SKU/file mapping.
- Re-run validation before import.

## Orders And Enquiries

- Use `Orders > Product order` for normal orders.
- Use `Orders > Giftset order` for gift-set orders.
- Use `Enquiries > Product Enquiries` for product-specific customer interest.
- Use `Enquiries > General Enquiries` for non-product customer messages.

The dashboard order cards are queue indicators. Open the relevant order list when a count needs action.

## Merchandising And Content

Use `Merchandising & Content` to update public-facing homepage and campaign content:

- Hero Content: homepage hero media.
- Banner and Marketing Banner: homepage promotion areas.
- Home About Section and Features Sections: homepage support content.
- Stories, Testimonials, Blog, Static Pages: brand and informational content.

Preview public-facing content before saving when a preview is available. For hero-content troubleshooting, set `NEXT_PUBLIC_DEBUG_HERO_CONTENT=true` locally to enable verbose diagnostics.

## Configuration

Use configuration pages for controlled master data:

- Categories and attributes define catalog classification.
- Rates define pricing inputs.
- Roles and permissions define admin access.
- Country, currency, tax, and web config define operating settings.

Delete actions should be treated as administrative changes. Confirm the item is unused or safe to remove before deleting.
