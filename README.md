# Ooca Letters

A bilingual letters app with a React frontend, Node.js API, and MySQL-compatible database.

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

### Free deployment with Render and TiDB Cloud

The `render.yaml` Blueprint creates a free Render static site and a separate free Node.js API. Both services auto-deploy from the `main` branch when you push to GitHub. The API connects to TiDB Cloud Starter, which speaks the MySQL protocol.

1. Create a TiDB Cloud Starter instance and note its host, port, exact prefixed username, password, and database name from the TiDB connection dialog. Do not put these values in GitHub.
2. In Render, create a new Blueprint from `paphonwat/ooca-letters` and choose `render.yaml`. Enter the TiDB values and a strong `ADMIN_PASSWORD` when prompted.
3. Run `server/schema.sql` against the TiDB database. Do not run `server/demo-letters.sql` in production; it adds demo-only rows.
4. Confirm the service environment values `VITE_API_URL` and `CORS_ORIGIN` match the generated Render service URLs. If Render changes either hostname, update both values and redeploy.

Render's free API sleeps after 15 minutes without traffic and can take about a minute to wake. TiDB's free quota is capped and may throttle requests when exhausted. This setup is suitable for a hobby or portfolio deployment, not an uptime-critical production service.
