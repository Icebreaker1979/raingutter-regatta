RAINGUTTER REGATTA MOBILE PWA v1.2.0
====================================

Graphics-free mobile/tablet version of the Raingutter Regatta double-elimination tracker.
The same Progressive Web App (PWA) runs on iPhone, iPad, Android, Chromebook, Mac, and desktop browsers.

HOSTED APP
----------
https://icebreaker1979.github.io/raingutter-regatta/

WHAT'S NEW IN v1.2
------------------
- Safer New Tournament workflow
  - Save Backup & Start New
  - Start New Without Saving
  - Cancel
  - New Tournament button also appears after a champion is declared
- Better phone bracket controls
  - Zoom out / zoom in
  - Fit-to-phone view
  - Reset to 100%
  - Jump directly to the current race
  - Horizontal scroll snapping for touch screens
- Cleaner results/printing
  - Champion, Runner-Up, and Third Place summary after completion
  - Improved standings and race-log layout
  - Print / Save PDF wording and print styling
  - Downloadable printable HTML report
  - Race log starts on a separate printed page for cleaner reports
- About/version screen
  - Visible v1.2.0 version number
  - Hosted app address
  - QR code for sharing the app at an event
  - Share App Link button on supported devices
- Improved update behavior for future GitHub releases
  - New service worker cache version
  - Future updates can show an Update & Reload banner
- Existing v1 autosaves and .rrt save files remain compatible

CORE FEATURES
-------------
- Racer entry by boat number, name, or both
- Optional rank/den text
- Randomized starting order
- Double-elimination bracket logic
- Large touch-friendly winner buttons
- On Deck display
- Undo last result
- Live standings
- Live bracket view
- Printable/shareable results
- Automatic local recovery after every completed race
- Save Tournament (.rrt) and Load Tournament
- Offline capability after the PWA is installed/cached
- No Python required on iOS or Android

UPDATING THE EXISTING GITHUB PAGES SITE
---------------------------------------
Your existing GitHub repository is:
  icebreaker1979/raingutter-regatta

To update from v1 to v1.2:
1. Open the repository on GitHub.
2. Choose Add file -> Upload files.
3. Upload/replace these files from this package:
     index.html
     app.js
     engine.js
     styles.css
     manifest.webmanifest
     service-worker.js
     icons/icon-192.png
     icons/icon-512.png
     icons/app-link-qr.png
4. Commit the changes to main.
5. GitHub Pages will redeploy automatically.

IMPORTANT FOR ALREADY-INSTALLED PHONES
--------------------------------------
The existing v1 PWA may briefly continue using its cached files while the service worker updates.
After GitHub finishes deploying:
1. Open the installed Regatta app while online.
2. Close it completely.
3. Reopen it.
4. Check About at the bottom of the app. It should say v1.2.0.

If a future version is detected while v1.2 is running, the app is designed to show an
"Update & Reload" banner.

Your existing v1 autosaved tournament uses the same storage key and is intentionally preserved.
Portable .rrt files saved by v1 remain loadable in v1.2.

INSTALLING ON A PHONE
---------------------
The app must be served from an HTTPS web address for normal PWA install/offline behavior.

IPHONE / IPAD
-------------
1. Open the hosted address in Safari.
2. Tap Share.
3. Tap Add to Home Screen.
4. If offered, enable Open as Web App.
5. Tap Add.

ANDROID
-------
1. Open the hosted address in Chrome.
2. Use the Install button or browser menu.
3. Choose Install app / Add to Home screen.
4. Confirm.

After the app has cached its files, it is designed to continue working without internet access.
Tournament data remains on the device unless you also save an .rrt file.

LOCAL TEST ON WINDOWS
---------------------
Python is not required on the phone, but you can preview locally on Windows:
1. Double-click Start_Local_Test_Server.bat
2. Open http://localhost:8080

SAVE / LOAD
-----------
The app automatically stores the current tournament in browser storage after every completed race.
Use Save File to create a portable .rrt backup. Use Load File to restore one.

If you clear browser/site data or uninstall the PWA, browser-only autosave data may be removed.
Saving an .rrt file gives you a separate backup you can keep in Files/Downloads/cloud storage.

FILES
-----
index.html                  Main app page
styles.css                  Mobile-responsive and print layout
engine.js                   Double-elimination tournament engine
app.js                      Interface, saving, results, update behavior
manifest.webmanifest        Installable-app metadata
service-worker.js           Offline cache and future update handling
icons/icon-192.png          App icon
icons/icon-512.png          App icon
icons/app-link-qr.png       QR code for hosted GitHub Pages app
Start_Local_Test_Server.bat Easy Windows preview server

VERSION
-------
Mobile PWA v1.2.0
