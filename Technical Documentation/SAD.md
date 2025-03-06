# Software Architecture Document (SAD)

## 1. Overview and Background
The **Performance Charts Calculator** is a lightweight web application that:
- Retrieves pre-stored performance table data (e.g., ground roll, distance at 50 ft AGL) from a small database.  
- Computes aircraft weight & balance metrics based on user inputs.  
- Returns the resulting values and guidance to the user via a web interface.

### 1.1 Purpose of the Document
This Software Architecture Document (SAD) explains how the system is structured at a high level. It describes the components (frontend, backend, database), the relationships among them, and relevant architectural decisions (e.g., frameworks, data flow patterns).

### 1.2 Goals and Constraints
- **Goals**  
  - Ensure quick lookups from the database for performance data.  
  - Keep the application lightweight and easy to maintain.  
  - Provide near-instant calculations for takeoff/landing distances and weight & balance.

- **Constraints**  
  - No user authentication or account system.  
  - Minimal data storage requirements (just the performance tables).  
  - Must support basic concurrency for typical usage (multiple users accessing simultaneously).

---

## 2. Product Description

### 2.1 Main Functions
1. **Data Lookup**  
   Retrieve the correct row(s) from the performance table given user-provided altitude and temperature.

2. **Computation**  
   Use user inputs (weight, fuel, etc.) to compute weight & balance and combine with table lookups for takeoff/landing performance.

3. **Result Display**  
   Provide results in a simple, user-friendly format, either numeric or basic chart/summary form.

### 2.2 Primary System Users
- **Pilots / Flight Instructors / Dispatchers**  
  Access quick performance data for flight planning.

- **Aviation Students**  
  Use the app as a training aid.

- **Aviation Enthusiasts**  
  Explore performance characteristics out of curiosity.

---

## 3. High-Level Architecture Description


1. **Web Browser (Frontend)**  
   - Displays forms for altitude, temperature, weight & balance inputs.  
   - Sends these parameters to the backend via HTTP requests.  
   - Renders results (performance table values, computed W&B data).

2. **Backend (API Layer)**  
   - Exposes RESTful endpoints for data lookup and computations.  
   - Interacts with the lightweight database (SQLite/PostgreSQL) to retrieve or update performance data.  
   - Performs interpolation logic if exact matches for altitude/temperature are not found.  
   - Processes user-submitted W&B data to confirm it’s within safe flight envelope.

3. **Lightweight Database**  
   - Stores performance table data from the attached references (pressure altitude, temperature, ground roll, distance at 50 ft AGL, etc.).  
   - Contains one or more tables keyed by altitude and temperature.  
   - Must be easily maintainable if new or updated performance data is provided in the future.

---

## 4. Detailed System Design

### 4.1 Data Flow
1. **User Input**  
   - The user enters altitude, temperature, aircraft weight, etc. in the frontend form.

2. **Request to Backend**  
   - A JSON payload with user inputs is sent to an endpoint, e.g. `POST /api/performance`.

3. **Lookup & Calculation**  
   - The backend queries the database for the row(s) matching the user’s altitude and temperature.  
   - If needed, the backend interpolates between data points if an exact match isn’t found.  
   - The backend calculates weight & balance by combining user inputs with standard formulas (e.g., `CG = ∑(weight × arm)/∑(weight)`).

4. **Response & Rendering**  
   - The backend returns a JSON response containing ground roll distance, distance at 50 ft AGL, or a “within-limits” flag for weight & balance.  
   - The frontend displays these results, possibly with a simple chart or table.

### 4.2 Main Modules
- **Frontend UI Module**  
  - Built with React, Vue, or plain JavaScript.  
  - Gathers user inputs, calls the backend, and shows results.

- **Backend Service**  
  - A small Node.js/Express or Python/Flask service that orchestrates lookups and calculations.  
  - Contains logic to parse, validate, and process user data.  
  - Exposes RESTful endpoints for performance queries.

- **Database Layer**  
  - A minimal schema: e.g., a single table with columns for altitude, temperature, ground roll, distance at 50 ft AGL, plus any relevant indexes.  
  - Possibly separate tables for takeoff vs. landing if the data sets differ significantly.

### 4.3 Handling Edge Cases
- **Out-of-Range Inputs**  
  If altitude or temperature exceed the table range, the system can display a warning or extrapolate.

- **Interpolation**  
  For altitude/temperature combos that aren’t in the table, a linear interpolation approach can be used.

- **Zero or Negative Values**  
  Validate user input so nonsensical or negative values (except negative temperature) are flagged.

---

## 5. Technical Strategies and Solutions

### 5.1 Scalability
- **Horizontal Scaling**  
  The Node.js service can run behind a load balancer (e.g., AWS ELB), allowing multiple instances.

- **Database Growth**  
  The dataset is small, so a single database instance is sufficient for typical usage.

### 5.2 Reliability
- **Backups**  
  Periodic backups of the DB to ensure performance table data is not lost.

- **Monitoring**  
  Basic monitoring of request counts, error rates, and response times with a service like Amazon CloudWatch or a third-party tool.

### 5.3 Security
- **HTTPS Everywhere**  
  All traffic is encrypted to protect data in transit.

- **Minimal Attack Surface**  
  With no authentication system or user data storage, the main concerns are sanitized inputs and DB read safety.

### 5.4 Performance
- **Caching**  
  The table data is mostly static, so caching at the application layer or in memory (e.g., Redis) can speed lookups.

- **Fast DB Queries**  
  Proper indexing on altitude and temperature columns ensures quick searches.

---

## 6. Infrastructure and Deployment

### 6.1 Hosting
- **Cloud Environment**  
  Host on AWS (EC2 or Elastic Beanstalk), Azure, or Heroku for simplicity.

- **Server Setup**  
  A single small-to-medium instance can handle typical load. Additional instances can be added if needed.

### 6.2 CI/CD
- **Source Control**  
  Use GitHub or GitLab for version control.

- **Automated Builds/Tests**  
  On each push or pull request, run unit tests to confirm no breakage in logic or data retrieval.

- **Deployment**  
  Automated pipeline to deploy new versions to staging/production.

### 6.3 Environment Configuration
- **Configuration Variables**  
  Database connection string, environment name (dev, prod), etc.

- **Secrets Management**  
  Use environment variables or a secrets manager for sensitive data.

---

## 7. Glossary (Optional)
- **Ground Roll**  
  The distance the aircraft travels on the runway during takeoff or landing before leaving the ground.

- **At 50 ft AGL**  
  The distance required to reach 50 feet above ground level during takeoff or the distance from 50 ft to a full stop on landing.

- **CG (Center of Gravity)**  
  The point where all weight is considered to be concentrated, crucial for flight stability.

---

## 8. Revision History
| Version | Date       | Author         | Description         |
|---------|-----------|----------------|---------------------|
| 1.0     | 2025-xx-xx| Your Name Here | Initial draft       |

**End of Software Architecture Document**


