import { asJSON } from "./datagen";

export interface Camera {
  Position: [number, number];
  SegmentID: number;
  Water: number;
  Light: number;
  Status: string;
  ViewDescription?: string;
}

/**
 * Retrieves the latest simulated camera data.
 * @returns An array of Camera objects.
 */
export function getLatestCameraData(): Camera[] {
  const time = new Date();
  // The datagen.ts expects time in seconds, so divide by 1000
  const jsonData = asJSON(time.valueOf() / 1000);
  return JSON.parse(jsonData);
}
