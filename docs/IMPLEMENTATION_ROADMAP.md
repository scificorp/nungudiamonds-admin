# Implementation Roadmap - Nungu Diamonds Admin Panel

**Version:** 2.0 (Refined)  
**Date:** January 18, 2026  
**Based On:** PRD v1.0 & Client Decisions  
**Status:** Approved for Implementation

---

## Executive Summary

Based on the PRD requirements and client decisions, this roadmap outlines a 3-phase implementation plan over approximately 20 weeks, with admin panel taking precedence over front-end changes.

### Key Decisions Incorporated

| Decision | Resolution |
|----------|------------|
| FX Rate Source | **Manual** - No API integration initially |
| Diamond Pricing Model | **Multi-factor** - Carat + Cut + Color + Clarity |
| Calendar Integration | **Microsoft Outlook** - User's existing system + Internal view |
| Phase Order | Product Management → Rates → Bookings → Payments |

---

## Phase 1: Product Management & Rates (16 weeks)

### Epic A: Single Product Wizard (4 weeks)

#### Week 1-2: Simplified Product Form

| Task | Deliverable | Owner | Status |
|------|-------------|-------|--------|
| Simplify Add Product page | Single-page form with inline validation | Dev | Pending |
| Remove bulk upload dependency | Bulk remains as option, not requirement | Dev | Pending |
| Add real-time validation | Inline error messages | Dev | Pending |
| Category selector with inline add | Dropdown + "Add New" modal | Dev | Pending |

**Technical Tasks:**
- Refactor `/src/pages/product/add-products/index.tsx`
- Create `/src/components/product/SimplifiedProductForm.tsx`
- Add `/src/components/common/InlineAttributeCreate.tsx`

#### Week 2-3: Enhanced Image Upload

| Task | Deliverable | Owner | Status |
|------|-------------|-------|--------|
| Drag-and-drop uploader | Dropzone component with preview | Dev | Pending |
| Multi-select file upload | Select multiple files at once | Dev | Pending |
| Progress indicators | Upload progress bar | Dev | Pending |
| Keep ZIP as optional | Legacy support maintained | Dev | Pending |

**Technical Tasks:**
- Enhance `/src/customComponents/Form-Elements/file-upload/`
- Add `/src/components/product/ImageGallery.tsx`

#### Week 3-4: Inline Attributes

| Task | Deliverable | Owner | Status |
|------|-------------|-------|--------|
| Attribute creation modal | Modal form within product page | Dev | Pending |
| Diamond attributes first-class | Cut, Color, Clarity, Carat as explicit fields | Dev | Pending |
| Auto-suggest existing | Dropdown with search | Dev | Pending |

**Technical Tasks:**
- Create `/src/services/AttributeService.ts`
- Add API endpoint for inline attribute creation

---

### Epic B: Pricing Engine & Rates (5 weeks)

#### Week 5-6: FX Rate Management (NEW)

| Task | Deliverable | Owner | Status |
|------|-------------|-------|--------|
| FX Rate page | Dedicated page in Rates section | Dev | Pending |
| Manual rate entry | Number input with validation | Dev | Pending |
| Rate change history | Audit log with timestamp + user | Dev | Pending |
| Rate update confirmation | Modal for large changes | Dev | Pending |

**Database Changes:**
```sql
INSERT INTO `pricing_config` VALUES 
('fx_rate_manual', '18.50', 'Manual USD to ZAR exchange rate');
```

**New Page:** `/src/pages/rates/fx-rate/index.tsx`

#### Week 6-7: Diamond Quality Matrix (NEW)

| Task | Deliverable | Owner | Status |
|------|-------------|-------|--------|
| Quality matrix CRUD | Create/Edit/Delete matrix entries | Dev | Pending |
| Filter by stone type | Filter dropdowns | Dev | Pending |
| Shape multipliers | Pre-configured multipliers table | Dev | Pending |
| Price calculator | Live preview of price calculation | Dev | Pending |

**Database Changes:**
```sql
CREATE TABLE `diamond_quality_matrix` ( ... );
CREATE TABLE `diamond_shape_multipliers` ( ... );
```

**New Page:** `/src/pages/rates/diamond-rates/index.tsx`

#### Week 7-8: Enhanced Metal Rates

| Task | Deliverable | Owner | Status |
|------|-------------|-------|--------|
| Unified rates view | Group by metal type | Dev | Pending |
| Rate change logging | History table populated | Dev | Pending |
| Bulk rate update | Update multiple rates at once | Dev | Pending |

**Enhancement:** Update `/src/pages/settings/metal-rate-setting/`

