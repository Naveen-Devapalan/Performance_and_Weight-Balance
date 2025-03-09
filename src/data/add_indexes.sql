-- Indexes for takeoff_distance table
CREATE INDEX IF NOT EXISTS idx_takeoff_pressure_alt ON takeoff_distance(pressure_altitude);
CREATE INDEX IF NOT EXISTS idx_takeoff_condition ON takeoff_distance(condition);
CREATE INDEX IF NOT EXISTS idx_takeoff_composite ON takeoff_distance(pressure_altitude, condition);
CREATE INDEX IF NOT EXISTS idx_takeoff_temp ON takeoff_distance(lower_temp, upper_temp);
CREATE INDEX IF NOT EXISTS idx_takeoff_full ON takeoff_distance(pressure_altitude, condition, lower_temp, upper_temp);

-- Indexes for landing_distance table
CREATE INDEX IF NOT EXISTS idx_landing_pressure_alt ON landing_distance(pressure_altitude);
CREATE INDEX IF NOT EXISTS idx_landing_condition ON landing_distance(condition);
CREATE INDEX IF NOT EXISTS idx_landing_composite ON landing_distance(pressure_altitude, condition);
CREATE INDEX IF NOT EXISTS idx_landing_temp ON landing_distance(lower_temp, upper_temp);
CREATE INDEX IF NOT EXISTS idx_landing_full ON landing_distance(pressure_altitude, condition, lower_temp, upper_temp);