# Interview Evaluation System - Project Documentation

## Overview

The Interview Evaluation System is a professional web application designed for HR and recruitment teams. Its primary purpose is to streamline the processing and evaluation of candidate interview data. The system allows for uploading CSV files, parsing this data, and generating comprehensive PDF reports. It supports both client-side and API-based processing, aiming to modernize and simplify candidate evaluation workflows. The project's ambition is to provide a robust platform for efficient recruitment data management and analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The frontend is built with React and TypeScript, leveraging Vite for development. It adheres to Material Design principles using `shadcn/ui` components (Radix UI + Tailwind CSS) for a modern, responsive, and mobile-first design. The `Inter` font is used for typography. `Wouter` handles client-side routing, and `TanStack Query` manages server state, complemented by React hooks for local state.

### Technical Implementations

The backend, powered by Node.js with Express.js, uses Multer for file uploads and PapaParse for CSV parsing. PDF generation is handled by `jsPDF` with `autoTable`. An in-memory storage strategy (`MemStorage`) is used for performance, with an abstract `IStorage` interface allowing future persistence options. Authentication is session-based via Passport.js and `express-session`, protecting all API endpoints and dashboard access. The system supports dual processing modes: client-side for previews and individual PDFs, and API-based for consolidated reports.

### Feature Specifications

- **Analytics Dashboard**: Provides comprehensive visualizations of recruitment data across 11 categories (e.g., Recruitment Funnel, Qualification Status, Quality Scores, Geographic Distribution, Compliance).
- **PDF Export**: One-click export of all analytics data into a professionally formatted PDF report, including pagination, headers, and color-coded tables.
- **Authentication**: Secure login/logout using hardcoded credentials ("bsadmin", "bspass2025?"), protecting all sensitive areas.
- **Form Submission Features**: Supports individual and bulk PDF generation for form submissions, along with a dedicated Form Analytics dashboard presenting an overview, qualifications, compliance, experience, and statistical summaries.
  - **PROGRESSING Status Handling**: When a form submission has `result: "PROGRESSING"`, the PDF displays a green box with "Progressing — all required qualifications & requirements have been met." instead of the standard qualification score. This applies to both UI-generated PDFs and API-generated PDFs.
  - **FAIL Status Handling**: When a form submission has `result: "FAIL"`, the PDF displays a red box with "FAIL" instead of "Qualification Score: 0% - Needs Improvement". This applies to both UI-generated PDFs and API-generated PDFs.
- **Multi-Location Support**: The system supports two locations (Baltimore and Pittsburgh) with:
  - Location selector dropdown in the sidebar navigation
  - Location-aware routing with all URLs prefixed by location (e.g., `/baltimore/staffs/...`, `/pittsburgh/customers/...`)
  - Dynamic table name generation based on selected location
  - Shared N8N API configuration between locations
  - Data isolation per location
- **Recruitment Channel Separation**: Distinct data sources and API endpoints for "Text Recruitment", "Call Recruitment", and "Form Recruitment" with location-specific table names (e.g., `Dev-Bsc-Baltimore-Staff-Inbound-Text-Recruitment`, `Dev-Bsc-Pittsburgh-Staff-Inbound-Call-Recruitment`), ensuring data isolation.
- **Excel Upload Capability**: For text, call, and form recruitment channels, allowing data to be sourced from uploaded Excel files in addition to live databases.
- **API Design**:
    - **Base URL**: `/api`
    - **Authentication Endpoints**: `/api/auth/login`, `/api/auth/logout`, `/api/auth/session`.
    - **Protected Endpoints**: Include file uploads, PDF generation, and candidate data access.
    - **Public Endpoints**: `/api/health`.
    - **PDF Generation from JSON Endpoints** (Bearer Auth Required): 
      - Location-Agnostic Endpoints (Backward Compatible):
        - `POST /api/generate-pdf/staff-form-recruitment` - Generates PDFs from form submission data
        - `POST /api/generate-pdf/customer-call-recruitment` - Generates PDFs from CustomerService[] data
        - `POST /api/generate-pdf/staff-call-recruitment` - Generates PDFs from CandidateEvaluation[] data
      - Location-Specific Endpoints (Recommended):
        - Baltimore:
          - `POST /api/baltimore/generate-pdf/staff-form-recruitment`
          - `POST /api/baltimore/generate-pdf/customer-call-recruitment`
          - `POST /api/baltimore/generate-pdf/staff-call-recruitment`
        - Pittsburgh:
          - `POST /api/pittsburgh/generate-pdf/staff-form-recruitment`
          - `POST /api/pittsburgh/generate-pdf/customer-call-recruitment`
          - `POST /api/pittsburgh/generate-pdf/staff-call-recruitment`
      - **Features**:
        - Accepts multiple formats: `{ "body": { "candidates": [...] } }` (UI format), `{ "candidates": [...] }`, or direct array `[...]`
        - Special handling: When `result: "PROGRESSING"`, displays green success box instead of qualification score
        - Location-specific endpoints include location name in PDF filename (e.g., `baltimore_staff_form_submissions_2025-11-18.pdf`)
      - **Authentication**: These endpoints use Bearer token authentication stored in `config.json` (see API_BEARER_AUTH.md)
      - **Token Setup**: Configure `apiBearerToken` in `config.json` file (never commit this file to version control)
    - **Response Format**: PDF for generation, JSON for others with consistent error handling.

