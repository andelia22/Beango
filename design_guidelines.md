# Design Guidelines: City Scavenger Hunt App

## Design Approach

**Selected Approach:** Reference-Based (Instagram + Linear)
- **Primary Reference:** Instagram for feed mechanics, card layout, and gesture interactions
- **Secondary Influence:** Linear for clean typography, spacing precision, and status indicators
- **Justification:** Instagram's proven feed pattern aligns perfectly with the UX requirement for familiar navigation, while Linear's design system provides the clarity needed for task status tracking

## Typography

**Font Stack:** Inter (via Google Fonts CDN)
- **Headings (City Name, Room Code):** 24px, semibold (600), -0.02em letter-spacing
- **Task Captions:** 15px, medium (500), 1.5 line-height
- **Status Labels:** 13px, medium (500), uppercase, 0.05em letter-spacing
- **Body/Helper Text:** 14px, regular (400)
- **Button Text:** 15px, semibold (600)

## Layout System

**Spacing Units:** Tailwind units of 2, 3, 4, 6, 8, 12, 16
- Container padding: px-4
- Card internal padding: p-4
- Section spacing: gap-4 for tight groupings, gap-8 for major sections
- Feed item separation: mb-6 between task cards

**Viewport Strategy:**
- Mobile-first design (320px minimum)
- Single-column feed layout (max-w-2xl mx-auto)
- Full-width task cards with rounded corners

## Core Components

### A. Room Management Screens
**Room Creation:**
- Centered card layout with max-w-md
- Large city selection dropdown with search
- Generated room code display (monospace font, larger size 20px)
- Primary CTA button "Create Room" - full width, h-12

**Join Room:**
- Input field for room code (monospace, text-center, tracking-wider)
- Auto-format code as user types (e.g., ABC-123)
- Join button appears below input

### B. Task Feed (Primary Interface)
**Feed Container:**
- Sticky header showing City Name + Room Code
- Infinite scroll container for 24 task cards
- Fixed submit button at bottom (sticky or in flow after all cards)

**Task Card Structure (Instagram-inspired):**
1. **Header Row:** Task number badge (top-left, small pill)
2. **Image Section:** 
   - Aspect ratio 4:3 or 1:1
   - Rounded corners (rounded-lg)
   - Double-tap target area
3. **Content Section (below image):**
   - Task caption (2-3 lines, truncate if needed)
   - Completion status row with icon + text
4. **Action Affordance:**
   - Heart icon (outline when incomplete, filled when complete)
   - Position: bottom-right of image OR in content section

**Status Indicators:**
- **Incomplete:** Gray heart outline, gray text "Tap to complete"
- **Completed by Me:** Pink filled heart, pink text "Completed by you" with pink background pill
- **Completed by Friend:** Blue/purple filled heart, small avatar thumbnail, text "Completed by [Name]" with subtle background

### C. Completion Interaction
**Double-Tap Mechanics:**
- Double-tap anywhere on card image triggers completion
- Large heart animation appears center of image (scale + fade)
- Card border pulse effect in pink
- Status indicator transitions smoothly
- Haptic feedback (if available)

**Animation Specifications:**
- Heart scale: 0 → 1.2 → 1 over 600ms
- Border pulse: subtle glow effect 400ms
- Status transition: 200ms ease-out
- Keep animations performant, use CSS transforms

### D. Submit Button
**Placement:** After last task card with pt-8 spacing
**States:**
- Disabled: Muted pink, reduced opacity, "X/24 tasks complete" helper text above
- Enabled: Full pink, bold, "Submit Scavenger Hunt"
- Loading: Spinner replaces text

## Navigation & Header

**Sticky Header (top of feed):**
- City name (left, large text)
- Room code (right, monospace, smaller, copyable)
- Background blur effect (backdrop-blur-lg)
- Border bottom for separation

## Microinteractions

**Task Completion Feedback:**
- Immediate visual change (< 100ms perceived delay)
- Icon swap with scale bounce
- Color transition smooth
- Broadcast to other users via WebSocket (show real-time updates)

**Real-time Updates (when friend completes):**
- Subtle badge notification on card
- Smooth transition to "completed by friend" state
- No disruptive animations for others' actions

## Images

**Required Images:**
- **Task Images (24 per city):** Location-specific photos showing the task context (e.g., famous landmark, local cuisine, street art). Aspect ratio 4:3, minimum 800px width
- **User Avatars:** Small circular thumbnails (32px) for "completed by" attribution
- **No Hero Image:** This is a utility app focused on the task feed

**Image Treatment:**
- Rounded corners on all task images (rounded-lg)
- Subtle shadow or border for depth
- Optimized for mobile bandwidth

## Design Principles

1. **Immediate Comprehension:** Users should understand task status at a glance using color, icons, and text
2. **Gesture Familiarity:** Leverage Instagram's double-tap pattern users already know
3. **Playful but Functional:** Pink theme adds personality without compromising usability
4. **Real-time Clarity:** Make collaborative progress visible and celebratory
5. **Mobile-Optimized:** Single-column, thumb-friendly, fast interactions