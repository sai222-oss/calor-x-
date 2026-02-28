Mobile build guide — Capacitor (Android + iOS)

Goal: wrap your existing web app (Vite) into native Android and iOS apps using Capacitor.

Prerequisites
- Node.js + npm installed.
- Android: Android Studio installed (for building/signing). Java JDK as required by Android Studio.
- iOS: macOS with Xcode to build/upload to App Store, or use a cloud mac builder.
- Google Play Console account (one-time $25) and Apple Developer account ($99/yr) to publish apps.

Quick commands (run from project root)
1) Install Capacitor (already present in package.json). If not installed run:
   npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

2) Initialize Capacitor (only if not initialized)
   npm run cap:init
   # Follow prompts: App id (reverse domain, e.g. com.yourcompany.calorx), App name

3) Build web assets
   npm run build

4) Add native platforms (first-time only)
   npm run cap:add:android
   npm run cap:add:ios

5) Copy web assets into native projects
   npm run cap:copy

6) Open native projects
   npm run cap:open:android   # opens Android Studio
   npm run cap:open:ios       # opens Xcode (mac only)

Android: produce signed AAB
- In Android Studio: Build > Generate Signed Bundle / APK > Android App Bundle.
- Create or use an existing keystore, sign the app, and produce an AAB. Upload to Google Play Console.

iOS: archive & upload
- On macOS: open the Xcode workspace (App -> Products -> Archive) and upload to App Store Connect.
- If you don't have a Mac, consider:
  - Using a cloud mac builder (GitHub Actions with macos-latest or a paid service) to produce the archive; you'll need to provide signing credentials.

CI / Cloud build options
- You can automate builds with GitHub Actions. For iOS you need macOS runners and Apple credentials. I can scaffold a GitHub Actions workflow if you want.

Notes & tips
- Adjust `capacitor.config.ts` (appId, appName, server.url for live reload) as needed.
- For development with live reload on device, set `server.url` to your dev server reachable from device, or use `npx cap run android --livereload --host <your-ip>`.
- Keep secrets (keystore, Apple certs) out of the repo — store them as GitHub Secrets or in your CI.

Development: live-reload on device (recommended during iterative work)
-----------------------------------------------------------------
1) Start your Vite dev server reachable on your LAN (on your PC):

```powershell
cd C:\Users\user\calor-x
npm run dev -- --host
```

2) Find your PC LAN IP (IPv4) and set `CAPACITOR_DEV_SERVER_URL` env var to the URL, e.g.:

PowerShell (temporary for the shell):
```powershell
$env:CAPACITOR_DEV_SERVER_URL = "http://192.168.1.42:5173"
```

3) Run Capacitor with livereload on device (Android example). Replace the IP with your PC IP:

```powershell
# Run with live reload (preferred):
npx cap run android --livereload --host 192.168.1.42

# If you prefer to copy built assets into the native project:
npm run cap:copy:build
npm run cap:open:android
```

For iOS (requires macOS/Xcode):

```bash
export CAPACITOR_DEV_SERVER_URL=http://192.168.1.42:5173
npx cap run ios --livereload --host 192.168.1.42
```

Notes:
- The `CAPACITOR_DEV_SERVER_URL` env var is used by `capacitor.config.ts` to point the native runtime to your dev server. If it's set, the native app will load the live dev server instead of local `dist/` assets.
- When using live-reload, the native app will fetch JS/CSS from the dev server; ensure your phone and PC are on the same network and that any firewall allows port 5173.
- If live-reload isn't working, run `npm run cap:copy:build` then open the native project in Android Studio / Xcode and run the app normally (without livereload).

If you want, I can:
- Add a small `capacitor.config.ts` if it doesn't exist or update it.
- Scaffold GitHub Actions to build Android (and iOS on mac runners) and upload to Play Store/App Store Connect (you'll need to supply secrets).

Which of the following should I do next?
1) Create/update `capacitor.config.ts` in the repo and ensure it's wired.
2) Scaffold GitHub Actions for Android AAB build (fast) and outline iOS steps.
3) Walk you through opening Android Studio and building a signed AAB locally.

Reply with 1, 2, or 3.

CI / GitHub Actions
-------------------
I added example GitHub Actions workflows under `.github/workflows/`:

- `android-aab.yml` — builds an Android AAB (runs on ubuntu). It will produce an AAB artifact and upload it to the workflow artifacts. If you need a signed AAB, provide your keystore and configure Gradle signing in the `android` project.

- `ios-ipa.yml` — archives an iOS app and (optionally) exports an IPA (runs on macOS). iOS build requires Apple signing credentials and an `exportOptions.plist` suitable for your account/team.

Required secrets for CI (recommended)
- ANDROID_KEYSTORE_BASE64 — base64-encoded keystore (optional if you want CI to sign the AAB)
- KEYSTORE_PASSWORD
- KEY_ALIAS
- KEY_PASSWORD
- APPLE_CERT_BASE64 — base64-encoded p12 certificate (for iOS)
- APPLE_CERT_PASSWORD
- APPLE_PROV_PROFILE_BASE64 — base64-encoded provisioning profile

How to add secrets in GitHub:
1. Go to your repository → Settings → Secrets and variables → Actions.
2. Add each secret name and value.

Notes:
- The example workflows assume `npx cap add android|ios` will create the native projects if missing. For repeatable CI it's better to check the native `android/` and `ios/` folders into source control or create a custom CI step to prepare them.
- I can help scaffold a complete CI flow that signs the Android AAB and uploads it to the Play Console automatically when you provide the Play service account JSON and keystore.
