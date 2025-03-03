# Technical Design Document (TDD) – Final

## 1. Introduction
This **Technical Design Document** describes the final architecture and logic of the **Performance Charts Calculator** for the **Tecnam P2008JC** aircraft. It consolidates all revisions related to **weight & balance** (W&B) and **performance calculations** (takeoff/landing), including scenario toggles, user-entered AFM data, and the updated slope and safety factor logic.

### 1.1 Scope
- **Included**  
  - W&B module: user inputs from AFM (empty weight, arm, moment), occupant/baggage, flight time → calculates TOW and CG.  
  - Performance module: user inputs runway/environment data → calculates final takeoff/landing distance with all corrections.  
  - Scenario toggles for max fuel/min baggage, min fuel/max baggage, fixed baggage, and performance-limited.  
- **Excluded**  
  - Detailed UI/UX wireframes (addressed in separate design docs).  
  - Large-scale load/performance testing.

---

## 2. Weight & Balance (W&B) Module

### 2.1 Inputs
1. **Empty Weight** (from AFM)  
2. **Empty Arm** (from AFM)  
3. **Empty Moment** (optional; if not entered, the system computes `Moment = Weight × Arm`)  
4. **Pilot & Passenger** total weight  
5. **Baggage** weight  
6. **Flight Time** in hours, converted to liters by `Flight Time × 18 L/hr`, then multiplied by **0.72** to get fuel mass  
7. **Reserves** (contingency, alternate, day/night, taxi) – combined into “Actual Flight Fuel” if needed  
8. **Burn-off** – difference between total flight fuel and leftover upon landing

### 2.2 Calculation Steps
1. **Fuel Weight** = `(Flight Time × 18) × 0.72`  
2. **Takeoff Weight (TOW)** = Empty Weight + Pilot/Passenger + Baggage + Fuel Mass  
3. **CG** = \(\frac{\sum(weight_i \times arm_i)}{\sum weight_i}\)  
   - Must be within **1.841 m** (forward) and **1.978 m** (aft)  
   - If user enters empty moment, the system uses that plus occupant/baggage/fuel moments to find total moment.  
4. **Landing Weight** = TOW \(-\) Burn-off (if user sets leftover or used fuel).  
   - Recheck CG for landing as well.

### 2.3 Scenario Toggles (W&B)
1. **Max Fuel / Min Baggage**  
   - The system loads as much fuel as TOW allows, sets baggage to minimal or user-specified low value.  
2. **Min Fuel / Max Baggage**  
   - The system calculates minimal flight fuel (trip + mandatory reserves), then sees how much baggage can be added before TOW is exceeded.  
3. **Fixed Baggage**  
   - The user enters a non-negotiable baggage weight. The system calculates feasible fuel or warns if TOW is exceeded.  
4. **Performance-Limited** (optional synergy with performance module)  
   - The system might reduce TOW until runway performance is feasible.

---

## 3. Performance Module

### 3.1 Inputs
1. **Elevation** or QNH + Elevation for pressure altitude  
2. **Temperature**  
3. **Wind** speed/direction (with Part 61 vs. 135 multipliers)  
4. **Slope** (numeric) and **Direction** (up or down)  
5. **Surface Type** (grass or paved)

### 3.2 Calculation Steps

#### 3.2.1 Pressure Altitude
\[
  \text{Pressure Altitude} = (1013 - \text{QNH}) \times 30 + \text{Elevation}
\]

#### 3.2.2 Wind Correction
- **Headwind**: 
  - \-5 m/kt (takeoff), \-4 m/kt (landing)  
- **Tailwind**: 
  - \+15 m/kt (takeoff), \+13 m/kt (landing)  
- **Part 61**: Full head/tail wind  
- **Part 135**: \-50% for headwind, \+150% for tailwind

#### 3.2.3 Base Distances
- From AFM tables for **Ground Roll (A)** and **Distance at 50 ft AGL (B)** using altitude/temperature.

#### 3.2.4 Wind Application
- Apply the wind correction to B → intermediate (C).  
- Some references also apply it to A if needed, but the doc’s example uses (B) as the main reference for wind correction.

#### 3.2.5 Surface Correction
- **Grass**: No correction.  
- **Paved**: \-10% of (A) is combined with (C) → (D).

#### 3.2.6 Slope Correction
- **Takeoff**: ±7% per 1% slope on (A).  
- **Landing**: ±3% per 1% slope on (A).  
- Add or subtract that from (D).  
- If the doc’s example then multiplies by 1.1 or 1.67, do that after slope is applied.

#### 3.2.7 Safety Factor
- **Takeoff**: multiply final distance by **1.10**  
- **Landing**: multiply final distance by **1.67**

#### 3.2.8 Final Check (TODA/LDA)
- Compare final corrected distance to runway length × factor (1.0 for Part 61, 0.85 for Part 135).  
- If final distance > runway length × factor, it’s not feasible.

---

## 4. Integration: W&B and Performance

1. **W&B** yields a TOW.  
2. **Performance** uses that TOW (implicitly, since heavier TOW can mean the user is approaching the AFM’s upper limit).  
3. If runway performance is insufficient, the pilot reduces TOW by removing baggage or fuel.  
4. If CG is out of range, the pilot redistributes weight or reduces load.

---

## 5. Implementation Details

### 5.1 Data Structures
- **AFM Data**:  
  - For W&B: user inputs empty weight, arm, moment.  
  - For Performance: we have tables keyed by altitude/temperature to get (A) and (B).
- **Scenario Toggles**:  
  - A single form or wizard approach. The system automatically adjusts fuel/baggage fields depending on the chosen scenario.

### 5.2 UI Components
- **Weight & Balance** Tab: occupant/baggage fields, flight time → auto fuel weight, TOW/CG readout.  
- **Performance** Tab: slope direction (Up/Down), slope %, surface, QNH, etc.  
- **Results**: final TOW, CG, takeoff distance, landing distance, feasibility messages.

---

## 6. Test Approach
- **Unit Tests**:  
  - `calculateCG()` for W&B.  
  - `applyWindCorrection()` for each scenario, etc.  
- **Integration Tests**:  
  - End-to-end: user enters time/baggage, system calculates TOW, then calculates performance with slope/surface/wind.  
- **Scenario Tests**:  
  1) Max Fuel / Min Baggage → verify TOW ≤ 650, CG in range.  
  2) Min Fuel / Max Baggage → check leftover capacity.  
  3) Fixed Baggage → feasible fuel.  
  4) Performance-limited → slope + short runway, ensure we reduce TOW or show “not feasible.”

---

## 7. Revision History

| Version | Date       | Author         | Description                                                        |
|---------|-----------|----------------|--------------------------------------------------------------------|
| 1.0     | 2025-xx-xx| Your Name Here | Final TDD merging all logic: W&B input from AFM, slope 7%/3%, safety factors 1.10 & 1.67 |

**End of Technical Design Document (TDD) – Final**  
