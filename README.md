# NutriScan AI

NutriScan AI is a Next.js web application for personal nutrition management. It helps users create a health profile, scan meal photos with AI, save meal logs, track calories and macros, monitor hydration, view progress charts, and generate personalized nutrition plans.

## Live Demo

Live URL: https://nutri-scan-ai.vercel.app/

Demo plan: [docs/demo-plan.md](docs/demo-plan.md)

## Main Features

- Supabase authentication for sign up, login, and session handling.
- Profile setup with gender, age, height, weight, diet type, activity level, health goal, allergies, medical notes, and meal frequency.
- AI meal scanner for image upload, calorie/macronutrient estimation, and meal saving.
- Dashboard with daily calorie and macronutrient targets based on the user profile.
- Recent meal logs with saved scans.
- Progress analytics for daily, weekly, monthly, and yearly calorie trends.
- Hydration tracker with daily water goals.
- AI Coach for daily meals, weekly guidance, monthly tips, saved plan history, and plan management.

## Tech Stack

- Next.js 16 with App Router
- React 18 and TypeScript
- Tailwind CSS
- Supabase Auth, Database, and Storage
- OpenAI API for meal analysis and nutrition plan generation
- Recharts for progress charts
- Framer Motion and Lucide React for UI interactions and icons
- Vercel for deployment

## Getting Started

Clone the repository:

```bash
git clone https://github.com/Ajete4/NutriScan-AI.git
cd NutriScan-AI
```

Install dependencies:

```bash
npm install
```

Create `.env.local` with the required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 in the browser.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Demo Flow

The recommended presentation flow is:

1. Open the live Vercel URL.
2. Log in or create an account.
3. Complete the profile setup if needed.
4. Show the dashboard daily stats and recent meal logs.
5. Upload and analyze a meal photo with the AI scanner.
6. Save the analyzed meal and show how it affects the dashboard/progress.
7. Open Hydration and update water intake.
8. Open AI Coach and show a generated nutrition plan, saved history, and plan management.

## Notes for Final Presentation

Before the demo, verify that Supabase tables, Supabase Storage bucket `meal-images`, and `OPENAI_API_KEY` are configured in the Vercel project. The full 5-7 minute script and backup plan are documented in `docs/demo-plan.md`.
