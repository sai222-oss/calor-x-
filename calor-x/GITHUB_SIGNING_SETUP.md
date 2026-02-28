# GitHub CI Signing Setup

How to configure GitHub Actions so the Android and iOS workflows can produce **signed** builds ready for store submission.

---

## Android — Signed AAB

### Step 1: Generate a keystore (one-time)

```bash
keytool -genkey -v \
  -keystore calor-x-release.jks \
  -alias calor-x \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

You will be prompted for:
- **Keystore password** → remember this, it's `KEYSTORE_PASSWORD`
- **Key alias** → use `calor-x` (matches `KEY_ALIAS`)
- **Key password** → use the same or a different value (`KEY_PASSWORD`)
- DN fields (name, org, country) → any values are fine

> [!CAUTION]
> **Back up `calor-x-release.jks` securely.** If you lose this keystore you can never update your Play Store app — you'd have to publish under a new listing.

### Step 2: Base64-encode the keystore

**macOS / Linux:**
```bash
base64 -w 0 calor-x-release.jks | pbcopy   # copies to clipboard
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("calor-x-release.jks")) | Set-Clipboard
```

### Step 3: Add GitHub Secrets

Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | The base64 string from Step 2 |
| `KEYSTORE_PASSWORD` | The keystore password you chose |
| `KEY_ALIAS` | `calor-x` (or whatever alias you used) |
| `KEY_PASSWORD` | The key password you chose |

### Step 4: Run the workflow

Go to **Actions → Build & Sign Android AAB → Run workflow**.

The signed `.aab` will be available as a build artifact for download and upload to Google Play.

---

## iOS — Signed IPA

iOS signing requires Apple Developer account assets. The workflow at `.github/workflows/ios-ipa.yml` includes the build steps; you need to supply:

### Required secrets

| Secret Name | How to get it |
|---|---|
| `IOS_CERTIFICATE_P12_BASE64` | Export your Distribution cert from Keychain Access as `.p12`, base64-encode it |
| `IOS_CERTIFICATE_PASSWORD` | Password you set when exporting the `.p12` |
| `IOS_PROVISIONING_PROFILE_BASE64` | Download from Apple Developer Portal, base64-encode the `.mobileprovision` |
| `IOS_TEAM_ID` | Your 10-char Apple Team ID (found in developer.apple.com → Membership) |

### exportOptions.plist

The workflow references `ios/exportOptions.plist`. Create it in your repo:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>app-store</string>
  <key>teamID</key>
  <string>YOUR_TEAM_ID</string>
  <key>uploadBitcode</key>
  <false/>
  <key>compileBitcode</key>
  <false/>
</dict>
</plist>
```

### Recommended: use Fastlane Match

For production teams, [Fastlane Match](https://docs.fastlane.tools/actions/match/) is the standard way to manage iOS certs across machines and CI. It stores certs/profiles in a private Git repo and fetches them at build time.

---

## Verification

Once secrets are added and the Android workflow runs successfully, you should see:
- A green workflow run in the Actions tab
- A downloadable artifact called `android-signed-aab`
- The `.aab` should be importable into Google Play Console under **Internal Testing**
