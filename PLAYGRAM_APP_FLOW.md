# Playgram App Flow Documentation

## 🚀 Complete User Journey & Navigation Flow

### 📱 Mobile App Entry Points

```
┌─────────────────────────────────────────────────────────────┐
│                    APP LAUNCH                               │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Web Browser   │    │   Mobile App    │                │
│  │ (localhost:5174)│    │   (Capacitor)   │                │
│  └─────────────────┘    └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 SPLASH SCREEN                               │
│  • Animated GIF (500x500px)                                │
│  • 3-second duration                                       │
│  • Blue background (#1e40af)                               │
│  • Auto-hide enabled                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                PLATFORM DETECTION                          │
│  isMobileApp() ? MobileApp : WebApp                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌐 Web Application Flow

### Main Landing Page
```
┌─────────────────────────────────────────────────────────────┐
│                    HOME PAGE                                │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │    Navbar       │  │   Hero Section  │                  │
│  │ • Sports Menu   │  │ • Call to Action│                  │
│  │ • Login/Signup  │  │ • Download App  │                  │
│  │ • Contact       │  └─────────────────┘                  │
│  └─────────────────┘                                       │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ Sports Selection│  │ Coaching Section│                  │
│  │ • Football      │  │ • Features      │                  │
│  │ • Basketball    │  │ • Benefits      │                  │
│  │ • Badminton     │  │ • Testimonials  │                  │
│  │ • Swimming      │  └─────────────────┘                  │
│  └─────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

### Navigation Routes
```
/                    → Home Page
/football           → Football Sport Page
/basketball         → Basketball Sport Page
/badminton          → Badminton Sport Page
/swimming           → Swimming Sport Page
/waitlist           → Waitlist Registration
/contact            → Contact Page
/admin              → Admin Dashboard (Auth Required)
/dashboard          → Student Dashboard (Auth Required)
/coach              → Coach Login/Dashboard
/coaching           → Coaching View
/privacy            → Privacy Policy
/terms              → Terms of Service
/cookies            → Cookie Policy
```

---

## 📱 Mobile Application Flow

### App State Management
```
┌─────────────────────────────────────────────────────────────┐
│                 MOBILE APP STATES                           │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │    INTRO    │───▶│    LOGIN    │───▶│  DASHBOARD  │      │
│  │             │    │             │    │             │      │
│  │ • Video     │    │ • Phone OTP │    │ • Overview  │      │
│  │ • Get Started│   │ • Auth Flow │    │ • Features  │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│                                                             │
│  Swipe Back Gestures: ◀─ Left Edge Swipe                   │
│  Safe Area Handling: Status Bar + Home Indicator           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

### Login Process
```
┌─────────────────────────────────────────────────────────────┐
│                 AUTHENTICATION FLOW                        │
│                                                             │
│  User Clicks Login                                          │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────┐                                        │
│  │  Login Modal    │                                        │
│  │ • Phone Number  │                                        │
│  │ • Send OTP      │                                        │
│  └─────────────────┘                                        │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │ OTP Verification│───▶│ User Dashboard  │                │
│  │ • 6-digit code  │    │ • Profile Setup │                │
│  │ • Resend option │    │ • Enrollments   │                │
│  └─────────────────┘    └─────────────────┘                │
│                                                             │
│  OTP Services:                                              │
│  • Development: Mock OTP (123456)                          │
│  • Production: Aisensy SMS Gateway                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏠 Student Dashboard Flow

### Dashboard Navigation
```
┌─────────────────────────────────────────────────────────────┐
│                 STUDENT DASHBOARD                           │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   OVERVIEW      │  │    COACHING     │                  │
│  │ • Sessions Left │  │ • Sports Programs│                 │
│  │ • Merchandise   │  │ • Enrollment    │                  │
│  │ • Calendar      │  │ • Progress      │                  │
│  │ • Quick Stats   │  └─────────────────┘                  │
│  └─────────────────┘                                       │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │    BATCHES      │  │  MERCHANDISE    │                  │
│  │ • Calendar View │  │ • Product Grid  │                  │
│  │ • Session Times │  │ • Shopping Cart │                  │
│  │ • Attendance    │  │ • Order History │                  │
│  │ • Batch Chat    │  │ • Payment Flow  │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ NOTIFICATIONS   │  │    SETTINGS     │                  │
│  │ • Announcements │  │ • Profile Edit  │                  │
│  │ • Session Alerts│  │ • Preferences   │                  │
│  │ • Updates       │  │ • Privacy       │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Enhanced Features
```
┌─────────────────────────────────────────────────────────────┐
│                ENHANCED DASHBOARD FEATURES                  │
│                                                             │
│  📦 MERCHANDISE SECTION (2x2 Grid)                         │
│  ┌─────────────┐ ┌─────────────┐                           │
│  │ Jersey #1   │ │ Jersey #2   │                           │
│  │ ₹449        │ │ ₹449        │                           │
│  │ Stock: 2    │ │ Stock: 5    │                           │
│  └─────────────┘ └─────────────┘                           │
│  ┌─────────────┐ ┌─────────────┐                           │
│  │ Jersey #3   │ │ Jersey #4   │                           │
│  │ ₹449        │ │ ₹449        │                           │
│  │ Stock: 1    │ │ Out of Stock│                           │
│  └─────────────┘ └─────────────┘                           │
│                                                             │
│  📅 MOBILE CALENDAR (Weekly View)                          │
│  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐                │
│  │ Sun │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │                │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                │
│  │  1  │  2  │  3● │  4  │  5● │  6  │  7  │                │
│  └─────┴─────┴─────┴─────┴─────┴─────┴─────┘                │
│  ● = Session Day                                            │
│                                                             │
│  Today's Sessions:                                          │
│  • Football: 4:00 PM - 5:30 PM                             │
│  • Basketball: 6:00 PM - 7:30 PM                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Coach Dashboard Flow

