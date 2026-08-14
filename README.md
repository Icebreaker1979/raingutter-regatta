# ⛵ Raingutter Regatta

### A mobile-friendly, offline-capable double-elimination race tracker

**Raingutter Regatta** is a lightweight Progressive Web App (PWA) designed to make running a Raingutter Regatta simple from a phone, tablet, or computer.

No account. No database. No special software. Just open the app, enter your racers, and start racing.

🌐 **Live App:**
**https://icebreaker1979.github.io/raingutter-regatta/**

---

## 🏁 Features

### Tournament Management

* Double-elimination tournament format
* Randomized starting bracket
* Enter racers by:

  * Boat number
  * Racer name
  * Both boat number and racer name
* Optional rank/den field
* Automatic byes when needed
* Winner's Bracket
* Loser's Bracket
* Grand Finals
* Automatic bracket reset when required
* Undo the most recent race result

### 📱 Race Day Interface

Designed to be easy to operate while standing next to the race gutters.

* Large touch-friendly winner buttons
* Current race displayed prominently
* **On Deck** racers shown in advance
* Race number and bracket status
* Live racer standings
* Eliminated racer tracking
* Keyboard shortcuts when used on a computer

### 🌳 Graphical Bracket

A live graphical bracket updates throughout the tournament.

Controls include:

* Zoom In
* Zoom Out
* Fit to Screen
* Reset to 100%
* Jump to Current Race
* Horizontal touch scrolling for phones and tablets

### 🏆 Results

At the end of the tournament, the app provides:

* Champion
* Runner-Up
* Third Place
* Final standings
* Complete race history
* Printable results
* Save as PDF through the browser
* Downloadable HTML results report

---

## 💾 Save & Resume

The app automatically saves tournament progress after each race.

If the app or browser is closed, the tournament can be resumed when it is reopened.

You can also:

* Save a tournament to an `.rrt` file
* Load a previously saved `.rrt` tournament
* Create manual backups
* Resume an automatically saved tournament
* Safely start a new tournament with backup options

---

## 📴 Works Offline

Raingutter Regatta is built as a **Progressive Web App**.

After loading or installing it once, the app can operate without an internet connection.

This makes it useful in gyms, churches, schools, camps, meeting rooms, or other locations where Wi-Fi or cellular service may be unreliable.

- ✅ Tested offline on Android
- ✅ Tested offline on iPhone
- ✅ Tournament autosave and resume tested offline

---

## 📲 Install It Like an App

### Android

1. Open the live app in Chrome:
   **https://icebreaker1979.github.io/raingutter-regatta/**
2. Tap **Install** when prompted.
3. The Raingutter Regatta icon will be added to your device.
4. Launch it just like any other app.

### iPhone / iPad

1. Open the live app in **Safari**.
2. Tap the **Share** button.
3. Select **Add to Home Screen**.
4. Tap **Add**.
5. Launch Raingutter Regatta from the Home Screen.

### Desktop

The app also works in modern desktop browsers.

Browsers such as Chrome and Edge may offer an **Install** button, allowing the Regatta to run in its own application window.

---

## 🔒 Privacy

Raingutter Regatta does not require:

* User accounts
* Registration
* Cloud storage
* A backend database

Tournament information is stored locally on the device running the app.

Tournament data leaves the device only when the user intentionally exports or shares a saved tournament/results file.

---

## 🛠 Technology

The mobile version is intentionally simple and lightweight.

It uses:

* HTML
* CSS
* JavaScript
* Progressive Web App technologies
* Service Worker caching
* Browser local storage
* GitHub Pages hosting

There are no server-side components and no Python installation is required.

---

## 📂 Project Structure

```text
raingutter-regatta/
│
├── index.html
├── app.js
├── engine.js
├── styles.css
├── manifest.webmanifest
├── service-worker.js
│
└── icons/
    ├── app icons
    └── app-link QR code
```

---

## 🔄 Current Version

### Version 1.2.0

Version 1.2 adds several race-day improvements, including:

* Safer New Tournament workflow
* Improved graphical bracket controls
* Better mobile bracket navigation
* Enhanced final standings
* Improved printing and PDF results
* About/version screen
* App-sharing QR code
* Improved PWA update handling

The core double-elimination tournament engine remains compatible with tournaments created by earlier versions.

---

## 🎯 Why This Exists

Running a race should not require keeping track of handwritten brackets, manually counting losses, or trying to remember who races next.

The goal of this project is simple:

> **Enter the racers, run the races, and let the app handle the bracket.**

It is designed to stay out of the way so the people running the event can concentrate on the racers rather than the paperwork.

---

## 🧪 Testing

The tournament engine has been tested with thousands of simulated double-elimination tournaments using field sizes ranging from small groups to large events.

Mobile functionality has also been tested on:

* Android
* iPhone
* Desktop browsers
* Installed PWA mode
* Offline / Airplane Mode
* Autosave and tournament recovery

---

## 🤝 Contributions & Feedback

This project is still evolving.

Bug reports, suggestions, and ideas for improving race-day operation are welcome through the GitHub repository.

---

## ⚠️ Disclaimer

This is an independent community project.

It is not an official Scouting America application and is not affiliated with or endorsed by Scouting America.

---

## ⛵ Ready to Race?

### [Launch Raingutter Regatta](https://icebreaker1979.github.io/raingutter-regatta/)

**Add racers → Start Tournament → Race!**
