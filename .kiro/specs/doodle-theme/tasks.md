# Implementation Plan: Doodle Theme

## Overview

This plan implements the Doodle wedding invitation theme — a whimsical, hand-drawn/sketch-style template that replaces the existing Garden theme. The implementation creates `DoodleTemplate.tsx` as a self-contained React component with inline SVG decorations, Google Fonts (Caveat, Patrick Hand) via `next/font/google`, and integrates into the existing template routing system. The Garden theme is removed and all routing/API/dashboard references are updated.

## Tasks

- [x] 1. Remove Garden theme and update template routing infrastructure
  - [x] 1.1 Delete `src/components/templates/GardenTemplate.tsx` and update `src/app/(public)/[slug]/InvitationClient.tsx` to remove the GardenTemplate import and its conditional routing block (the `if (invitation.template === "garden")` block). Invitations with `template="garden"` will fall through to the default elegant template.
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 1.2 Update `src/app/api/invitations/[id]/template/route.ts` to replace `"garden"` with `"doodle"` in the `VALID_TEMPLATES` array so it becomes `["elegant", "spotify", "floral", "doodle"]`.
    - _Requirements: 2.5_

  - [x] 1.3 Update `src/app/(dashboard)/dashboard/[id]/edit/page.tsx` to replace the "garden" template option in the `templates` array inside `TemplateSection` with a new "doodle" entry: `{ id: "doodle", name: "Doodle", description: "Tema hand-drawn whimsical dengan warna beige & emerald green, ilustrasi doodle, dan font tulisan tangan", preview: "✏️", colors: "bg-gradient-to-br from-[#F5F0E8] to-[#d4e8d0]" }`.
    - _Requirements: 2.4_

