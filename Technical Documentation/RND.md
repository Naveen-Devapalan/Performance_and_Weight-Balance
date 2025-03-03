# Release Notes (Draft)

## 1. Introduction
These **Release Notes** summarize the **new features**, **enhancements**, **bug fixes**, and **known issues** in each version of the **Performance Charts Calculator** for the Tecnam P2008JC. They help end-users, testers, and stakeholders quickly see what has changed and what to expect.

### 1.1 Scope
- **Included**  
  - Highlights of changes since the last release  
  - Version numbering scheme  
  - Known issues or constraints  
- **Excluded**  
  - Detailed user instructions (see User Guide)  
  - In-depth developer instructions (see TDD, Admin Guide)

---

## 2. Versioning Scheme
We use **Semantic Versioning** (MAJOR.MINOR.PATCH) or a simple incremental approach (e.g., v1.0, v1.1). Adjust as needed.

- **MAJOR**: Incompatible or big changes  
- **MINOR**: Backward-compatible new features  
- **PATCH**: Bug fixes or small improvements  

*(If you prefer a date-based version or a revision-based approach, note it here.)*

---

## 3. Current Release: v1.0

### 3.1 New Features
1. **Scenario Toggles (W&B)**  
   - “Max Fuel / Min Baggage,” “Min Fuel / Max Baggage,” “Fixed Baggage,” “Performance-Limited” now available in W&B module.
2. **Slope Direction**  
   - For performance calculations, user can pick “Upslope” or “Downslope,” applying ±7% for takeoff and ±3% for landing.
3. **Safety Factor**  
   - Takeoff distance multiplied by 1.10, landing by 1.67 per updated AFM references.

### 3.2 Enhancements
1. **UI:**  
   - Reorganized W&B form to allow manual entry of “Empty Weight,” “Empty Arm,” “Empty Moment” from the AFM.
2. **API Endpoints:**  
   - `/performance/takeoff` and `/performance/landing` accept `slope_direction` and `surface_type`.
3. **Logging & Admin**  
   - System Admin Guide expanded with new environment variables (`SLOPE_LOGIC_TAKEOFF`, `SLOPE_LOGIC_LANDING`).

### 3.3 Bug Fixes
1. **Negative Baggage Crash**  
   - The system now returns `400 Bad Request` if baggage is negative.
2. **Tailwind Not Applied**  
   - Tailwind corrections now properly add +15m (takeoff) or +13m (landing).

### 3.4 Known Issues
1. **Extrapolation Warnings**  
   - If the user’s altitude/temperature is beyond table range, the system warns but does not block.  
2. **No Authentication**  
   - The app is open by default. If security is required, see future roadmap.

---

## 4. Upcoming / Roadmap
- **Multi-Aircraft Support**: Next release may allow multiple aircraft profiles.  
- **Performance-limited scenario** to auto-calculate max TOW from runway length.

---

## 5. Installation & Update Steps
1. **Pull the latest code** from `main` or `release/v1.0`.  
2. **Install dependencies** (`npm install` or `pip install`).  
3. **Migrate DB** if changes exist.  
4. **Restart** the service.  
5. **Check logs** to confirm successful launch.

---

## 6. Revision History

| Version | Date       | Author         | Description                                             |
|---------|-----------|----------------|---------------------------------------------------------|
| 1.0     | 2025-xx-xx| Your Name Here | Initial stable release with scenario toggles, slope logic|

**End of Release Notes**  
