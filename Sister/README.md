# Birthday Celebration — Online Users Database

This project is a static set of HTML pages. If you want to keep track of users and play sessions online, you can enable a lightweight Cloud Firestore backend via CDN — no bundler or server needed.

What you get once enabled:

- Store/update users when they enter their name on the welcome page or in the game
- Record a session when a player finishes the memory game (moves, time)

## Setup (Firebase / Firestore)

1. Create a Firebase Project

- Go to [Firebase Console](https://console.firebase.google.com) and create a new project
- In Project Settings → General → Your Apps → add a Web App
- Copy the SDK config (apiKey, authDomain, projectId, etc.)

1. Create config file

- In this folder, copy `db-config.sample.js` to `db-config.js`
- Paste your Firebase Web App config into `db-config.js`

1. Enable Firestore

- In the Firebase Console, go to Build → Firestore Database → Create database
- Start in test mode for quick prototyping (adjust rules before going public)

1. Recommended Firestore rules (basic)

For quick local demos, you can start with test mode. For a simple locked-down setup that still allows writes from the public site, consider rules like:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true; // or restrict as needed
      allow write: if true; // public write; tighten rules for production
    }
    match /sessions/{sessionId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

Please harden these for production (e.g., require authentication or write validation).

## How it works

- `db.js` loads Firebase via CDN if `db-config.js` is present, then exposes `DB.addOrUpdateUser(name, extra)` and `DB.addSession(name, stats)`.
- `index.html` calls `DB.addOrUpdateUser` when continuing with a name.
- `index6.html` calls `DB.addOrUpdateUser` when the game learns the player name, and `DB.addSession` when the player wins.

If `db-config.js` is missing, all DB calls are safe no-ops with a console warning.

## Local test

Just open `index.html` or `index6.html` in your browser. If you created `db-config.js` with a valid config, network requests will be sent to Firestore.

## Files

- `db-config.sample.js` — template; copy to `db-config.js` and fill with your config
- `db.js` — tiny Firestore helper using Firebase CDN
- `index.html` — welcome page with name entry; records/updates user on continue
- `index6.html` — memory game; records sessions on win
