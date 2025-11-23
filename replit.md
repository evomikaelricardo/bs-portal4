# Interview Evaluation System - Project Documentation

## Overview

The Interview Evaluation System is a professional web application designed for HR and recruitment teams. Its primary purpose is to streamline the processing and evaluation of candidate interview data by allowing CSV uploads, data parsing, and comprehensive PDF report generation. It supports both client-side and API-based processing, aiming to modernize and simplify candidate evaluation workflows. The project's ambition is to provide a robust platform for efficient recruitment data management and analysis.

## Recent Changes

**November 23, 2025**: Added Pennsylvania location support:
- Added "pennsylvania" to LocationType in both client and server
- Updated LocationContext to handle Pennsylvania in URL parsing and state management
- Added Pennsylvania to sidebar location dropdown
- Created Pennsylvania-specific API endpoints for PDF generation (staff-form-recruitment, customer-call-recruitment, staff-call-recruitment)
- Updated route validations to accept Pennsylvania as a valid location parameter
- Pennsylvania shares the same `apiBearerToken` and `n8nApiUrl` configuration variables as Baltimore and Pittsburgh
- Removed unused RECRUITMENT_TABLE_MAP constant

**November 19, 2025**: Successfully configured project for Replit environment:
- Installed all npm dependencies (521 packages)
- Configured development workflow to run on port 5000 with webview output
- Verified Vite configuration includes proper Replit proxy settings (`host: "0.0.0.0"`, `allowedHosts: true`)
- Set up Autoscale deployment with build and run commands
- Application successfully runs with Express backend and React frontend on single port (5000)
- Login page loads correctly with BrightStarCare branding

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The frontend is built with React and TypeScript, using Vite for development. It adheres to Material Design principles with `shadcn/ui` components (Radix UI + Tailwind CSS) for a modern, responsive, and mobile-first design, utilizing the `Inter` font. `Wouter` handles client-side routing, and `TanStack Query` manages server state.

### Technical Implementations

The backend, powered by Node.js with Express.js, uses Multer for file uploads and PapaParse for CSV parsing. PDF generation is handled by `jsPDF` with `autoTable`. An in-memory storage strategy (`MemStorage`) is used, with an abstract `IStorage` interface for future persistence. Authentication is session-based via Passport.js and `express-session`, protecting all API endpoints and dashboard access. The system supports dual processing modes: client-side for previews and individual PDFs, and API-based for consolidated reports.

### Feature Specifications

- **Analytics Dashboard**: Provides comprehensive visualizations of recruitment data across 11 categories.
- **PDF Export**: One-click export of all analytics data into a professionally formatted PDF report, including special handling for "PROGRESSING" (green box) and "FAIL" (red box) statuses instead of qualification scores.
- **Authentication**: Secure login/logout using hardcoded credentials ("bsadmin", "bspass2025?").
- **Form Submission Features**: Supports individual and bulk PDF generation for form submissions, with a dedicated Form Analytics dashboard. Includes special rendering for "PROGRESSING" and "FAIL" results in PDFs.
- **Multi-Location Support**: Supports three locations (Baltimore, Pittsburgh, and Pennsylvania) with a location selector, location-aware routing, dynamic table name generation, and data isolation per location.
- **Recruitment Channel Separation**: Distinct data sources and API endpoints for "Text Recruitment", "Call Recruitment", and "Form Recruitment" with location-specific table names.
- **Excel Upload Capability**: Allows data sourcing from uploaded Excel files for all recruitment channels.
- **API Design**:
    - **Base URL**: `/api`
    - **Authentication Endpoints**: `/api/auth/login`, `/api/auth/logout`, `/api/auth/session`.
    - **Protected Endpoints**: File uploads, PDF generation, candidate data access.
    - **Public Endpoints**: `/api/health`.
    - **PDF Generation from JSON Endpoints** (Bearer Auth Required): Includes location-agnostic and location-specific endpoints (e.g., `/api/baltimore/generate-pdf/staff-form-recruitment`, `/api/pittsburgh/generate-pdf/staff-form-recruitment`, `/api/pennsylvania/generate-pdf/staff-form-recruitment`). These endpoints handle various input formats and include location in PDF filenames for location-specific requests. Bearer token configured in `config.json` or environment variables.
    - **Response Format**: PDF for generation, JSON for others with consistent error handling.

### System Design Choices

The project uses Zod for runtime data validation against a `CandidateEvaluation` schema. Storage is in-memory with abstraction for future database integration. The system emphasizes a component-based frontend, modular backend, and clear API contracts. Development is configured for Replit using Vite and Node.js with HMR. Deployment targets Autoscale.

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
- **xlsx**: Excel file parsing.