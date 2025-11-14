# AIC Kimalel Saramek Church Website

![AIC Kimalel Saramek Church Website](https://mltlmcqkqqiubrjeasif.supabase.co/storage/v1/object/public/folders/photos/AIC%20%20Design.png)

This is a modern, feature-rich website for the AIC Kimalel Saramek Church, built with Next.js, Tailwind CSS, and Supabase. It includes a comprehensive public-facing site and a secure admin dashboard for managing content.

## Key Features

- **Public-Facing Website:** A beautiful, responsive interface for visitors to learn about the church, its ministries, service times, and events.
- **Admin Dashboard:** A secure area for church administrators to manage sermons, events, prayer requests, and newsletter subscribers.
- **Supabase Integration:** Uses Supabase for database storage and user authentication for the admin panel.
- **AI Sermon Assistant:** A Genkit-powered feature allowing users to ask questions about a featured sermon.
- **Dynamic Content:** Most content, including sermons and events, is dynamically pulled from the Supabase database.
- **Component-Based UI:** Built with React and ShadCN UI components for a consistent and maintainable design.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **Database & Auth:** [Supabase](https://supabase.io/)
- **Generative AI:** [Firebase Genkit](https://firebase.google.com/docs/genkit)
- **Deployment:** Vercel, Firebase App Hosting, or any other Next.js compatible platform.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- A [Supabase](https://supabase.io/) account to create your database and get API keys.
- A [Google AI API Key](https://aistudio.google.com/app/apikey) for the AI Sermon Assistant.

### 2. Installation

First, clone the repository and install the dependencies:

```bash
git clone <your-repository-url>
cd <repository-name>
npm install
```

### 3. Environment Variables

Create a file named `.env.local` in the root of your project and add the following environment variables. You can get the Supabase URL and anon key from your Supabase project's "API Settings" page.

```
# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google AI API Key (for Genkit)
GEMINI_API_KEY=your_google_ai_api_key_here
```
# Pesapal Credentials
PESAPAL_CONSUMER_KEY=your_key_here
PESAPAL_CONSUMER_SECRET=your_key_here

#PESAPAL_MERCHANT_ID=your_merchant_id_here

# Environment (sandbox/live)
PESAPAL_ENVIRONMENT=sandbox

# Callback URLs
NEXT_PUBLIC_APP_URL=http://localhost:9002
PESAPAL_IPN_URL=http://localhost:9002/api/payments/ipn
PESAPAL_CALLBACK_URL=http://localhost:9002/donation/success

### 4. Set Up Supabase Database

Log in to your Supabase account and run the following SQL queries in the **SQL Editor** to create the necessary tables for the application.

-- Create the sermons table
CREATE TABLE IF NOT EXISTS public.sermons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    preacher TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    description TEXT,
    media_url TEXT,
    tags TEXT[],
    type TEXT,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    day_held DATE
);

-- Create the events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    location TEXT,
    ministry TEXT,
    description TEXT,
    published BOOLEAN DEFAULT false,
    image_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create the subscribers table
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create the contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'Unread',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create the event_rsvps table
CREATE TABLE IF NOT EXISTS public.event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    event TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create the ministries table
CREATE TABLE IF NOT EXISTS public.ministries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    image_id TEXT,
    href TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create the donations table
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    amount NUMERIC NOT NULL,
    message TEXT,
    transaction_id TEXT UNIQUE,
    payment_method TEXT NOT NULL,
    mpesa_receipt TEXT,
    bank_reference TEXT,
    card_last_four TEXT,
    payment_status TEXT DEFAULT 'pending',
    currency TEXT DEFAULT 'KES',
    payment_gateway TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the stories table
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category TEXT NOT NULL,
    contributor_name TEXT NOT NULL,
    contributor_email TEXT,
    contributor_phone TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'draft' CHECK (status = ANY (ARRAY['draft', 'published', 'archived'])),
    featured BOOLEAN DEFAULT false,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the prayer_requests table
CREATE TABLE IF NOT EXISTS public.prayer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    prayer_type TEXT DEFAULT 'general' CHECK (prayer_type = ANY (ARRAY['general', 'healing', 'family', 'financial', 'guidance', 'thanksgiving', 'other'])),
    is_anonymous BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'unread' CHECK (status = ANY (ARRAY['unread', 'in_progress', 'prayed_for', 'resolved', 'archived'])),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name TEXT DEFAULT 'Our Church',
    site_description TEXT DEFAULT 'A loving community of believers',
    contact_email TEXT DEFAULT 'info@ourchurch.org',
    pastor_name TEXT DEFAULT 'Pastor John Doe',
    church_address TEXT DEFAULT '123 Church Street, City, State 12345',
    service_times TEXT DEFAULT 'Sunday: 9:00 AM & 11:00 AM\nWednesday: 7:00 PM',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the ministry_signups table
CREATE TABLE IF NOT EXISTS public.ministry_signups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ministry_name VARCHAR NOT NULL,
    full_name VARCHAR NOT NULL,
    email VARCHAR,
    phone_number VARCHAR,
    parent_name VARCHAR,
    child_name VARCHAR,
    child_age INT,
    additional_info JSONB,
    status VARCHAR DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

### 5. Create an Admin User

To access the admin dashboard, you need to create a user.

1.  In your Supabase dashboard, go to **Authentication** > **Users**.
2.  Click **"Create user"**.
3.  Enter an email and a secure password.
4.  This email and password will be used to log in on the `/login` page of the website.

### 6. Running the Development Server

You can now start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.
- The public website is at `http://localhost:9002/`.
- The admin login page is at `http://localhost:9002/login`.

## Project Structure

- `src/app/`: Main application source, using the Next.js App Router.
  - `(public)`: Route group for all public-facing pages.
  - `admin/`: Route group for the admin dashboard pages.
  - `api/`: API routes.
  - `actions.ts`: Server Actions for handling form submissions.
- `src/components/`: Reusable React components.
  - `sections/`: Larger page sections.
  - `ui/`: Core UI components from ShadCN.
  - `admin/`: Components specific to the admin dashboard.
- `src/lib/`: Utility functions and constants.
- `src/ai/`: Genkit flows and AI-related code.
- `src/utils/supabase/`: Supabase client and server configurations.
- `public/`: Static assets like images and fonts.

## Deployment

This Next.js application is ready for deployment on platforms like Vercel or Firebase App Hosting.

- **Environment Variables:** Ensure you have set the `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `GEMINI_API_KEY`,'PESAPAL_CONSUMER_KEY' and 'PESAPAL_CONSUMER_SECRET' environment variables in your deployment provider's settings.
- **Build Command:** `npm run build`
- **Start Command:** `npm run start`

For more details, refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment).