- [x] 2. Create DoodleTemplate component foundation with Opening Screen
  - [x] 2.1 Create `src/components/templates/DoodleTemplate.tsx` with the component skeleton: "use client" directive, Google Font imports (Caveat with weights 400/700, Patrick_Hand with weight 400 via `next/font/google`), color constants object (`COLORS`), common SVG decoration props, the `DoodleTemplateProps` interface accepting `{ invitation: SerializedInvitation, guestName?: string | null }`, and the default export function `DoodleTemplate`. Include the `isOpened` state for opening screen transition. Import `SerializedInvitation` from `@/app/(public)/[slug]/InvitationClient`. Import `motion` and `AnimatePresence` from `framer-motion`.
    - _Requirements: 1.2, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 2.2 Implement the `DoodleOpeningScreen` sub-component inside `DoodleTemplate.tsx`: full-viewport cover (100vw × 100vh) with beige background (#F5F0E8), "Save the Date" text in Caveat font, groom & bride names in Caveat with emerald green (#047857), the `CoupleIllustration` inline SVG (two figures holding a heart with event date), conditional guest name display with "Kepada" prefix (shown when `guestName` is non-empty, hidden otherwise), "Open Invitation" button with emerald green background and wavy/sketchy border, and `CornerRibbon` SVG decorations in at least 2 corners. On button click, transition to main content with a fade-out animation (300-800ms).
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 5.1_

  - [x] 2.3 Implement the `DoodleDivider` sub-component: a hand-drawn wavy/sketchy SVG line separator using emerald green (#047857) stroke, no fill, stroke-width 1-2px, with `aria-hidden="true"` and `role="presentation"`. Use this divider between all adjacent content sections.
    - _Requirements: 5.2, 5.6, 5.7, 5.8_

  - [x] 2.4 Add the Doodle template routing in `src/app/(public)/[slug]/InvitationClient.tsx`: import `DoodleTemplate` from `@/components/templates/DoodleTemplate` and add a conditional block `if (invitation.template === "doodle") { return <DoodleTemplate invitation={invitation} guestName={guestName} />; }` before the default elegant template rendering.
    - _Requirements: 1.1, 1.6_

- [x] 3. Checkpoint - Ensure template routing works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement Doodle content sections (Quote, Couple Profiles, Countdown, Events)
  - [x] 4.1 Implement the Quote/Ayat section inside `DoodleTemplate.tsx`: display `quoteArabic` (RTL), `quoteText`, and `quoteSource` with Caveat font for decorative text, emerald green accents, and doodle heart accents near the heading. Conditionally render only when quote data exists. Include `LeafDoodle` SVG accents.
    - _Requirements: 1.3, 5.3, 5.4_

  - [x] 4.2 Implement the Couple Profiles section: side-by-side layout on ≥768px, stacked on mobile. Profile photos inside a `SketchyBorder` circular SVG frame (120-160px diameter). Doodle-style placeholder when photo is null. Display fullName (fallback to name), child order, and parent names conditionally. Hand-drawn ampersand/heart doodle between profiles.
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 14.2, 14.3_

  - [x] 4.3 Implement the `DoodleCountdown` sub-component: live countdown (days, hours, minutes, seconds) with Indonesian labels ("Hari", "Jam", "Menit", "Detik"), each unit inside a `SketchyBorder` rectangle, numbers in Caveat font with emerald green color, 1-second interval timer. When event date has passed, display "Acara telah berlangsung" in italic Caveat. Include leaf doodle accents.
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 5.4_

  - [x] 4.4 Implement the Events section with doodle cards: separate hand-drawn card containers for Akad and Resepsi (rendered only when date is provided), Indonesian locale date formatting ("DayName, DD MonthName YYYY"), time formatting ("HH:MM - HH:MM WIB" or "HH:MM WIB"), venue name/address, "Buka Maps" button with emerald green wavy border (opens in new tab), "Save the Date" button (Google Calendar URL for Android, ICS download for iOS/Desktop, hidden when event date has passed), and small doodle icons (ring for Akad, celebration for Resepsi).
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [x] 5. Implement remaining content sections (Gallery, Love Story, Gift, Comments, Share/Footer)
  - [x] 5.1 Implement the `DoodleGallery` sub-component: photo grid (2 columns on mobile, 3 on ≥768px), each photo in a hand-drawn frame with random rotation (-2 to 2 degrees), full-screen lightbox on click with close button, lazy-loading (200px threshold). Hide section entirely when gallery is empty.
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 14.2, 14.3_

  - [x] 5.2 Implement the `DoodleLoveStory` sub-component: vertical timeline with hand-drawn dashed/wavy connector line in emerald green, circle markers (12-16px), story cards with title in Caveat font, optional date in Indonesian locale, description in body text. Alternate left/right on desktop, single column on mobile. Hide section when no stories exist.
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 5.3 Implement the Gift section: hand-drawn border cards with bank name, account number (monospace font), account holder name. Copy button with hand-drawn styling that copies to clipboard and shows "Tersalin!" for 2 seconds. QRIS image display (max-width 200px) when URL provided. Hand-drawn bow/gift box doodle in header. Hide section when no gift accounts exist.
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 5.5_

  - [x] 5.4 Implement the `DoodleComments` sub-component: comment form with hand-drawn input borders (sketchy underlines/wavy borders), name field (max 100 chars), message field (max 500 chars), attendance selection ("Hadir", "Tidak Hadir", "Ragu-ragu"), submit button with emerald green and hand-drawn border. Display existing comments in speech bubble/card style (newest first) with guest name, message, attendance, date. Inline validation for empty required fields. Auto-poll every 5 seconds.
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 5.5 Implement the Share and Footer section: share buttons (Copy Link, WhatsApp, Telegram) with hand-drawn emerald green borders. Copy Link copies URL and shows confirmation for 2 seconds. WhatsApp opens share dialog with URL pre-filled. Telegram opens share dialog with URL pre-filled. "Terima Kasih" in Caveat font, couple names in Caveat, hashtag in emerald green (when provided), "Made with ♥" credit line. Include MusicPlayer component when `musicUrl` is provided.
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 6. Checkpoint - Ensure all sections render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Responsive design and accessibility polish
  - [x] 7.1 Review and ensure all sections in `DoodleTemplate.tsx` render without horizontal scrollbar at viewports 320px-1920px. Scale SVG decorations to no less than 50% on mobile. Ensure minimum font sizes (14px body, 18px headings). Ensure all interactive elements have minimum 44x44px touch targets on mobile. Add `aria-hidden="true"` and `role="presentation"` to all decorative SVGs. Ensure SVG decorations do not overlap interactive elements or body text.
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 5.8, 5.9, 4.8_

- [ ] 8. Property-based tests with fast-check
  - [ ]* 8.1 Install `fast-check` as a dev dependency. Write property test for conditional section visibility (Property 1): for any valid invitation data, sections with empty arrays (gallery, gifts, love stories) are not rendered, and sections with non-empty arrays are rendered.
    - **Property 1: Conditional section visibility based on data presence**
    - **Validates: Requirements 9.6, 10.1, 11.6**

  - [ ]* 8.2 Write property test for guest name conditional display (Property 2): for any non-empty guest name, opening screen displays "Kepada" + name; for null/empty, guest name section is not rendered.
    - **Property 2: Guest name conditional display**
    - **Validates: Requirements 3.5, 3.6**

  - [ ]* 8.3 Write property test for couple name fullName fallback (Property 3): displayed name equals fullName when non-null, or name when fullName is null.
    - **Property 3: Couple name display with fullName fallback**
    - **Validates: Requirements 6.4**

  - [ ]* 8.4 Write property test for parent info conditional display (Property 4): parent info renders if and only if at least one of (father, mother, childOrder) is provided.
    - **Property 4: Parent info conditional display**
    - **Validates: Requirements 6.5, 6.6**

  - [ ]* 8.5 Write property test for countdown calculation correctness (Property 5): for any future date, `days*86400 + hours*3600 + minutes*60 + seconds` equals floor of total seconds remaining (±1s tolerance); for past dates, returns isPast: true with all zeros.
    - **Property 5: Countdown calculation correctness**
    - **Validates: Requirements 7.1, 7.5**

  - [ ]* 8.6 Write property test for event date Indonesian locale formatting (Property 6): for any valid Date, formatted string matches "DayName, D MonthName YYYY" with Indonesian day/month names.
    - **Property 6: Event date formatting in Indonesian locale**
    - **Validates: Requirements 8.2**

  - [ ]* 8.7 Write property test for event time formatting (Property 7): for any start time and optional end time, output is "HH:MM - HH:MM WIB" (both provided) or "HH:MM WIB" (start only).
    - **Property 7: Event time formatting**
    - **Validates: Requirements 8.3**

  - [ ]* 8.8 Write property test for calendar event generation (Property 8): for any valid invitation with event date/time/location, generated calendar event contains wedding title, correct date, time range, and venue.
    - **Property 8: Calendar event generation preserves invitation data**
    - **Validates: Requirements 8.6**

  - [ ]* 8.9 Write property test for love story ordering (Property 9): for any array of love stories, rendered timeline displays stories in ascending order of their `order` field.
    - **Property 9: Love story ordering**
    - **Validates: Requirements 10.1**

  - [ ]* 8.10 Write property test for comments ordering (Property 10): for any array of comments, displayed list is ordered newest to oldest by `createdAt`.
    - **Property 10: Comments ordering**
    - **Validates: Requirements 12.3**

  - [ ]* 8.11 Write property test for form validation (Property 11): for any submission with empty name OR empty message, inline validation error is shown and other fields are not cleared.
    - **Property 11: Form validation rejects empty required fields**
    - **Validates: Requirements 12.5**

  - [ ]* 8.12 Write property test for share URL construction (Property 12): for any invitation URL, WhatsApp share URL contains URL-encoded invitation URL, and Telegram share URL contains URL-encoded invitation URL.
    - **Property 12: Share URL construction**
    - **Validates: Requirements 13.3, 13.4**

  - [ ]* 8.13 Write property test for conditional element rendering (Property 13): MusicPlayer renders iff musicUrl is non-null; hashtag renders iff hashtag is non-null; "Buka Maps" renders iff maps URL is non-null; QRIS renders iff qrisUrl is non-null.
    - **Property 13: Conditional element rendering based on data presence**
    - **Validates: Requirements 15.1, 15.2, 13.7, 8.5, 11.4**

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The implementation uses TypeScript with Next.js, Tailwind CSS, framer-motion, and Vitest + fast-check for testing
- All SVG decorations are inline (no external files) for zero additional network requests
- Google Fonts are loaded via `next/font/google` for optimal performance

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3"] },
    { "id": 3, "tasks": ["2.4"] },
    { "id": 4, "tasks": ["4.1", "4.2", "4.3", "4.4"] },
    { "id": 5, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5"] },
    { "id": 6, "tasks": ["7.1"] },
    { "id": 7, "tasks": ["8.1", "8.2", "8.3", "8.4", "8.5", "8.6", "8.7", "8.8", "8.9", "8.10", "8.11", "8.12", "8.13"] }
  ]
}
```
