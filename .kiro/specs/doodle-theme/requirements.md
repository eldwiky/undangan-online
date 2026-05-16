# Requirements Document

## Introduction

This feature introduces a new wedding invitation theme called "Doodle" — a whimsical, hand-drawn/sketch-style template that replaces the existing "Garden" theme. The Doodle theme features a beige/cream background with emerald green accent lines, hand-drawn SVG decorations (ribbons, bows, wavy borders, doodle hearts), hand-written typography, and a playful couple illustration. The theme maintains all existing invitation sections (Opening, Quote, Couple Profiles, Countdown, Events, Gallery, Love Story, Gift, Comments, Share, Footer) while delivering a visually stunning, creative aesthetic that feels personal and artisanal.

## Glossary

- **Doodle_Template**: The React component (`DoodleTemplate.tsx`) that renders the complete wedding invitation in a hand-drawn/sketch visual style
- **Opening_Screen**: The initial full-screen view displayed before the guest opens the invitation, featuring couple names, event date, a couple illustration holding a heart, "Save the Date" text, and an "Open" button
- **Doodle_Decoration**: Hand-drawn SVG elements used throughout the template including corner ribbons, wavy borders, sketchy lines, doodle hearts, bows, and leaf doodles
- **Template_Router**: The routing logic in `InvitationClient.tsx` that selects which template component to render based on the `invitation.template` field
- **Hand_Written_Font**: Google Fonts with a hand-written aesthetic (e.g., "Caveat", "Patrick Hand") used for headings and decorative text
- **Color_Palette**: The theme's color scheme consisting of beige/cream background (#F5F0E8), emerald green accents (#047857), and complementary tones
- **Section_Divider**: A hand-drawn style separator element used between invitation sections, replacing standard geometric dividers
- **Couple_Illustration**: An SVG illustration of a couple holding a heart with the wedding date inside, displayed on the Opening Screen

## Requirements

### Requirement 1: Doodle Template Component Creation

**User Story:** As a wedding couple, I want to select a "doodle" theme for my invitation, so that my guests receive a whimsical, hand-drawn style digital invitation that feels personal and creative.

#### Acceptance Criteria

1. WHEN the invitation template field is set to "doodle", THE Template_Router SHALL render the Doodle_Template component
2. THE Doodle_Template SHALL accept props of type `{ invitation: SerializedInvitation, guestName?: string | null }`
3. THE Doodle_Template SHALL render all invitation sections: Opening Screen, Quote/Ayat, Couple Profiles, Countdown, Events, Gallery, Love Story, Gift, Comments, Share, and Footer
4. THE Doodle_Template SHALL use framer-motion for scroll-triggered animations consistent with existing templates
5. THE Doodle_Template SHALL be exported as the default export from `src/components/templates/DoodleTemplate.tsx`
6. THE Template_Router SHALL import DoodleTemplate and add a conditional check before the default elegant template rendering

### Requirement 2: Remove Garden Theme

**User Story:** As a developer, I want to remove the Garden theme from the codebase, so that the template options are streamlined and the Doodle theme replaces it.

#### Acceptance Criteria

1. WHEN the Doodle_Template is implemented, THE System SHALL delete the `GardenTemplate.tsx` file from `src/components/templates/` and remove all import references to `GardenTemplate` from `src/app/(public)/[slug]/InvitationClient.tsx`
2. THE Template_Router in `src/app/(public)/[slug]/InvitationClient.tsx` SHALL NOT contain a conditional rendering block for the "garden" template value
3. IF an invitation has template value "garden", THEN THE Template_Router SHALL render the default elegant template (the inline template defined in InvitationClient.tsx) instead of returning an error or blank page
4. THE dashboard edit page SHALL NOT display "garden" as a selectable template option in the template picker
5. THE template API route SHALL NOT include "garden" in the VALID_TEMPLATES array

### Requirement 3: Opening Screen with Doodle Aesthetic