#### Week 8: Rate Configuration

| Task | Deliverable | Owner | Status |
|------|-------------|-------|--------|
| Update cadence selector | Dropdown: Daily/Weekly/Monthly/Quarterly | Dev | Pending |
| Price threshold config | Number input for auto-flagging | Dev | Pending |
| Configuration save | Persist to `pricing_config` table | Dev | Pending |

**New Page:** `/src/pages/rates/configuration/index.tsx`

---

### Epic C: Diamond Configuration Model (2 weeks)

#### Week 9-10: Atomic Diamond Fields

| Task | Deliverable | Owner | Status |
|------|-------------|-------|--------|
| Decouple diamond groups | Store cut/color/clarity/carat separately | Dev | Pending |
| Quality matrix lookup | Replace rigid groups with matrix lookup | Dev | Pending |
| Backward compatibility | Migration script for existing data | Dev | Pending |

**Database Changes:**
```sql
ALTER TABLE `product_diamond_options` ADD COLUMN `id_shape`, `id_color`, `id_clarity`, `id_cut`, `carat_weight`;
```

#### Week 10: Carat-Based Selection

| Task | Deliverable | Owner | Status |
|------|-------------|-------|--------|
| Carat as primary | Customer sees carat, not MM | Dev | Pending |
| MM size reference | Store MM for internal reference | Dev | Pending |
| Price per carat display | Show in admin panel | Dev | Pending |

---

### Epic D: Multi-Tone Metals (2 weeks)

#### Week 11-12: Component-Based Metals

| Task | Deliverable | Owner | Status |
|------|-------------|-------|--------|
| Multiple metal rows | UI for adding multiple metals | Dev | Pending |
| Weight per component | Input for each metal's weight | Dev | Pending |
| Auto-calculation | Sum of component costs | Dev | Pending |
| Display as "Dual Tone" | Single display name for customer | Dev | Pending |

**Database Changes:**
```sql
CREATE TABLE `product_metal_components` ( ... );
```

**New Component:** `/src/components/product/MetalComponentsManager.tsx`

---

### Phase 2: Bookings (4 weeks)

#### Week 13-14: Calendar Integration

| Task | Deliverable | Owner | Status |
|------|-------------|-------|--------|
| Calendar view | Monthly calendar with bookings | Dev | Pending |
| Outlook sync | Create events via Graph API | Dev | Pending |
| ICS download | Generate .ics files | Dev | Pending |
| Google Calendar | Add Google Calendar links | Dev | Pending |

**New Pages:**
- `/src/pages/bookings/calendar/index.tsx`
- `/src/pages/bookings/all/index.tsx`

**Service:** `/src/services/outlookCalendar.ts`

#### Week 14-15: Booking Emails

| Task | Deliverable | Owner | Status |
|------|-------------|-------|--------|
| Fix email templates | Correct placeholders | Dev | Pending |
| Add calendar links | ICS + Google + Outlook in email | Dev | Pending |
| Customer confirmation | Rich HTML email template | Dev | Pending |
| Admin notification | Internal notification | Dev | Pending |

#### Week 15-16: Admin Workflow

| Task | Deliverable | Owner | Status |
|------|-------------|-------|--------|
| Status tracking | New/Confirmed/Completed/No-show | Dev | Pending |
| Notes field | Free-text notes per booking | Dev | Pending |
| Quick actions | One-click status changes | Dev | Pending |
| Slot management | Define available time slots | Dev | Pending |

---

### Phase 3: E-commerce Enablement (3 weeks)

#### Week 17-18: Eligibility Rules

| Task | Deliverable | Owner | Status |
|------|-------------|-------|--------|
| Eligibility flags UI | Checkboxes per product | Dev | Pending |
| Threshold auto-flag | Products above threshold flagged | Dev | Pending |
| Bulk eligibility update | Update multiple products | Dev | Pending |

**Database Changes:**
```sql
ALTER TABLE `products` ADD COLUMN `is_purchasable_online`, `is_price_on_request`, `is_consult_to_purchase`;
```

#### Week 18-19: Payment Integration

| Task | Deliverable | Owner | Status |
|------|-------------|-------|--------|
| Yoco verification | Confirm eligibility works | Dev | Pending |
| Deposit logic | Partial payment support | Dev | Pending |
| Checkout flow | End-to-end test | Dev | Pending |

#### Week 19-20: Final Integration & Testing

