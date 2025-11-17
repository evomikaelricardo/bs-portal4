# Design Guidelines: Post-Interview Evaluation Report Generator

## Design Approach

**System Selected:** Material Design
**Rationale:** This is a professional, utility-focused application for HR/recruitment teams processing interview evaluations. Material Design provides the structured, data-friendly components needed for efficient workflow and clear information hierarchy.

## Core Design Elements

### A. Typography
- **Primary Font:** Inter via Google Fonts
- **Headings:** 
  - H1 (Page Title): text-3xl, font-semibold
  - H2 (Section Headers): text-xl, font-semibold
  - H3 (Subsections): text-lg, font-medium
- **Body Text:** text-base, font-normal
- **Data/Table Text:** text-sm, font-normal
- **Labels:** text-sm, font-medium
- **Emphasis:** Use font-medium for key data points (Pass/Fail status, candidate names)

### B. Layout System
- **Spacing Units:** Tailwind units of 4, 6, 8, and 12 (p-4, gap-6, mt-8, py-12)
- **Container:** max-w-7xl mx-auto with px-4 for consistent page width
- **Section Spacing:** py-12 between major sections
- **Component Spacing:** gap-6 for card grids, gap-4 for form elements
- **Card Padding:** p-6 for main cards, p-4 for nested elements

### C. Component Library

#### 1. File Upload Zone
- Large dropzone card (min-h-64) with dashed border (border-2 border-dashed)
- Centered upload icon (cloud upload, 48px size)
- Clear instructional text: "Drop CSV file here or click to browse"
- Supported format indicator: "Supported format: .csv (Max 10MB)"
- Active state with border transition on drag-over
- Selected file display with file name, size, and remove button

#### 2. Data Preview Table
- Full-width responsive table with horizontal scroll on mobile
- Sticky header row with font-medium labels
- Alternating row backgrounds for readability
- Status badge component for PASS/FAIL results (rounded-full px-3 py-1)
- Cell padding: px-4 py-3
- Compact text (text-sm) for data cells
- Right-aligned actions column

#### 3. Action Controls
- Primary action button (Generate PDF Report) - prominent, full-width on mobile
- Secondary actions (Clear Data, Upload New File) - outline style
- Button group with gap-4 spacing
- Sticky footer on mobile for easy access to actions

#### 4. PDF Preview/Generation Panel
- Side-by-side layout on desktop: data table (60%) + PDF preview panel (40%)
- PDF preview shows report structure outline before generation
- Generation progress indicator with percentage and status message
- Download button appears after successful generation
- File naming format displayed: "Candidate_Name_YYYY-MM-DD.pdf"

#### 5. Report Summary Cards
- Grid layout: grid-cols-1 md:grid-cols-3 gap-6
- Individual stat cards showing:
  - Total Candidates Processed
  - Passed Evaluations (with percentage)
  - Failed Evaluations (with percentage)
- Large number display (text-3xl font-bold) with descriptive label below

#### 6. Navigation/Header
- Clean app header with logo/title: "Interview Evaluation System"
- Minimal navigation (single-page app)
- Optional help/info icon linking to usage instructions
- Fixed position: sticky top-0 with subtle shadow

### D. Information Architecture

**Primary Screen Layout:**
1. **Header Section** (sticky)
   - Application title and branding
   - Optional user account indicator

2. **Upload Section**
   - File upload dropzone (primary interaction)
   - File validation messages and requirements
   - Current file status display

3. **Data Preview Section** (appears after upload)
   - Summary statistics cards
   - Full data table with all evaluation fields
   - Column sorting capability indicators
   - Search/filter input for candidate names

4. **Report Generation Section**
   - PDF preview outline/structure
   - Generation controls and options
   - Progress feedback during generation
   - Download action with success confirmation

5. **Footer Section**
   - Simple footer with version info and support contact

### E. Data Presentation Principles

**Table Design:**
- Prioritize readability: adequate row height (py-3), clear column separation
- Responsive strategy: horizontal scroll on mobile with fixed first column (candidate name)
- Status highlighting: use badge components for visual scanning
- Critical fields prominently displayed: Name, Result, DateTime, Phone, Email

**Report PDF Structure:**
- Professional header with company branding area
- Candidate information block (name, contact details)
- Evaluation summary section (Pass/Fail with timestamp)
- Detailed assessment grid (all qualification fields)
- Footer with generation timestamp and unique report ID

### F. Interaction Patterns

**File Upload Flow:**
1. User drops/selects CSV file
2. Immediate validation feedback (file type, size)
3. Progress indicator during parsing
4. Success state shows file name with checkmark
5. Data preview table auto-populates
6. Summary cards update with statistics

**PDF Generation Flow:**
1. User reviews data in preview table
2. Clicks "Generate PDF Report" button
3. Progress indicator shows generation status
4. Success message with download button appears
5. PDF downloads with auto-named file
6. Option to generate for selected candidates only

**Error Handling:**
- Inline validation messages for file format errors
- Clear error descriptions for missing/malformed data
- Retry actions prominently displayed
- Non-blocking notifications for warnings

### G. Accessibility & Usability

- Clear focus states on all interactive elements (ring-2 ring-offset-2)
- High contrast text for all data displays
- Keyboard navigation support for entire workflow
- Screen reader friendly labels for all form inputs and buttons
- Loading states with descriptive aria-labels
- Success/error announcements for screen readers

### H. Professional Polish

- Subtle shadows on cards (shadow-md) for depth
- Smooth transitions on interactive elements (transition-all duration-200)
- Rounded corners on cards and buttons (rounded-lg for cards, rounded-md for buttons)
- Consistent icon usage from Material Icons library via CDN
- Professional spacing creating clear visual hierarchy
- Clean, distraction-free interface focused on task completion

**Animation Policy:** Minimal - only use for:
- File upload drag-over state (border pulse)
- Progress indicators during PDF generation
- Success checkmark animation after generation complete
- All animations should be subtle and purposeful