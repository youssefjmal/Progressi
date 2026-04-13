# wakelni - Quick Start Guide

## What You Get

A complete, ready-to-deploy fitness coaching app with:
- User authentication (email/password)
- Food logging with macro tracking
- Calorie visualization (custom watermelon chart)
- AI fitness coach (Groq-powered)
- Bilingual support (English/French)
- Mobile-optimized UI

## 30-Second Setup

1. **Clone or download this project**
2. **Integrations needed:**
   - Supabase (connected automatically - provides database & auth)
   - AI Gateway API key (for chatbot feature)

3. **Set environment variable:**
   ```bash
   AI_GATEWAY_API_KEY=your_key_here
   ```

4. **Deploy to Vercel:**
   - Connect GitHub repository
   - Add the environment variable above
   - Click Deploy
   - Database migrations run automatically

5. **Test the app:**
   - Go to landing page
   - Click "Get Started"
   - Sign up with email
   - Confirm email via link
   - Complete profile setup
   - Start logging food!

## Key Pages

| URL | Purpose |
|-----|---------|
| `/` | Landing page |
| `/auth/signup` | Create account (with language selection) |
| `/auth/login` | Sign in |
| `/dashboard` | Home page (after login) |
| `/profile` | Edit profile & settings |
| `/food` | Log food for meals |
| `/calories` | View daily intake with watermelon chart |
| `/chat` | Chat with AI fitness coach |

## Features Explained

### Food Logging
- Search curated database of 100+ foods
- Log by meal type (breakfast, lunch, dinner, snacks)
- Macros calculate automatically based on quantity
- View daily totals

### Calorie Tracking
- Custom watermelon 🍉 chart shows daily progress
- Calorie goal calculated from your weight + activity level
- See remaining calories instantly
- Detailed macro breakdown with percentages

### AI Coach
- Real-time chat with fitness advice
- AI knows your profile for personalized coaching
- Conversational, encouraging, practical tips
- Powered by Groq LLM via Vercel AI Gateway

### Bilingual
- Choose English or French at signup
- Switch language anytime in profile
- All UI text in both languages

## Database

Supabase PostgreSQL with:
- **profiles**: User fitness info
- **food_logs**: Daily meals with macros
- **weight_history**: Track weight changes
- **foods**: 100+ foods database

All data is secured with Row Level Security (RLS).

## Customization

### Change Colors
Edit `app/globals.css` color tokens:
```css
:root {
  --primary: oklch(...);
  --accent: oklch(...);
}
```

### Add More Foods
Insert into `public.foods` table:
```sql
INSERT INTO foods (name, calories, protein, carbs, fat, serving_size, serving_unit, category)
VALUES ('Rice', 130, 2.7, 28, 0.3, 100, 'g', 'Grains');
```

### Change Watermelon Chart Colors
Edit `components/charts/watermelon-chart.tsx`:
```tsx
<circle fill="#22c55e" />     // Green rind
<rect fill="#ef4444" />       // Red flesh
```

### Modify Calorie Goal Formula
In `app/calories/page.tsx`:
```typescript
const getCalorieGoal = (weight: number, activity: string) => {
  // Customize BMR and multiplier calculation here
};
```

## Common Tasks

### Reset User Data
Delete user profile from Supabase dashboard (cascades to all their data)

### View Logs
Open Supabase dashboard → `food_logs` table

### Update Food Database
Supabase dashboard → `foods` table → Insert/Edit rows

### Change Language Strings
Edit `lib/i18n.ts` translation objects (en/fr)

## Troubleshooting

**Chatbot not working?**
- Check `AI_GATEWAY_API_KEY` is set in Vercel
- Restart deployment after setting env var

**Food logs not saving?**
- Verify email is confirmed
- Check database has row level security policies
- Verify user is logged in

**Page blank after signup?**
- Check email confirmation worked
- Verify profile table has data
- Check browser console for errors

**Language not switching?**
- Clear localStorage
- Re-login to sync language
- Check profile has language field

## Deployment Steps

### Via Vercel (Recommended)

1. Push code to GitHub
2. Connect repo to Vercel
3. Add `AI_GATEWAY_API_KEY` to environment variables
4. Click "Deploy"
5. Done! Migrations run automatically

### Via Docker

```bash
docker build -t wakelni .
docker run -p 3000:3000 -e AI_GATEWAY_API_KEY=xxx wakelni
```

### Via Self-Hosted

1. Setup Node.js and PostgreSQL
2. Set up Supabase (or self-hosted Postgres)
3. Run migrations manually
4. `npm install && npm run build && npm start`

## Performance Tips

- Food search is indexed (fast)
- Logs cache until refresh (snappy)
- Watermelon chart is SVG (lightweight)
- Language cached in localStorage (instant switch)
- Images optimized automatically

## Security Features

- ✅ Row Level Security on all tables
- ✅ Email confirmation required
- ✅ Password hashing (Supabase Auth)
- ✅ HTTP-only cookies for sessions
- ✅ SQL injection prevention
- ✅ CORS configured
- ✅ No sensitive data in client code

## File Structure Highlights

```
app/                     # Next.js pages and API routes
├── page.tsx             # Landing
├── dashboard/           # User dashboard
├── food/                # Food logging
├── calories/            # Calories tracking
├── chat/                # AI coach
├── profile/             # User settings
└── api/chat/route.ts    # AI chat endpoint

components/
├── charts/              # Custom watermelon chart
├── navigation/          # Bottom navigation
└── ui/                  # 60+ shadcn components

lib/
├── i18n.ts              # Translations (EN/FR)
├── language-context.tsx # Language state management
└── supabase/            # Database client

scripts/
├── 001_create_profiles.sql       # Schema
├── 002_profile_trigger.sql       # Auto-profile on signup
├── 003_create_food_logs.sql      # Food table
├── 004_create_weight_history.sql # Weight tracking
├── 005_create_foods.sql          # Foods database
└── 006_seed_foods.sql            # Initial foods data
```

## Next Steps

1. **Test Signup Flow**
   - Sign up with test email
   - Confirm email
   - Complete profile

2. **Test Food Logging**
   - Log breakfast (e.g., oatmeal + eggs)
   - Check calories page
   - Verify totals

3. **Test AI Coach**
   - Ask fitness question
   - See AI respond with personalized advice
   - Verify AI knows your profile

4. **Verify Bilingual**
   - Change language in profile
   - All UI text updates immediately
   - Language persists on refresh

5. **Deploy to Production**
   - Connect GitHub
   - Add env var
   - Click deploy
   - Share with friends!

## Support

For issues:
1. Check SETUP.md for detailed instructions
2. Check PROJECT_SUMMARY.md for architecture details
3. Check console logs for error messages
4. Verify Supabase connection
5. Verify AI_GATEWAY_API_KEY is set

## License

MIT - Use freely in your projects

---

**Ready to launch your fitness coaching app?** Deploy to Vercel now!