### System Design Choices

The project uses Zod for runtime data validation against a `CandidateEvaluation` schema, encompassing various candidate details from interview results to qualifications and red flags. The current storage is in-memory for simplicity and speed, with a clear abstraction for future database integration. The system emphasizes a component-based frontend, a modular backend, and clear API contracts. Development is configured for Replit, using Vite and Node.js, with HMR enabled. Deployment targets Autoscale with a `npm run build` and `npm start` process.

## External Dependencies

- **React**: Frontend UI.
- **Express.js**: Backend web server.
- **TypeScript**: Language.
- **Vite**: Build tool.
- **Radix UI**: Headless UI components.
- **shadcn/ui**: Pre-styled UI components.
- **Tailwind CSS**: CSS framework.
- **Lucide React**: Icons.
- **PapaParse**: CSV parsing.
- **jsPDF**: PDF generation.
- **jspdf-autotable**: PDF table generation.
- **Zod**: Schema validation.
- **Passport.js**: Authentication.
- **passport-local**: Local authentication strategy.
- **express-session**: Session management.
- **memorystore**: In-memory session storage.
- **TanStack Query**: Server state management.
- **React Hook Form**: Form validation.
- **Wouter**: Client-side routing.
- **xlsx**: Excel file parsing (for backend uploads).

## Recent Changes

### November 19, 2025 - Pittsburgh Staff Form Recruitment Field Enhancements
- **Extended Form Submission Schema**: Added 15+ Pittsburgh-specific fields to staff form recruitment
  - Location & Experience: `locationId`, `previousLocation`, `employmentPeriod`, `reliableTransport`, `paResidency` (PA residency for at least 2 years)
  - Care Details: `careExperience`, `clientType`
  - Performance Metrics: `experienceScore`, `compassionScore`, `safetyScore`, `professionalismScore`, `performanceSummary`
  - Follow-up Information: `redFlags`, `followUpQuestions`, `questionsAsked`, `callbackDate`, `consentToMessages`
- **PDF Generator Updates**: Both client-side and server-side PDF generators updated to render all Pittsburgh fields
  - Conditional rendering ensures fields only appear when data is present
  - Consistent formatting between browser-generated and API-generated PDFs
  - Special handling for array fields (redFlags, followUpQuestions, questionsAsked) displayed as bullet lists
- **Data Transformation**: Updated `transformFormSubmissions` to map Pittsburgh N8N API fields to schema
  - Handles snake_case to camelCase conversion (e.g., `pa_residency_for_atleast_2_years` → `paResidency`)
  - Supports multiple source field formats for backward compatibility
- **Table Configuration**: Pittsburgh form recruitment uses table name `Dev-BSC-Pittsburgh-Staff-Inbound-Form-Recruitment`

### November 18, 2025 - Location-Specific PDF Generation APIs
- **Location-Specific API Endpoints**: Created dedicated PDF generation endpoints for Baltimore and Pittsburgh locations
  - Added 6 new endpoints: 3 for Baltimore (`/api/baltimore/generate-pdf/*`) and 3 for Pittsburgh (`/api/pittsburgh/generate-pdf/*`)
  - Each location has its own set of endpoints for:
    - Staff Form Recruitment PDF generation
    - Customer Call Recruitment PDF generation
    - Staff Call Recruitment PDF generation
  - Location-specific PDFs include location name in filename (e.g., `baltimore_staff_form_submissions_2025-11-18.pdf`, `pittsburgh_customer_call_recruitment_2025-11-18.pdf`)
  - Original location-agnostic endpoints (`/api/generate-pdf/*`) remain available for backward compatibility
  - All endpoints use the same Bearer token authentication mechanism
  - Updated API_BEARER_AUTH.md with comprehensive examples for location-specific endpoints

