import { asJSON, asJSONAllLocations } from "./datagen";

/**
 * Retrieves the latest simulated camera data.
 * @returns An array of Camera objects.
 */
export function getCameraData() {
  const time = new Date();
  // The datagen.js expects time in seconds, so divide by 1000
  const jsonData = asJSON(time.valueOf() / 1000);
  return JSON.parse(jsonData);
}

/**
 * Retrieves camera data for all locations (main 9 + additional monitoring points).
 * @returns An array of Camera objects for all locations.
 */
export function getAllCameraData() {
  const time = new Date();
  // The datagen.js expects time in seconds, so divide by 1000
  const jsonData = asJSONAllLocations(time.valueOf() / 1000);
  return JSON.parse(jsonData);
}