| Task | Deliverable | Owner | Status |
|------|-------------|-------|--------|
| End-to-end testing | All flows tested | QA | Pending |
| Bug fixes | Critical/High issues resolved | Dev | Pending |
| User acceptance | Client sign-off | All | Pending |
| Documentation | User guides completed | Tech Writer | Pending |

---

## Detailed Timeline

```
MONTH 1 (Weeks 1-4)
├── Week 1: Simplified Product Form
├── Week 2: Image Upload + Inline Attributes  
├── Week 3: Inline Attributes Completion
└── Week 4: Product Wizard Review

MONTH 2 (Weeks 5-8)
├── Week 5: FX Rate + Diamond Quality Matrix
├── Week 6: Diamond Quality Matrix Completion
├── Week 7: Enhanced Metal Rates
└── Week 8: Rate Configuration

MONTH 3 (Weeks 9-12)
├── Week 9: Atomic Diamond Fields
├── Week 10: Carat-Based Selection + Multi-Tone Metals
├── Week 11: Multi-Tone Metals Completion
└── Week 12: Phase 1 Testing + Bug Fixes

MONTH 4 (Weeks 13-16)
├── Week 13: Calendar View + Outlook Integration
├── Week 14: Email Fixes + Calendar Links
├── Week 15: Booking Admin Workflow
└── Week 16: Phase 2 Testing + Bug Fixes

MONTH 5 (Weeks 17-20)
├── Week 17: Eligibility Rules
├── Week 18: Payment Integration
├── Week 19: Final Integration
└── Week 20: UAT + Sign-off
```

---

## Resource Requirements

### Development Team

| Role | Quantity | Allocation |
|------|----------|------------|
| Senior Frontend Developer | 1 | 100% |
| Backend Developer | 1 | 100% |
| Full Stack Developer | 1 | 50% |
| QA Engineer | 1 | 50% |
| Tech Lead | 0.25 | Review & Guidance |

### External Dependencies

| Dependency | Required By | Timeline |
|------------|-------------|----------|
| Microsoft Graph API Access | Week 13 | Before Phase 2 |
| AWS Amplify Config | Week 1 | Before Start |
| Outlook OAuth Credentials | Week 13 | 2 weeks before Phase 2 |

---

## Milestone Dates

| Milestone | Target Date | Deliverables |
|-----------|-------------|--------------|
| M1: Product Wizard Complete | Feb 15, 2026 | Simplified product add/edit |
| M2: Rates Module Complete | Mar 15, 2026 | FX, Metal, Diamond rates |
| M3: Diamond Model Complete | Apr 1, 2026 | Atomic fields, carat-based |
| M4: Multi-Tone Complete | Apr 15, 2026 | Component-based metals |
| M5: Bookings Complete | May 15, 2026 | Calendar, Outlook, emails |
| M6: E-commerce Complete | Jun 1, 2026 | Eligibility, payments |
| M7: UAT Sign-off | Jun 15, 2026 | Client acceptance |
| **M8: GO-LIVE** | **Jun 22, 2026** | **Production Release** |

---

## Success Criteria

### Phase 1 (Product + Rates)
- [ ] Admin can add product without Excel bulk upload
- [ ] All 100+ debug console statements removed
- [ ] Rates editable in dedicated admin section
- [ ] Diamond pricing uses multi-factor model
- [ ] Multi-tone metals supported

### Phase 2 (Bookings)
- [ ] Calendar view displays bookings
- [ ] Outlook calendar sync works
- [ ] Booking emails have correct data
- [ ] ICS/calendar links work

### Phase 3 (E-commerce)
- [ ] Products have correct eligibility flags
- [ ] Price on request threshold works
- [ ] Yoco payment flow functional

---

## Communication Plan

### Weekly
- Progress report every Friday
- Blockers raised within 24 hours
- Status update in Slack channel

### Bi-Weekly
- Demo session with client
- Roadmap review and adjustment

### Monthly
- Formal progress report
- Budget review
- Risk assessment

---

## Document References

| Document | Location |
|----------|----------|
| Technical Specification | `/docs/TECHNICAL_SPECIFICATION.md` |
| Bug Report | `/ADMIN_PANEL_BUG_REPORT.md` |
| API Documentation | `/docs/api/` (to be created) |
| Database Schema | `/docs/technical/database-schema.md` (to be created) |
| Deployment Guide | `/docs/deployment/` (to be created) |

---

**Document Version:** 2.0  
**Approved By:** [Client Representative]  
**Approval Date:** _______________

**Next Steps:**
1. Client review and sign-off on roadmap
2. Finalize resource allocation
3. Begin Week 1 implementation
4. Set up project tracking (Jira/Linear)
