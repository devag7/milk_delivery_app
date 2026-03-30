# Milk Delivery App

A simple milk delivery management application built with Next.js 14.

## Features

- User authentication (signup/login)
- Customer management (CRUD)
- Milk order tracking
- Invoice generation
- Dashboard with analytics
- Reports by milk type

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Better-SQLite3** - Database
- **jose** - JWT authentication
- **Chart.js** - Data visualization

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Vercel

1. Push your code to GitHub
2. Import your repository to Vercel
3. Deploy!

No environment variables required.

## Project Structure

```
milk_delivery_app/
├── app/                  # Next.js app directory
│   ├── (auth)/          # Auth pages (login, signup)
│   ├── api/             # API routes
│   ├── dashboard/       # Dashboard page
│   ├── customers/       # Customer management
│   ├── billing/         # Billing page
│   ├── invoice/         # Invoice page
│   ├── reports/         # Reports page
│   ├── layout.tsx       # Root layout
│   └── globals.css      # Global styles
├── components/          # React components
│   ├── Sidebar.tsx
│   ├── CustomerForm.tsx
│   ├── StatsCard.tsx
│   └── RevenueChart.tsx
├── lib/                 # Utilities
│   ├── db.ts           # Database setup
│   └── auth.ts         # Authentication utilities
└── milk_delivery.db    # SQLite database (auto-created)
```
