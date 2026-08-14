RAINGUTTER REGATTA MOBILE PWA
=============================

This is the graphics-free mobile/tablet version of the Raingutter Regatta double-elimination tracker.
It is a Progressive Web App (PWA), so the same package can run on iPhone, iPad, Android, Chromebook,
Mac, and desktop browsers.

FEATURES
--------
- Racer entry by boat number, name, or both
- Optional rank/den text
- Randomized starting order
- Double-elimination bracket logic
- Large touch-friendly winner buttons
- On Deck display
- Undo last result
- Live standings
- Live bracket view
- Printable results
- Share/download results
- Automatic local recovery after every completed race
- Save Tournament (.rrt) and Load Tournament
- Offline capability after the PWA is installed/cached
- No Python required on iOS or Android

IMPORTANT: INSTALLING ON A PHONE
--------------------------------
A PWA must be served from a web address (normally HTTPS) to be installable and offline-capable.
Opening index.html directly from a ZIP/file is useful for a quick preview, but it is not the final
mobile installation method.

To deploy it, upload the CONTENTS of this folder to any static HTTPS web host. The host does not need
PHP, Python, a database, or any server-side code. It only needs to serve these files as-is.

Then open that HTTPS address on the phone/tablet.

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
2. Use the browser menu or the app's Install button.
3. Choose Install app / Add to Home screen.
4. Confirm.

After the app has loaded and its files have been cached, it is designed to keep working without an
internet connection. Tournament data is stored locally on that device unless you also save an .rrt file.

LOCAL TEST ON WINDOWS
---------------------
Python is NOT required on the phone, but because you already have Python on the Windows PC, you can
preview the PWA through a local web server:

1. Double-click Start_Local_Test_Server.bat
2. Your browser should open http://localhost:8080
3. To test from a phone on the SAME Wi-Fi, find the Windows PC's local IPv4 address with:

   ipconfig

4. On the phone, browse to:

   http://YOUR-PC-IP:8080

Example:
   http://192.168.1.25:8080

NOTE: Some PWA install/offline features require HTTPS and may not fully work when testing from a phone
over a plain http:// local-network address. Localhost on the computer is treated differently by browsers.

SAVE / LOAD
-----------
The app automatically stores the current tournament in the browser after every completed race.
Use Save File to create a portable .rrt tournament file. Use Load File to restore one.

If you clear browser/site data or uninstall the PWA, browser-only autosave data may be removed.
Saving an .rrt file gives you a separate backup you can keep in Files/Downloads/cloud storage.

FILES
-----
index.html                Main app page
styles.css                Mobile-responsive layout and print styles
engine.js                 Double-elimination tournament engine
app.js                    App interface, saving, results, and PWA behavior
manifest.webmanifest      Installable-app metadata
service-worker.js         Offline file cache
icons/                    Generic unbranded app icons
Start_Local_Test_Server.bat  Easy Windows preview server

VERSION
-------
Mobile PWA v1