**User Story:** As a wedding guest, I want to see a beautiful hand-drawn opening screen with the couple's names and a playful illustration, so that I feel the personal touch before entering the invitation.

#### Acceptance Criteria

1. THE Opening_Screen SHALL display a full-viewport cover (100vw × 100vh) with beige/cream background color (#F5F0E8)
2. THE Opening_Screen SHALL display "Save the Date" text rendered in Hand_Written_Font style
3. THE Opening_Screen SHALL display the groom and bride names in Hand_Written_Font with emerald green (#047857) color
4. THE Opening_Screen SHALL display the Couple_Illustration SVG showing two figures holding a heart containing the event date
5. IF the URL query parameter "to" is provided with a non-empty value, THEN THE Opening_Screen SHALL display the guest name with a "Kepada" prefix
6. IF the URL query parameter "to" is absent or empty, THEN THE Opening_Screen SHALL hide the guest name section and display the remaining content without a gap
7. THE Opening_Screen SHALL display an "Open Invitation" button with emerald green (#047857) background, white text, and a visible irregular (wavy or sketched) border to simulate a hand-drawn appearance
8. WHEN the guest clicks the "Open Invitation" button, THE Opening_Screen SHALL transition to the main invitation content with a fade-out animation lasting between 300ms and 800ms
9. THE Opening_Screen SHALL include Doodle_Decoration elements (corner ribbons, small doodle hearts, wavy border accents) positioned within 48px of the viewport edges on each corner

### Requirement 4: Color Palette and Typography

**User Story:** As a wedding couple, I want my invitation to have a cohesive hand-drawn look with warm beige tones and emerald green accents, so that the design feels unified and aesthetically pleasing.

#### Acceptance Criteria

1. THE Doodle_Template SHALL use #F5F0E8 (beige/cream) as the primary background color
2. THE Doodle_Template SHALL use #047857 (emerald green) as the primary accent color for borders, lines, and decorative elements
3. THE Doodle_Template SHALL use #065F46 (dark emerald) for primary text headings
4. THE Doodle_Template SHALL use #374151 (dark gray) for body text content
5. THE Doodle_Template SHALL load and apply "Caveat" Google Font (weight 400 and 700) for decorative headings and hand-written style text
6. THE Doodle_Template SHALL load and apply "Patrick Hand" Google Font (weight 400) as a secondary hand-written font for subheadings
7. THE Doodle_Template SHALL use a system serif font stack (Georgia, "Times New Roman", serif) as fallback for body text and as fallback when Google Fonts fail to load
8. THE Doodle_Template SHALL maintain a minimum WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text) between all text colors and their background colors

### Requirement 5: Hand-Drawn SVG Decorations

**User Story:** As a wedding guest, I want to see charming hand-drawn decorations throughout the invitation, so that the entire experience feels like receiving a personally illustrated card.

#### Acceptance Criteria

1. THE Doodle_Template SHALL include corner ribbon SVG decorations on the Opening Screen in at least 2 of the 4 corners
2. THE Doodle_Template SHALL render a wavy/sketchy line SVG Section_Divider between each pair of adjacent content sections
3. THE Doodle_Template SHALL include doodle heart SVGs (16px to 32px in width and height) as accent decorations positioned within 24px of couple names and section headings without overlapping text content
4. THE Doodle_Template SHALL include hand-drawn leaf or botanical doodle SVGs as background accents in at least 3 sections
5. THE Doodle_Template SHALL include a hand-drawn bow or ribbon SVG decoration in the gift section header area
6. THE Doodle_Template SHALL render all Doodle_Decoration elements using emerald green (#047857) stroke color with no fill (outline style)
7. THE Doodle_Template SHALL use stroke-width between 1px and 2px for all Doodle_Decoration elements
8. THE Doodle_Template SHALL render all Doodle_Decoration SVG elements with `aria-hidden="true"` and `role="presentation"` so they are ignored by screen readers
9. THE Doodle_Template SHALL position all Doodle_Decoration elements so they do not overlap or obscure interactive elements (buttons, links, form inputs) or body text content

### Requirement 6: Couple Profiles Section

**User Story:** As a wedding guest, I want to see the couple's profiles presented in a charming doodle style, so that I can learn about the bride and groom in a visually engaging way.

#### Acceptance Criteria

1. THE Doodle_Template SHALL display groom and bride profiles in a side-by-side layout on viewports 768px and above, and in a vertically stacked layout on viewports below 768px
2. THE Doodle_Template SHALL render profile photos inside a hand-drawn circular border (sketchy circle SVG frame) with a rendered diameter between 120px and 160px
3. WHEN a profile photo is not provided (groomPhoto or bridePhoto is null), THE Doodle_Template SHALL display a doodle-style placeholder illustration rendered in emerald green outline style consistent with other Doodle_Decoration elements
4. THE Doodle_Template SHALL display the full name (groomFullName / brideFullName) in Hand_Written_Font with emerald green (#047857) color; IF groomFullName or brideFullName is not provided, THEN THE Doodle_Template SHALL fall back to displaying groomName or brideName respectively
5. IF parent names (groomFather, groomMother, brideFather, brideMother) and child order (groomChildOrder, brideChildOrder) are provided, THEN THE Doodle_Template SHALL display the child order text followed by parent names below each profile
6. IF parent names and child order are not provided for a profile, THEN THE Doodle_Template SHALL hide the parent information subsection for that profile without leaving empty space
7. THE Doodle_Template SHALL include a hand-drawn ampersand "&" or heart doodle rendered in emerald green (#047857) outline style, positioned between the two profiles (horizontally centered on desktop, vertically centered between stacked profiles on mobile)

### Requirement 7: Countdown Section with Doodle Style

**User Story:** As a wedding guest, I want to see a countdown to the wedding day styled with the hand-drawn aesthetic, so that I feel the excitement building up to the event.

#### Acceptance Criteria

1. THE Doodle_Template SHALL display a live countdown showing days, hours, minutes, and seconds until the event date, with each unit labeled in Indonesian ("Hari", "Jam", "Menit", "Detik")
2. THE Doodle_Template SHALL render each countdown unit inside a hand-drawn box (sketchy rectangle SVG border with irregular stroke paths)
3. THE Doodle_Template SHALL display countdown numbers in Hand_Written_Font with emerald green color (#047857)
4. THE Doodle_Template SHALL update the countdown every 1 second using a client-side interval timer
5. WHEN the event date has passed, THE Doodle_Template SHALL hide the countdown boxes and display "Acara telah berlangsung" message in italic Hand_Written_Font with emerald green color
6. WHEN the countdown reaches zero while the guest is viewing the page, THE Doodle_Template SHALL transition from the countdown display to the "Acara telah berlangsung" message within 1 second of the event date passing

### Requirement 8: Events Section with Doodle Cards

**User Story:** As a wedding guest, I want to see the event details (Akad and Resepsi) presented in hand-drawn card style, so that I can easily find the date, time, and location information.

#### Acceptance Criteria

1. THE Doodle_Template SHALL display Akad and Resepsi events in separate hand-drawn card containers with sketchy borders, rendering each card only when its corresponding event date (akadDate or resepsiDate) is provided
2. THE Doodle_Template SHALL display event date formatted in Indonesian locale using the pattern "DayName, DD MonthName YYYY" (e.g., "Sabtu, 15 Maret 2025")
3. THE Doodle_Template SHALL display event time as "HH:MM - HH:MM WIB" using the start time and end time fields, or "HH:MM WIB" if only the start time is provided
4. THE Doodle_Template SHALL display venue name and address on separate lines within each event card
5. WHEN a maps URL is provided, THE Doodle_Template SHALL display a "Buka Maps" button styled with emerald green and hand-drawn border that opens the URL in a new browser tab
6. THE Doodle_Template SHALL include a "Save the Date" button that creates a calendar event containing the event title (groom and bride names), event date, time range, and venue name with address as the location (Google Calendar URL for Android, ICS file download for iOS/Desktop)
7. IF the event date has passed, THEN THE Doodle_Template SHALL hide the "Save the Date" button for that event
8. THE Doodle_Template SHALL include small doodle icons sized between 24px and 32px (ring icon for Akad, celebration icon for Resepsi) drawn in emerald green outline style

### Requirement 9: Gallery Section

**User Story:** As a wedding couple, I want to showcase our photos in a gallery that matches the doodle aesthetic, so that our memories are presented beautifully within the theme.

#### Acceptance Criteria

1. WHEN gallery photos exist, THE Doodle_Template SHALL display photos in a grid layout with 2 columns on viewports below 768px and 3 columns on viewports 768px and above
2. THE Doodle_Template SHALL render each photo inside a hand-drawn frame consisting of a sketchy rectangle border with a random rotation between -2 and 2 degrees per photo
3. WHEN a guest clicks a photo, THE Doodle_Template SHALL display a full-screen lightbox overlay showing the selected photo scaled to fit within the viewport
4. WHEN the lightbox is open, IF the guest clicks the close button or clicks outside the photo area, THEN THE Doodle_Template SHALL dismiss the lightbox and return to the gallery view
5. THE Doodle_Template SHALL lazy-load gallery images by deferring loading until each image is within 200px of the visible viewport
6. IF the invitation has zero gallery photos, THEN THE Doodle_Template SHALL hide the gallery section entirely

### Requirement 10: Love Story Timeline

**User Story:** As a wedding couple, I want to share our love story in a timeline format with doodle decorations, so that guests can follow our journey together.

#### Acceptance Criteria

1. WHEN love stories exist, THE Doodle_Template SHALL display stories in a vertical timeline layout ordered by the story's order field ascending
2. THE Doodle_Template SHALL render the timeline connector as a hand-drawn dashed or wavy line in emerald green (#047857) with stroke-width between 1px and 2px
3. THE Doodle_Template SHALL render each story node with a hand-drawn circle marker of 12px to 16px diameter in emerald green (#047857)
4. THE Doodle_Template SHALL display story title in Hand_Written_Font, story date (when provided) formatted in Indonesian locale below the title, and description in body text
5. THE Doodle_Template SHALL alternate story cards left and right on desktop (768px and above), and stack vertically in a single column on mobile (below 768px)
6. IF a love story entry has no date value, THEN THE Doodle_Template SHALL display the story card without a date line while preserving the title and description layout

### Requirement 11: Gift Section with Doodle Style

**User Story:** As a wedding couple, I want to display our gift/bank account information in the doodle style, so that guests who wish to send gifts can do so easily.

#### Acceptance Criteria

1. WHEN gift accounts exist, THE Doodle_Template SHALL display bank account cards with hand-drawn borders using emerald green (#047857) stroke
2. THE Doodle_Template SHALL display bank name, account number (in monospace font), and account holder name on each card
3. THE Doodle_Template SHALL include a copy button for the account number with hand-drawn button styling; WHEN clicked, THE button SHALL copy the account number to clipboard and display "Tersalin!" confirmation text for 2 seconds before reverting to "Salin"
4. WHEN a QRIS URL is provided, THE Doodle_Template SHALL display the QRIS image with max-width of 200px centered within the card
5. THE Doodle_Template SHALL include a hand-drawn bow or gift box doodle decoration in the section header area
6. IF the invitation has zero gift accounts, THEN THE Doodle_Template SHALL hide the gift section entirely

### Requirement 12: Comments/RSVP Section

**User Story:** As a wedding guest, I want to leave wishes and confirm my attendance in a form that matches the doodle theme, so that my interaction feels cohesive with the invitation design.

#### Acceptance Criteria

1. THE Doodle_Template SHALL display a comment form with hand-drawn style input borders using sketchy underlines or wavy borders on all input fields
2. THE Doodle_Template SHALL include a guest name text field (maximum 100 characters), a message text field (maximum 500 characters), and an attendance selection with three options: "Hadir", "Tidak Hadir", and "Ragu-ragu"
3. THE Doodle_Template SHALL display existing comments in hand-drawn speech bubble or card style, ordered from newest to oldest, showing guest name, message, attendance status, and submission date
4. THE Doodle_Template SHALL style the submit button with emerald green background and hand-drawn border effect
5. IF the guest submits the form with an empty name or empty message, THEN THE Doodle_Template SHALL display an inline validation error message indicating the missing required field without clearing the other filled fields
6. THE Doodle_Template SHALL auto-poll for new comments every 5 seconds after the invitation is opened

### Requirement 13: Footer and Share Section

**User Story:** As a wedding couple, I want the invitation to end with a thank-you message and sharing options in the doodle style, so that guests can easily share the invitation with others.

#### Acceptance Criteria

1. THE Doodle_Template SHALL display share buttons for Copy Link, WhatsApp, and Telegram with hand-drawn button styling using emerald green (#047857) sketchy borders
2. WHEN a guest clicks the Copy Link button, THE Doodle_Template SHALL copy the current invitation URL to the clipboard and display a confirmation indicator for 2 seconds
3. WHEN a guest clicks the WhatsApp share button, THE Doodle_Template SHALL open the WhatsApp share dialog with the invitation URL pre-filled in the message
4. WHEN a guest clicks the Telegram share button, THE Doodle_Template SHALL open the Telegram share dialog with the invitation URL pre-filled in the message
5. THE Doodle_Template SHALL display a static thank-you message ("Terima Kasih") in Hand_Written_Font
6. THE Doodle_Template SHALL display the couple's names (groom and bride) in Hand_Written_Font as the last content element before the credit line
7. WHEN a hashtag is provided, THE Doodle_Template SHALL display the hashtag in emerald green (#047857) color in Hand_Written_Font
8. THE Doodle_Template SHALL include a "Made with ♥" credit line at the bottom as the final element of the page

### Requirement 14: Responsive Design

**User Story:** As a wedding guest, I want the doodle invitation to look great on my phone, tablet, or desktop, so that I have a good experience regardless of my device.

#### Acceptance Criteria

1. THE Doodle_Template SHALL render without horizontal scrollbar and without content overflow or clipping at any viewport width between 320px and 1920px
2. WHILE the viewport width is below 768px, THE Doodle_Template SHALL use a single-column layout for all sections including Couple Profiles, Events cards, Gallery grid (2 columns), and Love Story timeline
3. WHILE the viewport width is 768px or above, THE Doodle_Template SHALL use multi-column layouts for Couple Profiles (side-by-side), Gallery grid (3 columns), and Love Story timeline (alternating left-right)
4. WHILE the viewport width is below 768px, THE Doodle_Template SHALL scale Doodle_Decoration SVG elements to no less than 50% of their desktop size while maintaining aspect ratio
5. THE Doodle_Template SHALL maintain a minimum font size of 14px for body text and 18px for section headings across all viewport sizes
6. WHILE the viewport width is below 768px, THE Doodle_Template SHALL render all interactive elements (buttons, form inputs, links) with a minimum touch target size of 44x44 CSS pixels

### Requirement 15: Music Player Integration

**User Story:** As a wedding couple, I want background music to play when guests open the invitation, so that the experience is immersive and emotional.

#### Acceptance Criteria

1. WHEN a musicUrl is provided in the invitation data, THE Doodle_Template SHALL render the MusicPlayer component with the specified audio source
2. IF no musicUrl is provided, THEN THE Doodle_Template SHALL NOT render the MusicPlayer component
3. WHEN the guest clicks the "Open" button on the opening screen, THE MusicPlayer SHALL attempt to auto-play the music in a continuous loop
4. IF the browser blocks auto-play, THEN THE MusicPlayer SHALL display the toggle button in a paused state so the guest can manually start playback
5. THE MusicPlayer SHALL provide a fixed-position toggle button with a minimum touch target of 44×44 pixels that allows the guest to pause and resume the music
