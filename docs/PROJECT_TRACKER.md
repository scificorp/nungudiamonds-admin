# Project Tracker - Nungu Diamonds Admin Panel

**Last Updated:** January 18, 2026  
**GitHub Repo:** https://github.com/scificorp/nungudiamonds-admin

---

## Phase 1: Product Management & Rates (16 weeks)

### Week 1-2: Simplified Product Form (Enhanced)

| Issue | Title                                          | Status  | Owner |
| ----- | ---------------------------------------------- | ------- | ----- |
| #1    | Simplify Add Product Form - Single Page Layout | ✅ DONE | Dev   |
| #2    | Add Inline Validation to Product Form          | ✅ DONE | Dev   |
| #3    | Create Inline Category Creation Component      | ✅ DONE | Dev   |
| #4    | Create Drag-and-Drop Image Uploader            | ✅ DONE | Dev   |
| #5    | Add Gender Selection Field                     | ✅ DONE | Dev   |
| #6    | Add Ring Sizes Selection                       | ✅ DONE | Dev   |
| #7    | Add Chain Lengths Selection                    | ✅ DONE | Dev   |
| #8    | Add Metal Selection Section                    | ✅ DONE | Dev   |
| #9    | Add Diamond Selection Section                  | ✅ DONE | Dev   |
| #10   | Connect to API Endpoints                       | ✅ DONE | Dev   |

### Week 1-2 Accomplishments

✅ **Enhanced SimplifiedProductForm with:**

- Basic Info tab: Name, SKU, Category hierarchy, Description, Tags, Gender, Sizes, Lengths
- Metals & Diamonds tab: Metal card selection, Diamond karat selection
- Images tab: Drag-and-drop image upload
- Pricing tab: Making/Finding/Other charges, Eligibility toggles

✅ **API Integration:**

- ADD_PRODUCT_BASIC_DETAILS - Create product basic details
- ADD_PRODUCT_METAL_DIAMOND_DETAILS - Save metal/diamond selections
- METAL_MASTER_DROPDOWN - Load metal options
- CARAT_MASTER_DROPDOWN - Load karat options
- METAL_TONE_DROPDOWN - Load metal tone options

✅ **New Features:**

- Collapsible metal/diamond sections
- Multi-select for tags, gender, sizes, lengths
- Visual metal/diamond cards with selection state
- Purchase eligibility toggles (Purchasable Online / Price on Request / Consult to Purchase)

### Files Updated

```
src/components/product/SimplifiedProductForm.tsx  - Complete rewrite with all sections
src/services/AdminServices.ts                   - Fixed dropdown API calls
```

### Week 3-4: Enhanced Variants

| Issue | Title                          | Status     | Owner |
| ----- | ------------------------------ | ---------- | ----- |
| #11   | Build Variant Manager UI       | Partial RC | Dev   |
| #12   | Metal/Tone/Carat/Weight Fields | Partial RC | Dev   |
| #13   | Multi-Tone Metal Components    | Pending    | Dev   |

### Week 5-9: Rates Module

| Issue | Title                              | Status  | Owner |
| ----- | ---------------------------------- | ------- | ----- |
| #14   | Create FX Rate Management Page     | Pending | Dev   |
| #15   | Create Diamond Quality Matrix Page | Pending | Dev   |
| #16   | Enhance Metal Rate Page            | Pending | Dev   |
| #17   | Create Rate Configuration Page     | Pending | Dev   |
| #18   | Rate Change Audit Logging          | Pending | Dev   |

### Week 10-13: Diamond Model & Multi-Tone

| Issue | Title                            | Status  | Owner |
| ----- | -------------------------------- | ------- | ----- |
| #19   | Implement Atomic Diamond Fields  | Pending | Dev   |
| #20   | Build Pricing Calculator Service | Pending | Dev   |
| #21   | Multi-Tone Metal Components UI   | Pending | Dev   |

---

## Phase 2: Bookings (4 weeks)

| Issue | Title                        | Status  | Owner |
| ----- | ---------------------------- | ------- | ----- |
| #22   | Create Calendar View Page    | Pending | Dev   |
| #23   | Outlook Calendar Integration | Pending | Dev   |
| #24   | Fix Booking Email Templates  | Pending | Dev   |
| #25   | Booking Status Workflow      | Pending | Dev   |

---

## Phase 3: E-commerce (3 weeks)

| Issue | Title                     | Status  | Owner |
| ----- | ------------------------- | ------- | ----- |
| #26   | Eligibility Flags UI      | Pending | Dev   |
| #23   | Price Threshold Logic     | Pending | Dev   |
| #24   | Yoco Payment Verification | Pending | Dev   |

---

## Milestones

| Milestone                   | Target Date      | Status      |
| --------------------------- | ---------------- | ----------- |
| M1: Product Wizard Complete | Feb 15, 2026     | In Progress |
| M2: Rates Module Complete   | Mar 15, 2026     | -           |
| M3: Diamond Model Complete  | Apr 1, 2026      | -           |
| M4: Bookings Complete       | May 15, 2026     | -           |
| M5: E-commerce Complete     | Jun 1, 2026      | -           |
| **M6: GO-LIVE**             | **Jun 22, 2026** | -           |

---

## This Week's Progress

### Completed (Week 1)

1. ✅ Created simplified product form component
2. ✅ Added inline validation with error messages
3. ✅ Created inline category creation dialog
4. ✅ Integrated drag-and-drop image upload
5. ✅ Added new page to navigation
6. ✅ Created attribute service for inline creation

### Files Created

```
src/components/product/SimplifiedProductForm.tsx  - New simplified form
src/pages/product/simplified-add/index.tsx        - New page
src/services/AttributeService.ts                   - Attribute API service
src/components/common/InlineAttributeCreate.tsx    - Dialog component
docs/PROJECT_TRACKER.md                           - This tracker
```

### Files Modified

```
src/navigation/vertical/index.ts  - Added simplified product page
```

---

## Weekly Check-ins

### Week 1 (Jan 18-25)

- [x] Create simplified product form structure
- [x] Add inline validation
- [x] Create inline category component
- [x] Integrate drag-and-drop images
- [ ] Demo to client on Friday

### Next Week Plan

- Connect form to actual API endpoints
- Add remaining fields (tags, sizes, lengths)
- Add metal/diamond sections to form
- Test the complete flow

### Blockers

- None reported

### Notes

- New page accessible at: `/product/simplified-add`
- "Add product (Classic)" link still goes to original complex form
- Navigation order changed to highlight new simplified version first
