# System Administrator & Maintenance Guide

## 1. Introduction
This **System Administrator & Maintenance Guide** provides instructions on how to **install, configure, update, and troubleshoot** the **Performance Charts Calculator** for the Tecnam P2008JC aircraft. It is intended for system administrators, DevOps engineers, or any technical staff responsible for deploying and maintaining the application.

### 1.1 Scope
- **Included**  
  - Deployment steps (local, staging, production)  
  - Configuration of environment variables (e.g., DB connection, slope logic toggles)  
  - Data backup, logging, and security basics  
  - Basic troubleshooting and system updates
- **Excluded**  
  - Detailed usage instructions (see User Guide)  
  - Advanced load testing or performance scaling beyond typical flight-school usage

---

## 2. System Requirements

### 2.1 Server/Host Requirements
- **Operating System**: Linux (Ubuntu/CentOS) or Windows Server  
- **CPU & RAM**: 2+ CPU cores, 4GB+ RAM (minimum for typical usage)  
- **Storage**: 10GB+ free space for logs, DB, and backups  
- **Node.js** (if using Node/Express) or **Python** (if using Flask) – version depends on your TDD

### 2.2 Database
- **SQLite** for small-scale local deployments  
- **PostgreSQL** (recommended for production)  
- Ensure the DB is accessible via environment variables

### 2.3 Networking & Ports
- **HTTP/HTTPS**: Port 80/443 or custom  
- **Firewall**: Allow inbound traffic from trusted IP ranges if needed  
- **Domain/SSL**: For production, consider an SSL certificate for HTTPS

---

## 3. Installation & Deployment

### 3.1 Local Development Setup
1. **Clone Repository**  
   - `git clone [repo-url]`
2. **Install Dependencies**  
   - `npm install` (Node) or `pip install -r requirements.txt` (Python)
3. **Configure Environment**  
   - Copy `.env.example` to `.env`, fill in DB credentials, PART_TYPE defaults, etc.
4. **Initialize Database**  
   - If using SQLite, it may auto-create. If PostgreSQL, create a DB user and run migrations.
5. **Run**  
   - `npm run dev` or `python app.py`  
   - Access via `http://localhost:3000` or similar.

### 3.2 Staging / Production
1. **Set Up Server**  
   - Cloud instance (AWS, Azure, etc.) or on-prem machine
2. **Install Runtime**  
   - Node.js LTS or Python 3.x  
   - Reverse proxy (NGINX or Apache) for HTTPS
3. **Environment Variables**  
   - `DB_CONNECTION_STRING`  
   - `PORT` (if behind reverse proxy)  
   - `PART_TYPE_DEFAULT` (optional)  
   - `SLOPE_LOGIC_TAKEOFF=7` and `SLOPE_LOGIC_LANDING=3` if stored externally
4. **Deploy**  
   - Pull code from repo or CI/CD pipeline  
   - `npm install --production` or `pip install --no-dev`  
   - `npm run build` (if front-end is compiled)  
   - `pm2 start server.js` or systemd service for Python
5. **Check Logs**  
   - Ensure no DB connection errors, verify environment is correct

### 3.3 Continuous Integration / Deployment
- **GitHub Actions / GitLab CI**  
  - On each commit, run unit/integration tests  
  - If passing, auto-deploy to staging  
  - Manual approval for production

---

## 4. Configuration & Environment Variables

| Variable                | Description                                      | Example Value                        |
|-------------------------|--------------------------------------------------|--------------------------------------|
| `DB_CONNECTION_STRING`  | PostgreSQL/SQLite URI                            | `postgres://user:pass@host/dbname`   |
| `PORT`                  | HTTP port                                        | `3000`                               |
| `PART_TYPE_DEFAULT`     | Default part (61 or 135)                         | `61`                                 |
| `SLOPE_LOGIC_TAKEOFF`   | Slope correction factor for takeoff (7% default) | `7`                                  |
| `SLOPE_LOGIC_LANDING`   | Slope correction factor for landing (3% default) | `3`                                  |
| `SAFETY_FACTOR_TAKEOFF` | Safety margin for T/O distance (1.10)            | `1.10`                               |
| `SAFETY_FACTOR_LANDING` | Safety margin for L/D distance (1.67)            | `1.67`                               |

*(Adjust naming to match your code. These are just examples.)*

---

## 5. Data Backup & Maintenance

### 5.1 Database Backup
- **SQLite**: Periodically copy the `.db` file to secure storage.  
- **PostgreSQL**: Use `pg_dump` or scheduled backups to S3 or another location.

### 5.2 Logs & Rotation
- The app logs each request, calculation steps, and errors.  
- Configure log rotation (e.g., `logrotate` on Linux) to avoid disk overfill.

### 5.3 Updating AFM Tables
- If new performance data or W&B arms appear, update the DB table or `.csv` used for interpolation.  
- Restart the app or run migrations as needed.

---

## 6. Troubleshooting & Common Issues

1. **“DB Connection Error”**  
   - Check `DB_CONNECTION_STRING` env var. Ensure DB is running and reachable.
2. **“Slope or Surface not recognized”**  
   - Possibly an invalid input. Check logs for parsing errors. 
3. **“Out of Range: Pressure Altitude or Temperature”**  
   - The system might be extrapolating beyond known AFM data. Confirm user input is correct.
4. **“Performance Distances not updating after config change”**  
   - Possibly a cache issue or the app needs a restart. Clear the server cache or reload.

---

## 7. Security & Access

- **HTTPS**: Use a valid SSL cert. Terminate SSL at NGINX or use a managed service.  
- **No user authentication**: This app is publicly accessible. Restrict access by IP if needed.  
- **Parameterization**: For DB queries, ensure code is safe from injection.

---

## 8. System Updates

1. **Pull New Code**  
   - `git pull` or CI/CD triggers.  
2. **Run Tests**  
   - Confirm no breakage.  
3. **Deploy**  
   - Restart the service. Check logs to ensure correct startup.  
4. **Migrate DB** (if required)  
   - If new tables or columns exist, run migration scripts.

---

## 9. Revision History

| Version | Date       | Author         | Description                                                          |
|---------|-----------|----------------|----------------------------------------------------------------------|
| 1.0     | 2025-xx-xx| Your Name Here | Initial Admin & Maintenance Guide with config, backup, and deployment|

**End of System Administrator & Maintenance Guide**  
