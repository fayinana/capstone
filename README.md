# Teguaze Car Rental Application 🚗

[![Netlify Status](https://api.netlify.com/api/v1/badges/b6dc7489-bfe7-47a8-88c3-2e4ee5a58b2b/deploy-status)](https://app.netlify.com/sites/teguaze/deploys)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![GitHub issues](https://img.shields.io/github/issues/fayinana/Teguaze.svg)
![GitHub pull requests](https://img.shields.io/github/issues-pr/fayinana/Teguaze.svg)
![GitHub stars](https://img.shields.io/github/stars/fayinana/Teguaze.svg)
![GitHub forks](https://img.shields.io/github/forks/fayinana/Teguaze.svg)
![Top Language](https://img.shields.io/github/languages/top/fayinana/Teguaze.svg)
![Last Commit](https://img.shields.io/github/last-commit/fayinana/Teguaze.svg)

<p align="center" width="100%">
<img src="/public/image.png" width="48" >
</p>
Teguaze is a premium car rental platform designed for the Ethiopian market. This application allows users to browse, book, and pay for car rentals with a modern, responsive interface.

## Features ✨

### For Users

- **Car Browsing**: Search and filter available cars based on various criteria
- **Detailed Car View**: View high-quality images and detailed specifications
- **User Authentication**: Create an account, login, and manage your profile
- **Booking System**: Make reservations for specific dates
- **Multiple Payment Options**: Pay via Stripe or Chapa payment gateways
- **Booking Management**: View and manage your active and past bookings
- **Email Notifications**: Receive confirmations for account actions and bookings

### For Admins

- **Dashboard**: Overview of platform statistics
- **Car Management**: Add, edit, or remove cars from the platform
- **User Management**: View and manage user accounts
- **Booking Oversight**: Monitor all bookings on the platform

## Technology Stack 🛠️

### Frontend

- React with TypeScript
- Tailwind CSS and Shadcn/UI for styling
- React Router for navigation
- React Query for data fetching
- Vite as the build tool

### Backend

- Supabase for backend services
  - Auth for user authentication
  - PostgreSQL for database
  - Storage for images
  - Edge Functions for serverless functionality

### Payment Processing

- Stripe integration for international payments
- Chapa integration for local Ethiopian payments

## Setup and Installation 🚀

### Prerequisites

- Node.js (v16+)
- Supabase account
- Stripe account (for international payments)
- Chapa account (for local Ethiopian payments)

### Local Development

1. Clone the repository

   ```
   git clone https://github.com/fayinan/teguaze.git
   cd teguaze
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Set up your environment variables
   Create a `.env` file with the following variables:

   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server
   ```
   npm run dev
   ```

### Supabase Configuration

1. **Create Supabase Project**

   - Sign up/login to [Supabase](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key to your `.env` file

2. **Database Setup**

   - The necessary tables will be created through migrations in the `supabase/migrations` folder
   - Apply migrations by running the SQL scripts in Supabase's SQL editor

3. **Setting Up Email Templates**

   - The email templates are already configured in the edge function `email-templates`
   - Navigate to the Supabase dashboard > Edge Functions
   - The function is automatically deployed when you deploy your application
   - To use these templates, your application code will call this edge function
   - Templates available: welcome, booking_confirmation, and password_reset

4. **Auth Configuration**
   - Navigate to Authentication > Settings
   - Configure your site URL
   - Enable Email provider
   - Customize email templates by going to Authentication > Email Templates:
     - For "Confirm signup" template, call your edge function with template "welcome"
     - For "Reset password" template, call your edge function with template "password_reset"

## Payment Gateway Setup 💳

### Stripe

1. Create a [Stripe](https://stripe.com) account
2. Get your API keys from the Stripe Dashboard
3. Add keys to Supabase Edge Function secrets
4. Configure webhook URL in Stripe Dashboard:
   `https://your-domain.com/api/stripe-webhook`
5. Add the webhook secret to Supabase Edge Function secrets

### Chapa

1. Create a [Chapa](https://chapa.co) account
2. Get your API keys from the Chapa Dashboard
3. Add keys to Supabase Edge Function secrets
4. Configure webhook URL in Chapa Dashboard:
   `https://your-domain.com/api/chapa-webhook`

## Deployment 🌐

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add your environment variables
4. Deploy!

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the correct build settings
3. Add your environment variables
4. Deploy!

## Maintenance and Updates 🔧

### Adding New Cars

1. Log in as an admin
2. Navigate to the admin dashboard
3. Click "Add Car" and fill in the details
4. Upload high-quality images
5. Save the new car listing

### Managing Bookings

1. Log in as an admin
2. Navigate to the admin dashboard
3. View all bookings in the bookings table
4. Filter and search to find specific bookings
5. Update booking status as needed

## Troubleshooting 🛠️

### Common Issues

- **Payment Processing Errors**: Verify API keys in Edge Function secrets
- **Image Upload Failures**: Check storage bucket permissions
- **Email Delivery Issues**: Verify email templates are correctly set up

### Support and Contact

For support, please contact support@Teguaze .com

## License 📄

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements 🙏

- Icons by [Lucide](https://lucide.dev/)
- UI components by [Shadcn/UI](https://ui.shadcn.com/)
