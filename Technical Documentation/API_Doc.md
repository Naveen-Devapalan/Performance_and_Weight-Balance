``# API Documentation  ## 1. Introduction This **API Documentation** provides a single, consolidated reference for all endpoints exposed by the **Performance Charts Calculator** for the Tecnam P2008JC. It explains how to integrate with the calculator’s backend, including **request/response formats**, **error handling**, and **examples**.   ### 1.1 Intended Audience - **Developers** building integrations or automations. - **QA/Test Engineers** who need to automate test scenarios against the backend. - **Ops/DevOps** teams verifying API endpoints for deployments.  ### 1.2 Authentication & Base URL - **Authentication**: None by default; the service is publicly accessible. - **Base URL**:   - Development: `http://localhost:3000/api/`   - Production: `https://yourdomain.com/api/`    *(Adjust if you plan to add tokens, IP restrictions, or other security measures.)*  ---  ## 2. Endpoints Overview  | Endpoint                   | Method | Description                                                       | |---------------------------|-------|-------------------------------------------------------------------| | `/performance/takeoff`    | POST  | Calculates final takeoff distance (TODR) given runway data        | | `/performance/landing`    | POST  | Calculates final landing distance (LDR) given runway data         | | `/weight-and-balance`     | POST  | Computes TOW, CG, and landing weight based on user inputs         |  Each endpoint follows a similar structure: a **JSON** request with numeric fields, plus a **JSON** response indicating the computed values or error codes.  ---  ## 3. `/performance/takeoff` (POST)  ### 3.1 Purpose Calculates the final **Takeoff Distance Required (TODR)**, applying corrections for wind, surface, slope, and a 1.10 safety factor. Also checks runway feasibility based on Part 61 or Part 135 rules.  ### 3.2 Request  - **URL**: `POST /performance/takeoff` - **Headers**:    - `Content-Type: application/json` - **Body (JSON)** example:   ```json   {     "qnh": 1019,     "elevation": 97,     "temperature": 13,     "wind_speed": 12,     "wind_direction": 145,     "part_type": "61",     "slope_value": 0.12,     "slope_direction": "up",     "surface_type": "paved"   }``

|Field|Type|Description|
|---|---|---|
|`qnh`|Number|Current QNH (hPa)|
|`elevation`|Number|Airfield elevation (ft)|
|`temperature`|Number|Ambient temperature (°C)|
|`wind_speed`|Number|Wind speed (knots)|
|`wind_direction`|Number|Wind direction (degrees)|
|`part_type`|String|`"61"` or `"135"`|
|`slope_value`|Number|Runway slope in decimal (e.g., 0.12 for 12%)|
|`slope_direction`|String|`"up"` or `"down"`|
|`surface_type`|String|`"grass"` or `"paved"`|

### 3.3 Response

- **Status**: `200 OK` if valid, `400 Bad Request` if input errors, `500` if server error.
- **Body (JSON)** example:
    
    json
    
    CopyEdit
    
    `{   "pressure_altitude": -83,   "wind_correction": {     "head_wind": 10,     "tail_wind": 0,     "cross_wind": 6   },   "ground_roll_base": 203.84,   "distance_50_agl_base": 432.04,   "wind_corrected_distance": 408.04,   "surface_correction": -10,   "slope_correction": 7,   "safety_factor": 1.10,   "final_todr": 424.54,   "toda_feasibility": true }`
    

|Field|Type|Description|
|---|---|---|
|`pressure_altitude`|Number|Computed from QNH & elevation|
|`wind_correction`|Object|Breakdown of head/tail/cross wind components|
|`ground_roll_base`|Number|Base ground roll from AFM (A)|
|`distance_50_agl_base`|Number|Base distance at 50 ft from AFM (B)|
|`wind_corrected_distance`|Number|Intermediate after wind correction (C)|
|`surface_correction`|Number|-10% if paved, else 0 for grass|
|`slope_correction`|Number|±7% per 1% slope for takeoff|
|`safety_factor`|Number|1.10 for takeoff|
|`final_todr`|Number|Final takeoff distance required (meters)|
|`toda_feasibility`|Boolean|True if `final_todr` <= runway length × factor (1.0 or 0.85)|

---

## 4. `/performance/landing` (POST)

### 4.1 Purpose

Calculates **Landing Distance Required (LDR)** with wind, surface, slope, and a 1.67 safety factor. Checks LDA feasibility for Part 61/135.

### 4.2 Request

- **URL**: `POST /performance/landing`
- **Headers**:
    - `Content-Type: application/json`
- **Body (JSON)** example:
    
    json
    
    CopyEdit
    
    `{   "qnh": 1014,   "elevation": 4,   "temperature": 12,   "wind_speed": 5,   "wind_direction": 125,   "part_type": "135",   "slope_value": 0,   "slope_direction": "down",   "surface_type": "grass" }`
    

### 4.3 Response

