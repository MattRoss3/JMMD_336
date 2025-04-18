# JMMD_336 Language Challenge App

A Node.js/Express web application for generating and taking language‑learning challenges via the OpenAI API.

## Features

- User signup / login with sessions
- Generate structured language challenges (multiple choice, write‑in, prompt)
- Persist challenges, questions, answers in MySQL
- Assign challenges to users and track progress
- Translator tool (Spanish ↔ English)
- User profile update (info & password)
- DRY header/footer partials with EJS templates


## Environment Variables

Copy the example and fill in your credentials:

```bash
cp .env.example .env
```

Open `.env` and set:

```dotenv
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name

SESSION_SECRET=a_random_session_secret
OPENAI_API_KEY=sk-...
DICTIONARY_API_KEY=your_dictionary_api_key
```

> **Note:** `.env` is git‑ignored. Never commit secrets.

---

## Getting Started


1. **Install dependencies**  
   ```bash
   npm install
   ```

2. **Start the server**  
   ```bash
   npm start
   ```

   The app will be available at:  
   > http://localhost:3000




-- users, challenges, questions, answers, userChallenges, progress tables…
-- (see schema diagram in repo or documentation)

<img width="911" alt="Screenshot 2025-04-17 at 5 36 30 PM" src="https://github.com/user-attachments/assets/f5b41e6c-211f-48ac-9b4f-b73a16359b1e" />


---

## Troubleshooting

- **Invalid API key**: Ensure `OPENAI_API_KEY` in `.env` is correct and that you’re not overriding it in your shell.  
- **Database errors**: Verify your `DB_*` env vars and MySQL connectivity.  
- **Module import errors**: Confirm you’re on Node v18+ and `"type":"module"` is set in `package.json`.

