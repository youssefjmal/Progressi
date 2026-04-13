# wakelni - AI Fitness Coach Setup Guide

## Overview

wakelni is a bilingual (English/French) fitness coaching web application that combines nutrition tracking, AI-powered coaching, and calorie visualization with a custom watermelon chart.

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: Groq (via Vercel AI Gateway)
- **Real-time Chat**: AI SDK 6 with streaming responses

### Database Schema

#### Tables
- **profiles**: User fitness profiles with goals, weight, height, activity level
- **food_logs**: Daily food consumption logs with macro tracking
- **weight_history**: Historical weight tracking
- **foods**: Curated database of 100+ common foods with nutritional info

#### Row Level Security (RLS)
All tables have RLS policies protecting user data:
- Users can only view/edit their own records
- Foods table is publicly readable (for autocomplete)

## Setup Instructions

### 1. Environment Variables

Add these to your `.env.local`:

```bash
# Supabase (auto-configured if integrated)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# AI Gateway (required for chatbot)
AI_GATEWAY_API_KEY=your_ai_gateway_key
```

### 2. Database Migrations

The database schema is automatically created via migrations:
- `001_create_profiles.sql` - User profiles table with RLS
- `002_profile_trigger.sql` - Auto-creates profile on signup
- `003_create_food_logs.sql` - Food logging with macro tracking
- `004_create_weight_history.sql` - Weight history tracking
- `005_create_foods.sql` - Curated food database
- `006_seed_foods.sql` - Seeds 100+ common foods

All migrations use RLS for security.

### 3. Authentication Flow

1. User signs up at `/auth/sign-up` with email, password, and language preference
2. Supabase sends confirmation email
3. User confirms email and is redirected to `/auth/callback`
4. Automatic profile creation via database trigger
5. User logs in and accesses dashboard

### 4. Feature Walkthrough

#### Dashboard (`/dashboard`)
- Welcome message with user's name
- Quick stats: current weight vs goal weight
- Quick action buttons to log food or chat with coach

#### Food Logging (`/food`)
- Search from curated food database
- Log meals by type (breakfast, lunch, dinner, snacks)
- Automatic macro calculation based on serving size
- Daily summary showing total calories and macros

#### Calories Page (`/calories`)
- Custom watermelon SVG chart showing daily progress
- Calorie goal calculated based on weight + activity level
- Remaining calories display
- Detailed macro breakdown with percentages

#### AI Coach (`/chat`)
- Real-time streaming chat with Groq AI
- AI knows user's fitness profile for personalized coaching
- Conversational fitness advice and motivation

#### Profile (`/profile`)
- Edit personal info (name, age, gender, height)
- Update weight and fitness goals
- Change activity level
- Switch between English and French
- Logout

## Bilingual Support

- **Language Storage**: Stored in user profile + localStorage
- **Supported Languages**: English (en), French (fr)
- **Translation System**: Centralized in `lib/i18n.ts`
- **Language Switching**: Available in profile settings

All UI text uses the translation system via `t(language, 'key')` helper.

## Customization

### Adding More Foods
Edit `scripts/006_seed_foods.sql` or insert directly via Supabase dashboard:

```sql
INSERT INTO public.foods (name, calories, protein, carbs, fat, serving_size, serving_unit, category)
VALUES ('Apple', 52, 0.3, 14, 0.2, 100, 'g', 'Fruit');
```

### Adjusting Calorie Goals
The calorie goal formula is in `/app/calories/page.tsx`:
```typescript
const getCalorieGoal = (weight: number, activity: string): number => {
  const bmr = 10 * weight + 6.25 * 175 - 5 * 30 + 5;
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    'very active': 1.9,
  };
  return Math.round(bmr * (multipliers[activity] || 1.55));
};
```

### Watermelon Chart Styling
The chart is in `components/charts/watermelon-chart.tsx`. Customize colors:
- Green rind: `fill="#22c55e"`
- Red flesh: `fill="#ef4444"`
- Dark rind: `stroke="#16a34a"`

## Deployment to Vercel

1. Connect your GitHub repository
2. Add environment variables in Vercel Settings:
   - `AI_GATEWAY_API_KEY` - Required for chatbot
3. Deploy - all migrations run automatically
4. Test the full flow:
   - Sign up with confirmation email
   - Complete profile setup
   - Log some food
   - Check calories page
   - Chat with AI coach

## API Routes

### POST /api/chat
Streaming chat endpoint with user-personalized fitness context.

**Request**:
```json
{
  "messages": [
    { "role": "user", "content": "What should I eat?" }
  ]
}
```

**Response**: Server-sent events stream with text deltas

## Security Features

- **RLS Policies**: All data tables protected with row-level security
- **Email Confirmation**: Required before account activation
- **Password Hashing**: Handled by Supabase Auth
- **Session Management**: Secure HTTP-only cookies
- **API Protection**: Auth required for all user-specific endpoints

## Performance Optimizations

- Watermelon chart renders as lightweight SVG (no image uploads)
- Food search uses database indexes on name and category
- Daily logs cached until user refreshes
- Language preference cached in localStorage

## Troubleshooting

### Chatbot not responding
- Check `AI_GATEWAY_API_KEY` is set
- Verify Groq model availability
- Check `/api/chat` error logs

### Food logs not saving
- Verify user is authenticated
- Check email is confirmed
- Ensure profile exists (auto-created on signup)

### Weight not updating
- Profile must exist first
- Use profile settings to update weight
- Weight changes reflected immediately in calculations

## Future Enhancements

- Weekly/monthly progress charts
- Meal plan recommendations
- Exercise tracking
- Community challenges
- Mobile app with push notifications
- Wearable device integration
- Barcode food scanning
