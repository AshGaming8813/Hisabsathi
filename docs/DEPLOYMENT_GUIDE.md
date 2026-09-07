# HisabSaathi - Deployment & Android Build Guide 📱

This document provides step-by-step instructions for testing, building, generating Android APK/AAB packages, and deploying **HisabSaathi** to the Google Play Store.

---

## 1. Local Development & Production Web Build

### Development Mode
To run the app locally with hot reload:
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser or mobile browser.

### Production Web Build
To compile TypeScript and bundle static assets into the `dist/` directory:
```bash
npm run build
```
To preview the production bundle locally:
```bash
npm run preview
```

---

## 2. Generating Android APK & AAB Files

HisabSaathi is a mobile-first web app that can be packaged into an native Android app using **Capacitor** or **Bubblewrap TWA (Trusted Web Activity)**.

### Option A: Using Capacitor (Recommended for Native Android App)

#### Step 1: Install Capacitor CLI & Core
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

#### Step 2: Initialize Capacitor Config
```bash
npx cap init HisabSaathi com.hisabsaathi.app --web-dir dist
```

#### Step 3: Build Web Assets & Add Android Platform
```bash
npm run build
npx cap add android
```

#### Step 4: Open Project in Android Studio
```bash
npx cap open android
```

#### Step 5: Build Signed APK / AAB in Android Studio
1. In Android Studio, select **Build > Generate Signed Bundle / APK**.
2. Select **Android App Bundle (.aab)** for Google Play Store or **APK** for direct device installation.
3. Create or select your Release Keystore file (`hisab-key.jks`).
4. Select **release** build variant and click **Create**.
5. The generated `.aab` file will be saved in `android/app/release/app-release.aab`.

---

### Option B: Using Trusted Web Activity (Bubblewrap CLI)

#### Step 1: Install Bubblewrap
```bash
npm install -g @bubblewrap/cli
```

#### Step 2: Initialize PWA TWA Project
```bash
bubblewrap init --manifest=https://your-domain.com/manifest.json
```

#### Step 3: Build Signed APK & AAB
```bash
bubblewrap build
```

---

## 3. Google Play Store Publishing Guide 🚀

### Pre-Requisites
1. **Google Play Console Account**: Register at [play.google.com/console](https://play.google.com/console) (one-time $25 registration fee).
2. **App Icons & Assets**:
   - High-res App Icon (512x512 PNG)
   - Feature Graphic (1024x500 PNG)
   - Mobile Screenshots (at least 2 phone screenshots, 1080x1920 or higher)
   - Tablet Screenshots (7-inch and 10-inch)

### Publishing Steps

1. **Create New App in Play Console**:
   - App Name: `HisabSaathi: Udhaar & Money Tracker`
   - Default Language: Hindi (hi-IN) or English (en-IN)
   - App Type: App / Free

2. **Set Up Store Listing**:
   - **Short Description** (up to 80 chars): *Simple mobile finance, income, expense & Udhaar money manager for India.*
   - **Full Description**: Copy features highlights from HisabSaathi documentation (multilingual Hindi/English support, cash & bank balance tracking, Udhaar bahi-khata, offline privacy).

3. **Data Safety Declaration**:
   - Select **No data shared with third parties**.
   - Indicate that all data is stored **locally on the user device**.
   - Declare that no PINs, OTPs, or passwords are collected.

4. **Upload Release Bundle**:
   - Go to **Production > Create new release**.
   - Upload `app-release.aab`.
   - Enter release notes in Hindi & English.
   - Click **Save**, then **Review release** and **Start rollout to Production**.

---

## 4. Security & Compliance Checklist

- [x] Zero collection or storage of UPI PIN, ATM PIN, passwords, or OTPs.
- [x] Client-side IndexedDB database isolation.
- [x] Internal transfer separation (no artificial income/expense inflation).
- [x] Full offline capability with zero server dependency.
