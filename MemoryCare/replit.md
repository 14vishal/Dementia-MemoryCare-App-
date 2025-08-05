# MemoryCare - Digital Companion for Dementia Patients

## Overview

MemoryCare is a comprehensive web application designed as a digital companion for dementia patients and their caregivers. The system provides memory support tools, daily routine management, and caregiver oversight capabilities through an accessible, user-friendly interface.

The application serves two primary user roles:
- **Patients**: Access memory journals, familiar face galleries, daily task guides, and emergency features through a simplified, large-button interface
- **Caregivers**: Monitor patient activities, track behaviors, manage medications, and maintain oversight through a comprehensive dashboard

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Context-based auth provider with session management
- **Accessibility**: High contrast themes, large touch targets (minimum 44px), ARIA labels, and keyboard navigation support

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy using scrypt for password hashing
- **Session Management**: Express-session with memory store
- **API Design**: RESTful endpoints with consistent error handling
- **File Uploads**: Uppy integration with direct cloud storage uploads
- **Middleware**: Custom logging, CORS configuration, and error handling

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations and schema management
- **File Storage**: Google Cloud Storage with object ACL policies for secure file access
- **Session Storage**: In-memory session store (development) with plan for persistent storage

### Authentication and Authorization
- **Strategy**: Username/password authentication with secure password hashing
- **Session Management**: Server-side sessions with secure cookies
- **Role-Based Access**: Patient and caregiver role separation with different interface privileges
- **Object-Level Security**: Custom ACL policies for file access control based on user permissions

### Key Data Entities
- **Users**: Patient and caregiver profiles with role-based permissions
- **Memories**: Photo and text journal entries with timestamps
- **Familiar Faces**: Photo gallery with relationship descriptions
- **Daily Tasks**: Routine management with scheduling and completion tracking
- **Medications**: Prescription management with dosage and timing
- **Behavior Logs**: Mood, sleep, and activity tracking for caregiver oversight
- **Contacts**: Emergency and family contact management

## External Dependencies

### Cloud Services
- **Google Cloud Storage**: Object storage for photos and files with custom ACL policies
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling

### UI and Component Libraries
- **Radix UI**: Accessible component primitives for modals, dropdowns, navigation
- **Lucide React**: Icon library for consistent iconography
- **Uppy**: File upload handling with dashboard interface and AWS S3 integration

### Development and Build Tools
- **Vite**: Frontend build tool with HMR and development server
- **Drizzle Kit**: Database schema management and migration tools
- **esbuild**: Server-side JavaScript bundling for production builds

### Authentication and Security
- **Passport.js**: Authentication middleware with local strategy support
- **Express Session**: Server-side session management
- **Crypto (Node.js)**: Password hashing using scrypt algorithm

### Accessibility and User Experience
- **React Hook Form**: Form validation with accessibility features
- **TanStack Query**: Optimistic updates and caching for better UX
- **Wouter**: Lightweight routing with programmatic navigation