- **Status**: `200 OK` if valid, `400 Bad Request` if input errors, `500` if server error.
- **Body (JSON)** example:
    
    json
    
    CopyEdit
    
    `{   "pressure_altitude": -26,   "wind_correction": {     "head_wind": 1,     "tail_wind": 0,     "cross_wind": 5   },   "ground_roll_base": 171.20,   "distance_50_agl_base": 380.20,   "wind_corrected_distance": 376.20,   "surface_correction": 0,   "slope_correction": 3,   "safety_factor": 1.67,   "final_ldr": 395.00,   "lda_feasibility": true }`
    

|Field|Type|Description|
|---|---|---|
|`pressure_altitude`|Number|Computed from QNH & elevation|
|`wind_correction`|Object|Breakdown of head/tail/cross wind components|
|`ground_roll_base`|Number|Base ground roll from AFM (A)|
|`distance_50_agl_base`|Number|Base distance at 50 ft from AFM (B)|
|`wind_corrected_distance`|Number|Intermediate after wind correction (C)|
|`surface_correction`|Number|-10% if paved, else 0 for grass|
|`slope_correction`|Number|±3% per 1% slope for landing|
|`safety_factor`|Number|1.67 for landing|
|`final_ldr`|Number|Final landing distance required (meters)|
|`lda_feasibility`|Boolean|True if `final_ldr` <= runway length × factor (1.0 or 0.85)|

---

## 5. `/weight-and-balance` (POST)

### 5.1 Purpose

Computes **Takeoff Weight (TOW)**, **Center of Gravity (CG)**, and **Landing Weight** based on user inputs (empty weight from AFM, occupant/baggage, flight time → auto fuel calculation).

### 5.2 Request

- **URL**: `POST /weight-and-balance`
- **Headers**:
    - `Content-Type: application/json`
- **Body (JSON)** example:
    
    json
    
    CopyEdit
    
    `{   "empty_weight": 432.21,   "empty_arm": 1.86,   "empty_moment": 803.93,   "pilot_passenger": 155,   "baggage": 3,   "flight_time": 2.0,   "reserves": {     "contingency": 0.42,     "alternate": 0,     "other": 0.2,     "reserve": 0.5,     "taxi": 3   },   "burn_off": 25.90 }`
    

|Field|Type|Description|
|---|---|---|
|`empty_weight`|Number|From AFM, in kg|
|`empty_arm`|Number|From AFM, in meters|
|`empty_moment`|Number|Optional, if not provided the system calculates it|
|`pilot_passenger`|Number|Total occupant weight in kg|
|`baggage`|Number|Weight behind seats in kg|
|`flight_time`|Number|Hours, converted to liters × 18, then × 0.72 for mass|
|`reserves`|Object|Additional fuels (contingency, alternate, day/night, etc.)|
|`burn_off`|Number|Fuel mass used from T/O to landing|

### 5.3 Response

- **Status**: `200 OK` if valid, `400 Bad Request` or `500 Internal Error` if issues.
- **Body (JSON)** example:
    
    json
    
    CopyEdit
    
    `{   "takeoff_weight": 650,   "takeoff_cg": 1.880,   "within_takeoff_limits": true,   "landing_weight": 624.1,   "landing_cg": 1.866,   "within_landing_limits": true }`
    

|Field|Type|Description|
|---|---|---|
|`takeoff_weight`|Number|Sum of empty weight, occupant, baggage, fuel|
|`takeoff_cg`|Number|(∑(weight × arm)) / ∑ weight for takeoff|
|`within_takeoff_limits`|Boolean|True if TOW ≤ 650 kg and CG in [1.841, 1.978]|
|`landing_weight`|Number|TOW − burn_off|
|`landing_cg`|Number|Recomputed if fuel is behind CG, etc.|
|`within_landing_limits`|Boolean|True if landing weight ≤ 650 and CG in [1.841, 1.978]|

---

## 6. Error Handling

|Status|Message|Description|
|---|---|---|
|400|“Invalid input”|Negative or non-numeric fields, slope direction, etc.|
|400|“Part type must be 61 or 135”|An invalid `part_type` was sent|
|500|“Internal Server Error”|Unexpected exception in code|

The response typically includes a `message` field describing the error.

---

## 7. Additional Notes

1. **Units**: Distances in meters, weights in kilograms, time in hours.
2. **Integration with UI**: The endpoints can be called from any frontend or external system.
3. **Scenario Toggles**: The UI scenario logic (max fuel, min fuel, etc.) is not a separate endpoint but rather an internal calculation. You can replicate it by adjusting the request payload to the W&B endpoint.
4. **Security**: No authentication is implemented by default. If needed, implement a token-based system or IP whitelisting.

---

## 8. Versioning & Future Endpoints

- Currently, all endpoints are under `/api/`.
- Future expansions (e.g., scenario-specific endpoints) should follow a similar pattern: `POST /api/scenario/fixedBaggage`.

---

## 9. Revision History

|Version|Date|Author|Description|
|---|---|---|---|
|1.0|2025-xx-xx|Your Name Here|Consolidated API Documentation for W&B & Performance|