### November 18, 2025 - Multi-Location Support Implementation
- **Multi-Location Architecture**: Added support for two locations (Baltimore and Pittsburgh) with identical features
  - Created `LocationContext` for global location state management synchronized with URL routing
  - Added location selector dropdown in sidebar navigation (above menu items)
  - Updated all routes to include `/:location` parameter (e.g., `/baltimore/staffs/call/cs/inbound`, `/pittsburgh/staffs/form/recruitment/inbound`)
  - Default location: Baltimore (used for legacy routes without location parameter)
- **Location-Aware Data Fetching**:
  - Updated all external API endpoints to accept `location` query parameter
  - Server dynamically generates table names based on location: `Dev-Bsc-{Location}-{Type}-Inbound-{Channel}-Recruitment`
  - Examples:
    - Baltimore Call Recruitment: `Dev-Bsc-Baltimore-Staff-Inbound-Call-Recruitment`
    - Pittsburgh Form Recruitment: `Dev-BSC-Pittsburgh-Staff-Inbound-Form-Recruitment`
  - Both locations share the same `n8nApiUrl` and `apiBearerToken` configuration
  - All recruitment pages (Text, Call, Form, Customer Call) updated to pass location parameter to APIs
- **URL Structure**: All application paths now prefixed with location:
  - Staff routes: `/:location/staffs/{channel}/{type}/{direction}`
  - Customer routes: `/:location/customers/{channel}/{type}/{direction}`
  - Analytics routes: `/:location/{page}/analytics`
- **React Query Integration**: Query keys updated to include location parameter preventing cross-location cache conflicts

### November 17, 2025 - Replit Environment Setup & Docker Configuration
- Successfully imported GitHub project and configured for Replit environment
- Added `.gitignore` file with Node.js best practices
- Updated `vite.config.ts` to support Replit proxy with `allowedHosts: true` and `host: "0.0.0.0"`
- Configured deployment for Autoscale with build and production commands
- All dependencies installed and application verified working
- **Configuration Migration:** Moved variables from `config.json` to environment variables for Docker deployment
  - Updated `server/routes.ts` to read from environment variables (`API_BEARER_TOKEN`, `N8N_API_URL`) with fallback to `config.json`
  - Updated `docker-compose.yml` to use environment variable references
  - Created `.env.example` as a template for Docker users
  - Updated DOCKER.md and README.Docker.md with setup instructions
  - Local development can still use `config.json`, Docker uses `.env` file
- **PDF Generation Enhancement:** Added FAIL status handling for staff form submissions
  - Updated `server/pdfGenerator.ts` and `client/src/lib/formPdfGenerator.ts`
  - When `result: "FAIL"`, displays red box with "FAIL" instead of "Qualification Score: 0% - Needs Improvement"
  - Consistent with existing PROGRESSING status handling

## Replit Configuration

### Development Setup
- **Workflow**: Configured to run `npm run dev` on port 5000
- **Server Configuration**: 
  - Host: `0.0.0.0` (required for Replit environment)
  - Port: 5000 (serves both frontend and backend API)
  - Vite configured with `allowedHosts: true` for proper proxy handling
- **Environment**: Uses in-memory storage (no database required)
- **Authentication**: Hardcoded credentials - Username: `bsadmin`, Password: `bspass2025?`

### Deployment Configuration
- **Target**: Autoscale deployment
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Production Port**: 5000 (configured via PORT environment variable)

### Running the Application
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Access the application at the provided Replit URL
4. Login with credentials: `bsadmin` / `bspass2025?`

### API Bearer Token Setup (for PDF Generation)
The PDF generation endpoints require a bearer token for authentication:
1. Open `config.json` in the project root
2. Replace `"change-this-to-your-secure-token"` with your actual bearer token
3. Save the file and restart the server
4. **Important:** Never commit `config.json` to version control (it's already in `.gitignore`)
5. See `API_BEARER_AUTH.md` for detailed usage examples and security best practices