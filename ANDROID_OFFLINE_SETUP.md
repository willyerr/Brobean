# Brobean Android Offline Setup

This patch adds an Android-native path for local data storage while preserving the current Express/Axios path for the web app.

## What changes

- Capacitor 8 wraps the existing React + Vite frontend.
- `@capacitor-community/sqlite` stores Android data in the app's private local storage.
- Bean, Preparation, Brew Log, and parameter values use the existing schema concepts.
- The web browser continues to use the Express API at `http://localhost:3000/api`.
- GitHub Actions builds a debug APK and uploads it as a workflow artifact. Pushing a tag such as `v0.1.0` also attaches the APK to a GitHub Release.

## Apply the patch

Extract this ZIP into the root of your existing `G:\Tugas Pak haryano` repository and allow files to merge/replace. Do not extract into a new nested folder.

Then run PowerShell:

```powershell
cd "G:\Tugas Pak haryano"
npm install
npm run build:web
npx cap add android
npx cap sync android
npx cap open android
```

If `android` already exists, skip `npx cap add android` and run `npx cap sync android`.

Android Studio requirements: Android Studio with Android SDK installed and JDK 21. Capacitor 8 requires a recent Android Studio installation. The GitHub Actions workflow uses Node 22 and Java 21.

## Build locally

```powershell
npm run build:web
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

APK output:

`android\app\build\outputs\apk\debug\app-debug.apk`

## Build on GitHub

1. Commit and push the patch to `master`.
2. Open the repository's **Actions** tab.
3. Select **Build Android APK** and run **Run workflow**.
4. Download `brobean-debug-apk` from the completed workflow run's Artifacts section.
5. To publish an APK under **Releases**, create and push a version tag, e.g. `git tag v0.1.0` then `git push origin v0.1.0`.

This workflow produces a debug-signed APK for testing and direct installation. It is not a Play Store production release. A production release should use a private signing keystore stored as GitHub Actions secrets.

## Important notes

- The Android app is offline-first and has its own database on each phone. Data is not automatically synchronized with the web backend or another phone.
- Existing data in the Express backend's SQLite file is not automatically copied to the Android phone. A separate export/import or sync feature is needed for that.
- The SQLite plugin uses SQLCipher even when database encryption is disabled in this starter configuration. Review its export-compliance notice before distributing the app publicly.
- This is the first integration patch. Run the web build and test Bean CRUD, Brew Log CRUD, archive/restore, and parameter validation on a real Android device before treating it as a release candidate.
