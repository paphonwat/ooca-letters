# ooca letters

npm create vite@latest ooca-letters -- --template react-ts
cd ooca-letters
npm i framer-motion lucide-react
npm i -D tailwindcss@3 postcss autoprefixer && npx tailwindcss init -p

Then copy these files over (tailwind.config.js, index.css -> src/index.css or adjust import in main.tsx, src/*).

## Run with MySQL

The web app uses a small Node API so database credentials stay on the server.

1. Run `server/schema.sql` against MySQL. It creates the `Mooca` database, the `letters` table, and starter letters.
2. Copy `.env.example` to `.env` and set `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, and `MYSQL_DATABASE` for your MySQL server.
3. Run `npm run dev`. This starts the Vite app and API together; Vite proxies `/api` requests to the API on port 3001.

The drawing is stored as a PNG data URL in the `letters.drawing` column. Keep `.env` local; it is excluded from version control.

Open `/admin` to manage letters. Set a strong `ADMIN_PASSWORD` on the API server before using it. Admin sessions use an HTTP-only cookie and expire after eight hours; login attempts are rate-limited. For unrelated frontend/API sites, set `COOKIE_SAME_SITE=none` and `COOKIE_SECURE=true` on the API host, and add the exact frontend origin to `CORS_ORIGIN`.

### Deploy frontend and API separately

- Set `VITE_API_URL` on the frontend build to the API origin, for example `https://api.example.com`.
- Set `CORS_ORIGIN` on the API host to the exact frontend origin, for example `https://letters.example.com`.
- Set the MySQL connection variables on the API host only. Do not expose database credentials as `VITE_` variables.
- Run `server/schema.sql` against the hosted MySQL database before starting the API. If the host has already selected a database for you, remove the `CREATE DATABASE` and `USE Mooca` statements and run the remaining schema there.
