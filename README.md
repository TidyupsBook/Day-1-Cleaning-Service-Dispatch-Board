# Day-1-Dispatch-Board-Tidyups

**TidyUps Cleaning Service Inc. — Live Production Dispatch Console**  
Target Domain: [https://tidyupsbooking.com](https://tidyupsbooking.com)  
Primary Service Territory: Edmonton, Alberta (YEG) and Surrounding Regional Corridors

---

## 🚀 Live Product Overview
`Day-1-Dispatch-Board-Tidyups` is the live operations console and direct booking system for TidyUps Cleaning Service Inc. Designed from real operational requirements, it powers:
- **15 Dedicated Cleaners & Solo/Team Units**: Tracking real home hubs in Edmonton (Chappelle, Charlesworth, Keheewin, Oliver, Clareview, Ambleside, Mill Woods, Queen Mary, Secord, Callingwood, Dechene, Westwood, Lorelei, The Hamptons, Jasper Park).
- **Core Cleaning Services**: Standard Cleaning, Deep Cleaning, and Move-Out Cleaning.
- **Two-Way Jobber Sync Hub**: GraphQL connection for visits, clients, quotes, invoices, and job creation.
- **AI Voice-to-Text & Lead Intake**: Direct microphone voice dictation and copy-paste intake for Facebook Ads & SMS leads.
- **Google Maps Platform Integration**: Edmonton territory visualization, address reverse-geocoding, and multi-stop drive calculation.

---

## 🛠️ Tech Stack & Architecture
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, `@vis.gl/react-google-maps`.
- **Backend**: Express on Node.js / `tsx` with server-side proxy routes for Jobber and Google APIs.
- **Database**: Persistent JSON store (`data/dispatch_store.json`).
- **AI & Grounding**: Google GenAI SDK (`@google/genai`).

---

## 📦 How to Push to GitHub

1. Create a new repository on your GitHub account named:
   **`Day-1-Dispatch-Board-Tidyups`**

2. Run the following command in your terminal:
   ```bash
   git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/Day-1-Dispatch-Board-Tidyups.git
   git push -u origin main --tags
   ```

---

## 📄 License & Confidentiality
Property of TidyUps Cleaning Service Inc. (cleaningserviceyeg@gmail.com). All rights reserved.
