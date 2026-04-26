# NutriScan AI - Demo Plan

Kohezgjatja e synuar: 5-7 minuta  
Live URL: https://nutri-scan-ai.vercel.app/

## 1. Cka eshte projekti dhe kujt i sherben

NutriScan AI eshte nje aplikacion web per menaxhim personal te ushqyerjes. Ai i sherben perdoruesve qe duan te ndjekin kalorite, makronutrientet, hidratimin dhe planin ushqimor pa bere shume llogaritje manuale.

Vlera kryesore:

- Perdoruesi krijon profilin me te dhenat personale dhe qellimin shendetesor.
- Aplikacioni perdor AI per te analizuar foto te ushqimit dhe per te vleresuar kalori, proteina, karbohidrate dhe yndyrna.
- Te dhenat ruhen dhe shfaqen ne dashboard, grafik progresi dhe plan ushqimor personal.

## 2. Flow kryesor qe do te demonstrohet

Flow i demos do te fokusohet te eksperienca kryesore e perdoruesit:

1. Hapja e aplikacionit ne live URL.
2. Login ose krijimi i llogarise.
3. Nese profili nuk eshte kompletuar, plotesimi i setup-it:
   - gender, mosha, gjatesia, pesha
   - diet type, activity level, goal
   - allergies, medical notes, meal frequency
4. Hapja e dashboard-it dhe shpjegimi i kartave kryesore:
   - kalorite ditore
   - protein/carbs/fats
   - recent scans
5. Demonstrimi i AI Scanner:
   - zgjedhja e nje fotoje ushqimi
   - upload ne Supabase Storage
   - analyze with AI
   - ruajtja e meal log
6. Hapja e Progress:
   - shfaqja e grafikut daily/weekly/monthly/yearly
   - shpjegimi se grafiku vjen nga meal logs te ruajtura
7. Hapja e Hydration:
   - shtimi ose heqja e gotave te ujit
   - shpjegimi i target-it ditor sipas peshes se perdoruesit
8. Hapja e AI Coach:
   - gjenerimi i planit te ri
   - daily plan, weekly plan, monthly tips
   - save plan, select previous plan, delete plan

## 3. Pjeset teknike qe do te shpjegohen shkurt

Gjate demos do te shpjegohen vetem pjeset kryesore teknike, pa hyre ne detaje te panevojshme:

- Next.js App Router perdoret per faqet `login`, `signup`, `setup`, `dashboard` dhe API routes.
- Supabase perdoret per authentication, profile data, meal logs, water logs, AI plan history dhe image storage.
- OpenAI API perdoret ne dy vende:
  - `/api/analyze-meal` per analizimin e fotos se ushqimit.
  - `/api/chat` per gjenerimin e planit ushqimor personal.
- Dashboard-i llogarit target-et ditore nga profili i perdoruesit dhe i kombinon me meal logs.
- Recharts perdoret per grafikun e progresit.
- Vercel perdoret per deploy live.

## 4. Cfare eshte kontrolluar para demos

Checklist para prezantimit:

- Live URL hapet ne browser.
- Login/sign up funksionon me nje llogari testuese.
- Profili testues eshte i plotesuar dhe hap dashboard-in pa error.
- Supabase tables jane te gatshme: `profiles`, `meal_logs`, `water_logs`, `ai_plans`.
- Supabase Storage bucket `meal-images` pranon upload dhe jep public URL.
- `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL` dhe `NEXT_PUBLIC_SUPABASE_ANON_KEY` jane vendosur ne Vercel.
- AI meal analysis kthen JSON me calories, protein, carbs dhe fats.
- AI Coach gjeneron plan dhe e ruan ne history.
- Hydration tracker ruan ndryshimet per daten e sotme.
- `npm run build` dhe `npm run lint` jane kontrolluar lokalisht para push-it.
- README eshte i perditesuar me live URL dhe udhezime.

## 5. Plani B nese live demo deshton

Nese live URL ose nje sherbim i jashtem deshton:

- Hapet projekti lokalisht me `npm run dev` dhe demo vazhdon nga `http://localhost:3000`.
- Perdoret nje llogari testuese qe ka tashme profil, meal logs dhe AI plans te ruajtura.
- Nese OpenAI API nuk pergjigjet, shpjegohet flow me te dhenat e ruajtura ne Supabase dhe tregohet UI i rezultateve ekzistuese.
- Nese upload i fotos deshton, tregohet pjesa `Recent Scans`, `Progress` dhe `AI Coach` nga te dhenat ekzistuese.
- Nese Supabase nuk punon, prezantimi vazhdon me screenshot/video te shkurter te flow-t kryesor dhe shpjegim te arkitektures.

## 6. Script i shkurter 5-7 minuta

Minute 0:00-1:00 - Prezantimi i problemit dhe zgjidhjes: NutriScan AI ndihmon perdoruesin te kuptoje ushqimin, kalorite, hidratimin dhe planin personal.

Minute 1:00-2:00 - Login/setup: tregoj si perdoruesi krijon profilin dhe pse keto te dhena jane te rendesishme per personalizim.

Minute 2:00-3:30 - Dashboard dhe AI Scanner: tregoj kalorite/macros, upload foto ushqimi, analyze with AI dhe save meal.

Minute 3:30-4:30 - Progress dhe Hydration: tregoj grafikun e kalorive dhe tracker-in e ujit.

Minute 4:30-6:00 - AI Coach: gjeneroj ose hap nje plan ekzistues, shpjegoj daily plan, weekly plan, monthly tips dhe history.

Minute 6:00-7:00 - Mbyllja: permend stack-un teknik, vleren e projektit dhe planin B nese nje API e jashtme nuk punon.

## 7. Mesazhi final per prezantim

NutriScan AI nuk eshte vetem nje dashboard, por nje asistent personal per ushqyerje. Ai bashkon profilin e perdoruesit, AI meal scanning, ruajtjen e te dhenave dhe rekomandimet personale ne nje flow te thjeshte qe mund te perdoret cdo dite.