### Coach Interface
```
┌─────────────────────────────────────────────────────────────┐
│                   COACH DASHBOARD                           │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   BATCH MGMT    │  │   ATTENDANCE    │                  │
│  │ • Student Lists │  │ • Mark Present  │                  │
│  │ • Session Plans │  │ • Session Notes │                  │
│  │ • Progress Track│  │ • Performance   │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   SCHEDULE      │  │   COMMUNICATION │                  │
│  │ • Calendar View │  │ • Batch Chat    │                  │
│  │ • Time Slots    │  │ • Announcements │                  │
│  │ • Venue Details │  │ • Parent Updates│                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 👨‍💼 Admin Dashboard Flow

### Admin Interface
```
┌─────────────────────────────────────────────────────────────┐
│                   ADMIN DASHBOARD                           │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ USER MANAGEMENT │  │ SPORTS PROGRAMS │                  │
│  │ • Students      │  │ • Add/Edit      │                  │
│  │ • Coaches       │  │ • Categories    │                  │
│  │ • Enrollments   │  │ • Pricing       │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ BATCH MGMT      │  │   PAYMENTS      │                  │
│  │ • Create Batches│  │ • Transaction   │                  │
│  │ • Assign Coaches│  │ • Revenue Track │                  │
│  │ • Schedules     │  │ • Refunds       │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  MERCHANDISE    │  │  NOTIFICATIONS  │                  │
│  │ • Inventory     │  │ • Send Alerts   │                  │
│  │ • Orders        │  │ • Announcements │                  │
│  │ • Stock Mgmt    │  │ • Push Messages │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 💳 Payment Flow

### Payment Process
```
┌─────────────────────────────────────────────────────────────┐
│                    PAYMENT FLOW                             │
│                                                             │
│  User Selects Service                                       │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────┐                                        │
│  │ Service Options │                                        │
│  │ • Enrollment    │                                        │
│  │ • Merchandise   │                                        │
│  │ • Trial Session │                                        │
│  └─────────────────┘                                        │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │ Razorpay Gateway│───▶│ Payment Success │                │
│  │ • Card Payment  │    │ • Confirmation  │                │
│  │ • UPI/Wallet    │    │ • Receipt       │                │
│  │ • Net Banking   │    │ • Service Active│                │
│  └─────────────────┘    └─────────────────┘                │
│                                                             │
│  Payment Tracking:                                          │
│  • Unified payment service                                  │
│  • Real-time status updates                                │
│  • Comprehensive logging                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Architecture

### Backend Integration
```
┌─────────────────────────────────────────────────────────────┐
│                   DATA ARCHITECTURE                         │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   FRONTEND      │───▶│     CONVEX      │                │
│  │ • React/Vite    │    │ • Real-time DB  │                │
│  │ • TypeScript    │    │ • Serverless    │                │
│  │ • Tailwind CSS  │    │ • Auto-sync     │                │
│  └─────────────────┘    └─────────────────┘                │
│                                 │                           │
│                                 ▼                           │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   SERVICES      │    │   DATABASE      │                │
│  │ • Razorpay      │    │ • Users         │                │
│  │ • Aisensy SMS   │    │ • Enrollments   │                │
│  │ • Firebase      │    │ • Payments      │                │
│  │ • Analytics     │    │ • Merchandise   │                │
│  └─────────────────┘    └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Key Database Tables
```
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE SCHEMA                           │
│                                                             │
│  👥 USERS                    📚 ENROLLMENTS                │
│  • Phone (Primary Key)       • User ID                     │
│  • Name, Email              • Sport Program                │
│  • Student ID               • Payment Status               │
│  • Profile Data             • Sessions Total/Attended      │
│                                                             │
│  🏃 SPORTS PROGRAMS          💰 PAYMENTS                   │
│  • Name, Category           • Type (enrollment/merch)      │
│  • Age Groups, Levels       • Amount, Currency             │
│  • Equipment, Benefits      • Status, Timestamps           │
│  • Pricing, Images          • Razorpay Integration         │
│                                                             │
│  👥 BATCHES                  🛍️ MERCHANDISE                │
│  • Coach Assignment         • Name, Description            │
│  • Schedule, Venue          • Price, Stock                 │
│  • Student Enrollments      • Categories, Images           │
│  • Session Management       • Order Management             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Mobile-Specific Features

### Capacitor Integration
```
┌─────────────────────────────────────────────────────────────┐
│                 MOBILE APP FEATURES                         │
│                                                             │
│  🎨 UI/UX Enhancements                                      │
│  • Safe area handling (notch, home indicator)              │
│  • Swipe back gestures (left edge)                         │
│  • Native splash screen (3s duration)                      │
│  • Mobile-optimized navigation                             │
│                                                             │
│  📱 Native Capabilities                                     │
│  • Push notifications (disabled for now)                   │
│  • Device detection                                         │
│  • Platform-specific styling                               │
│  • Hardware back button handling                           │
│                                                             │
│  🔧 Build Configuration                                     │
│  • Java 21 support                                         │
│  • Gradle 8.12                                             │
│  • Android SDK 35                                          │
│  • iOS deployment ready                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment & Distribution

