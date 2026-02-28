DEV CHECKLIST — Calor X

Goal: concise tasks and commands to move from dev → QA → build-ready mobile apps.

1) Environment
- Required env vars (local & Supabase):
  - OPENAI_API_KEY
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
- Keep secrets out of git. Use Supabase dashboard and GitHub Secrets.

2) Local dev (web)
- Start dev server (LAN):
  - PowerShell: cd C:\Users\user\calor-x && npm run dev -- --host
- Open on desktop: http://localhost:5173
- Open on phone (same Wi‑Fi): http://<PC_IP>:5173

3) Local dev (Capacitor native, live-reload)
- Start web server on LAN (see above).
- In same shell set dev server env:
  - PowerShell: $env:CAPACITOR_DEV_SERVER_URL = "http://<PC_IP>:5173"
- Run on Android with live reload:
  - npx cap run android --livereload --host <PC_IP>
- Alternative: npm run cap:copy:build then open Android Studio: npm run cap:open:android

4) Verify backend & AI
- Dry-run parsing & fuzzy match: deno run --allow-read supabase/functions/analyze-food/dry_run_test.ts
- Smoke test analyze function (deployed): POST JSON { imageUrl, imageHash, userId } to your function URL.
- Verify Supabase `image_analysis_cache` rows created with correct analysis_version.
- Acceptance: sample Arabic dishes return consistent dish_label and total calories.

5) Tests
- Add unit tests for:
  - calculateHammingDistance (edge cases: unequal lengths, case + whitespace)
  - AI response parsing (raw JSON, fenced JSON, messy text)
- Integration: mock OpenAI response and assert normalization + cache insert.

6) CI & builds
- Android CI: .github/workflows/android-aab.yml exists — add these secrets:
  - ANDROID_KEYSTORE_BASE64, KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD
- iOS CI: .github/workflows/ios-ipa.yml exists — add Apple cert/prov secrets.
- Local Android release: Build signed AAB in Android Studio (Generate Signed Bundle / APK).

7) Monitoring & QA
- Add logs for AI token usage, function latency, cache hit/miss.
- Manually test shared-plate photos, bread, rice dishes (Kabsa, Mandi), and common edge cases (salads, soups).
- Track user corrections in `user_corrections` table and prioritize fixes.

8) Security & privacy
- Remove any pasted API keys from chats and local history.
- Add privacy policy explaining image storage & retention.
- Enforce RLS policies in Supabase (already present in migrations).

9) Release checklist (before publishing)
- Beta tests: internal Play track + TestFlight with 10–50 testers
- Fix top bugs, verify analytics + crash reporting
- Prepare store listing (icons, screenshots, localized descriptions)
- Upload Android AAB and iOS archive

If you want, I can:
- Scaffold unit tests for the function (Hamming + parsing)
- Add a GitHub Actions job to sign AAB using secrets
- Walk through Android Studio signing steps with screenshots

Pick one next action: scaffold tests, CI signing, or Android signing walkthrough.
