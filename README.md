# Masar

Masar is a client-only React + TypeScript workflow and request management demo. It does not require a backend server.

> **Demo only:** Authentication and authorization run in the browser. User, request, workflow, and other app data are stored in this browser's `localStorage` and IndexedDB; data is not shared between users or devices. Demo accounts and passwords are included in the source. Do not use real credentials, personal information, or confidential business data, and do not treat this app as production-secure authentication.

## Storage

- Zustand + `localStorage` for sessions and small settings.
- IndexedDB for scalable request data and request-related records.
- Data is local to the browser profile and can be cleared by the user or browser; use backup export/import to move demo data.
- The application always opens on the Masar welcome page; an active session gets a "Continue to workspace" action.
- Export / import backup from the Profile page.
- Reset demo data from the Profile page.

## Built-in demo accounts

All accounts below are public demo identities with unique passwords. They are seeded into the client app for testing role-specific pages and workflows; they are not private or secure credentials.

| User | Email | Password |
|---|---|---|
| Adam Carter | adam.carter@masar.local | `Masar@0000` |
| Sarah Mitchell | sarah.mitchell@masar.local | `Masar@0001` |
| Daniel Brooks | daniel.brooks@masar.local | `Masar@0010` |
| Maya Wilson | maya.wilson@masar.local | `Masar@0011` |
| Olivia Bennett | olivia.bennett@masar.local | `Masar@0100` |
| James Anderson | james.anderson@masar.local | `Masar@0101` |
| Emma Collins | emma.collins@masar.local | `Masar@0110` |

Demo credentials are intentionally not shown as clickable accounts on the login screen. Use the credentials above when you need to test a role.

James Anderson is the default **CEO & Company Owner**. The CEO can transfer company ownership, assign roles, and move people between departments and managers from **Admin → Users**.

## Commands

```bash
npm ci
npm run dev
npm run lint
npm run test
npm run build
npm run test:quality
```

`npm run test:quality` runs the unit and form-validation tests, lint and TypeScript checks, then verifies the production build. It also checks the responsive layout contract, required project structure, and gzip size budgets for initial and lazy-loaded assets. The responsive checks validate emitted CSS breakpoints and required layout classes; they do not replace visual testing in real browsers and screen sizes.

## Languages

The interface currently defaults to English and provides an Arabic/English switcher. The selected language is saved in this browser, and the document language and text direction change together. Arabic localization covers the welcome and account-access screens, shared navigation, dashboard, request lists and creation flow, inbox/outbox, notifications, profile, request workflow details, and administration screens. User-entered content and unrecognized demo content are preserved as entered and may appear in their original language.

## GitHub upload checklist

- Do not add real `.env` files, user exports, local databases, or production credentials. These are excluded by `.gitignore`.
- Treat the demo account list above as public; changing these passwords does not make browser-only authentication suitable for real users.
- Run `npm ci` and `npm run test:quality` before publishing changes.
- This repository contains frontend source and demo data only. A deployment that needs client-side routes to work on refresh must configure its static host to fall back to `index.html`.

## New account approval flow

New registrations follow a controlled three-stage path: **HR review → Department Head approval → CEO final position assignment**. A new account remains inactive until the CEO completes the final assignment. Rejections require a reason and are recorded in the audit trail.
