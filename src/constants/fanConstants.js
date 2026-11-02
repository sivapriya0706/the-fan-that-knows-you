/**
 * THE FAN THAT KNOWS YOU — Shared Core Constants
 * Ensures 100% RPM, wattage, and airflow consistency across all UI components.
 */

export const SPEED_RPM = [0, 115, 175, 235, 295, 375];
export const SPEED_WATTS = [0, 14, 26, 42, 60, 78];
export const SPEED_CFM = [0, 1850, 2900, 4100, 5200, 6450];
export const SPEED_NOISE_DB = [0, 18, 24, 31, 38, 47];

export const getSpeedRPM = (speed) => {
  const s = Math.max(0, Math.min(5, Math.round(Number(speed) || 0)));
  return SPEED_RPM[s];
};

export const getSpeedWatts = (speed) => {
  const s = Math.max(0, Math.min(5, Math.round(Number(speed) || 0)));
  return SPEED_WATTS[s];
};

export const getSpeedCFM = (speed) => {
  const s = Math.max(0, Math.min(5, Math.round(Number(speed) || 0)));
  return SPEED_CFM[s];
};

export const getSpeedNoiseDB = (speed) => {
  const s = Math.max(0, Math.min(5, Math.round(Number(speed) || 0)));
  return SPEED_NOISE_DB[s];
};