### Platform Deployment
```
┌─────────────────────────────────────────────────────────────┐
│                   DEPLOYMENT FLOW                           │
│                                                             │
│  🌐 WEB DEPLOYMENT                                          │
│  • Vercel hosting                                           │
│  • Automatic builds                                         │
│  • Custom domain support                                    │
│  • SSL certificates                                         │
│                                                             │
│  📱 MOBILE DEPLOYMENT                                       │
│  • Android: Google Play Store                              │
│  • iOS: Apple App Store                                     │
│  • APK: Direct distribution                                 │
│  • OTA updates via Capacitor                               │
│                                                             │
│  🔄 CI/CD PIPELINE                                          │
│  • npm run build                                            │
│  • npx cap sync                                             │
│  • Platform-specific builds                                │
│  • Automated testing                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Analytics & Monitoring

### Tracking Implementation
```
┌─────────────────────────────────────────────────────────────┐
│                 ANALYTICS FLOW                              │
│                                                             │
│  📈 Google Analytics                                        │
│  • Page view tracking                                       │
│  • User journey analysis                                    │
│  • Conversion funnels                                       │
│  • Custom events                                            │
│                                                             │
│  🔍 Real-time Monitoring                                    │
│  • Payment transaction logs                                 │
│  • User activity tracking                                   │
│  • Error reporting                                          │
│  • Performance metrics                                      │
│                                                             │
│  📱 Mobile Analytics                                        │
│  • App usage patterns                                       │
│  • Feature adoption rates                                   │
│  • Crash reporting                                          │
│  • User retention metrics                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 User Journey Summary

### Complete Flow Overview
```
1. 🚀 APP LAUNCH
   ├── Splash Screen (3s)
   └── Platform Detection

2. 🏠 ENTRY POINT
   ├── Web: Landing Page
   └── Mobile: Intro Video

3. 🔐 AUTHENTICATION
   ├── Phone Number Entry
   ├── OTP Verification
   └── Profile Setup

4. 📱 MAIN DASHBOARD
   ├── Overview (Sessions, Stats)
   ├── Coaching (Sports Programs)
   ├── Batches (Calendar, Chat)
   ├── Merchandise (Shopping)
   ├── Notifications
   └── Settings

5. 💳 SERVICES
   ├── Enrollment Payment
   ├── Merchandise Purchase
   ├── Trial Booking
   └── Package Upgrades

6. 🎓 ONGOING USAGE
   ├── Session Attendance
   ├── Progress Tracking
   ├── Communication
   └── Performance Analytics
```

---

## 🔧 Technical Stack Summary

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Mobile**: Capacitor + Native iOS/Android
- **Backend**: Convex (Serverless + Real-time)
- **Payments**: Razorpay Integration
- **SMS**: Aisensy Gateway
- **Analytics**: Google Analytics
- **Deployment**: Vercel (Web) + App Stores (Mobile)
- **Build**: Java 21 + Gradle 8.12

This comprehensive flow ensures a seamless user experience across all platforms while maintaining robust functionality and scalability.