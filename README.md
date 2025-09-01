# Playgram - Sports Training Platform

A modern sports training platform built with React, TypeScript, Vite, and Convex. Features professional coaching programs for Football, Basketball, Badminton, and Swimming.

## 🚀 Features

- **Multi-Sport Training**: Professional coaching for 4 major sports
- **Interactive UI**: Modern design with Framer Motion animations
- **Real-time Database**: Powered by Convex for seamless data management
- **Responsive Design**: Optimized for all devices
- **Professional Icons**: Clean Lucide React icons throughout
- **Booking System**: Easy trial and enrollment booking
- **Contact Forms**: Integrated enquiry system

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Convex (Real-time database)
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Add your Convex deployment URL and keys.

4. Start development server:
   ```bash
   npm run dev
   ```

## 🚀 Deployment to Vercel

### Automatic Deployment (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `CONVEX_DEPLOYMENT`
   - `VITE_CONVEX_URL`
   - `CONVEX_DEPLOY_KEY`

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to Vercel
npx vercel --prod
```

## 🔧 Environment Variables

Required environment variables for production:

```env
CONVEX_DEPLOYMENT=your-convex-deployment
VITE_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── sports/         # Individual sport pages
│   ├── ui/             # Reusable UI components
│   └── ...
├── convex/             # Convex backend functions
└── ...
```

## 🎨 Key Components

- **HeroSection**: Landing page with video background
- **SportsStackEnhanced**: Interactive sports carousel
- **BookingModal**: Trial and enrollment booking
- **Dashboard**: User booking management
- **EnquirySection**: Contact and enquiry forms

## 🔄 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linting and type checking

## 📱 Features

- Professional gradient buttons
- Indian Rupee pricing
- Video backgrounds with fallbacks
- Professional Lucide React icons
- Responsive design
- Real-time data updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

This project is connected to the Convex deployment named [`intent-ibis-667`](https://dashboard.convex.dev/d/intent-ibis-667).

For more information about Convex, check out the [Convex docs](https://docs.convex.dev/).