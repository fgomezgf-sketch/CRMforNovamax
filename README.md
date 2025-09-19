# CRM Lead Manager - Full Repo

This repo includes a backend (Node/Express/Postgres) and a frontend (React/Vite) with CSV upload and lead editing.

## Quickstart (with Docker)

1. Copy the repository files into a folder `crm-full-repo` locally.
2. Ensure Docker is installed and running.
3. From the repo root run:
   ```
   docker-compose up --build
   ```
4. Wait until Postgres is up. Then apply migrations (one-time):
   ```
   docker exec -it <db_container_id_or_name> psql -U crmuser -d crm -f /app/migrations/001_init.sql
   ```
   (Alternative: run psql from host using `psql postgres://crmuser:crmpass@localhost:5432/crm -f backend/migrations/001_init.sql`)

5. Frontend will be available at `http://localhost:5173` and backend API at `http://localhost:4000/api`.

## Notes
- The upload endpoint expects CSV header names such as `first_name,last_name,email,phone,company,notes,last_contacted,next_step,follow_up_date,manager,poc_demo`.
- By default uploads use `ON CONFLICT (email) DO UPDATE` so rows with the same email will be updated.
- Authentication routes are included; the contacts endpoints are currently public but you can enable `middleware/auth.js` in `contacts.js` to require tokens.

## Need help?
If you want I can:
- Add a `make migrate` or an automated migration step into the Docker startup.
- Add sample CSV file and seed data.
- Convert backend to TypeScript + Prisma.
- Add export CSV, bulk actions, or role-based access control.
