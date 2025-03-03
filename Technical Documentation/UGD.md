# User Guide – Performance Charts Calculator

## 1. Introduction
Welcome to the **Performance Charts Calculator** for the **Tecnam P2008JC**. This guide explains how to enter aircraft data, compute **weight & balance** (W&B), and determine **takeoff/landing performance** under various conditions (Part 61 or Part 135). It also covers special scenario toggles that let you optimize for maximum fuel, minimum fuel, fixed baggage, or performance-limited situations.

### 1.1 Intended Audience
- **Pilots, Flight Instructors, Dispatchers** who need quick references for pre-flight planning.
- **Student Pilots** learning how to calculate W&B and runway performance.

### 1.2 Key Features
1. **W&B Module**: Calculate total weight, center of gravity (CG), and ensure you’re within safe limits.  
2. **Performance Module**: Determine final takeoff or landing distance, factoring in wind, surface, slope, and safety margins.  
3. **Scenario Toggles**: Quickly see how baggage, fuel, or runway constraints affect flight feasibility.

---

## 2. Weight & Balance Module

### 2.1 Overview
The W&B module computes **Takeoff Weight (TOW)** and **Landing Weight**, along with the **Center of Gravity**. You’ll enter occupant weights, baggage, and flight time, and the system auto-converts time to liters (at 18 L/hr) and liters to weight (using 0.72 kg/L).

### 2.2 Steps

1. **Open the W&B Page**  
   - Click **“Weight & Balance”** from the main menu or home screen.

2. **Enter AFM Values**  
   - **Empty Weight** (kg), **Empty Arm** (m), **Empty Moment** (kg·m) if known.  
   - These come from your aircraft’s official AFM (legal doc).

3. **Occupant & Baggage**  
   - **Pilot & Passenger**: total occupant mass (kg).  
   - **Baggage**: mass behind the seats (kg).  
   - Watch that baggage is behind the CG, which can shift the CG aft.

4. **Flight Time**  
   - Input flight duration in hours (e.g., 2.0).  
   - The system multiplies by **18 L/hr** → liters, then by **0.72** → fuel mass (kg).  
   - That mass auto-populates the **Fuel Mass** field.

5. **Reserves & Burn-off**  
   - If you have contingency, alternate, day/night reserves, or taxi fuel, the system adds them to actual flight fuel.  
   - “Burn-off” is the difference between total flight fuel and leftover upon landing.

6. **Calculate**  
   - Click **“Calculate”** to see:
     - **Takeoff Weight**  
     - **Takeoff CG** (must be 1.841–1.978 m)  
     - **Landing Weight** if burn-off is specified  
     - A green “Within Limits” or red “Out of Limits” message

---

## 3. Scenario Toggles (W&B)

In the W&B form, you can select a **Scenario** to automate certain calculations:

1. **Max Fuel / Min Baggage**  
   - The system loads as much fuel as TOW allows, sets baggage to minimal.  
   - If TOW or CG is exceeded, it warns you.

2. **Min Fuel / Max Baggage**  
   - The system uses minimal flight fuel (trip + mandatory reserves), letting you see how much baggage you can add until TOW is reached.

3. **Fixed Baggage**  
   - You specify a non-negotiable baggage weight. The system finds the maximum feasible fuel or warns if TOW is exceeded.

4. **Performance-Limited**  
   - In synergy with the Performance module, the system tries to keep TOW low enough for runway constraints.

You can always override the results if you prefer manual inputs.

---

## 4. Performance Module

### 4.1 Overview
This module calculates your final takeoff or landing distance, factoring in:

- **Pressure Altitude** from QNH + elevation  
- **Wind** speed/direction (Part 61 vs. Part 135 multipliers)  
- **Surface** (Grass or Paved)  
- **Slope** (plus direction: Up or Down)  
- **Safety factor** (1.10 for takeoff, 1.67 for landing)

### 4.2 Takeoff Steps

1. **Open “Takeoff Performance”**  
   - From the main menu, pick **Takeoff**.

2. **Input Fields**  
   - **Elevation** (ft), or QNH + Elevation for auto pressure altitude.  
   - **Temperature** (°C)  
   - **Wind**: speed/direction  
   - **Surface**: grass (no correction) or paved (−10%).  
   - **Slope**: numeric (e.g., 0.12) + direction (Upslope/Downslope).  
   - **Part**: 61 or 135.

3. **Calculate**  
   - The system does:  
     1) Pressure Alt.  
     2) Wind correction (−5 m/kt HW, +15 m/kt TW).  
     3) Surface correction (−10% if paved).  
     4) Slope correction (±7% per 1% slope).  
     5) Multiply by **1.10** safety factor.  
   - The final result is your **TODR** (Takeoff Distance Required).

4. **Check TODA**  
   - The system also checks runway length × factor (1.0 or 0.85) to see if it’s feasible.

### 4.3 Landing Steps

1. **Open “Landing Performance”**  
   - Choose **Landing** from the menu.

2. **Input Fields**  
   - Similar to takeoff: QNH, temperature, slope direction, wind, surface, part.

3. **Calculate**  
   - The system obtains base distances from AFM (Ground Roll A, 50 ft B).  
   - Applies wind correction (−4 m/kt HW, +13 m/kt TW), surface correction (−10% if paved), slope ±3% per 1% slope, then multiplies by **1.67** for safety.

4. **Check LDA**  
   - Compare final LDR with runway length × factor. If it’s too large, not feasible.

---

## 5. Interpreting Results

1. **W&B**  
   - If TOW > 650 kg or CG outside 1.841–1.978 m, you must reduce weight or shift load.

2. **Performance**  
   - If the final distance (TODR/LDR) exceeds the runway length (with appropriate factor), it’s unsafe.  
   - Try reducing TOW, picking another runway, or waiting for better weather.

3. **Scenario Warnings**  
   - If “Max Fuel” scenario is chosen but TOW is still too high, the system highlights in red.  
   - If “Fixed Baggage” is too heavy, you see an immediate out-of-limits message.

---

## 6. Error Messages & Troubleshooting

1. **“Invalid input”**  
   - Negative or non-numeric fields. Re-check your data.

2. **“CG out of limits”**  
   - The system calculates an aft or forward CG beyond 1.841–1.978 m.

3. **“Runway length insufficient”**  
   - Performance distance > runway length × factor. Reduce TOW or choose another runway.

4. **“Extrapolation out of range”**  
   - Pressure altitude or temperature beyond the AFM table. The system warns you.

---

## 7. Frequently Asked Questions

1. **Q**: How do I incorporate day vs. night reserves?  
   **A**: Add the relevant reserve in the W&B module. The final flight fuel includes it automatically.

2. **Q**: Can I override the auto fuel calculation?  
   **A**: Yes. If you prefer manual liters or kg, uncheck “Auto from flight time” and enter your own.

3. **Q**: What if slope is negative?  
   **A**: That’s “Downslope.” The system applies negative correction for takeoff or a different sign for landing.

4. **Q**: Why is landing safety factor so high (1.67)?  
   **A**: This is per your flight manual revision, ensuring a robust margin.

---

## 8. Tips and Best Practices

- Always cross-check occupant, baggage, and leftover fuel after the flight.  
- For part 135, remember your headwind credit is halved and tailwind penalty is 1.5×.  
- Use scenario toggles to see “What if” quickly, but confirm final TOW/CG in the W&B table.

---

## 9. Revision History

| Version | Date       | Author         | Description                                       |
|---------|-----------|----------------|---------------------------------------------------|
| 1.0     | 2025-xx-xx| Your Name Here | Final User Guide with slope direction & scenario toggles |

**End of User Guide**  
