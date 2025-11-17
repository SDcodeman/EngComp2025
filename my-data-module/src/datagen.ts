import ObjectsToCSV = require("objects-to-csv");

interface Camera {
  Position: [number, number];
  SegmentID: number;
  Water: number;
  Light: number;
  Status: string;
  isNode: boolean;
  ViewDescription?: string;
}

class AnimatedPos {
  private m_positionData: Array<[number, number]>;
  private m_lengths: Array<number>;
  private m_time: number;

  constructor(path: Array<[number, number]>) {
    this.m_positionData = path;
    this.m_lengths = new Array();

    const PATH_COUNT = this.m_positionData.length;
    for (let i: number = 0; i < PATH_COUNT; i++) {
      this.m_lengths.push(
        Math.sqrt(
          (this.m_positionData[(i + 1) % PATH_COUNT][0] -
            this.m_positionData[i][0]) **
            2 +
            (this.m_positionData[(i + 1) % PATH_COUNT][1] -
              this.m_positionData[i][1]) **
              2,
        ),
      );
    }

    this.m_time = 0;
  }

  set time(t: number) {
    this.m_time =
      (t / 60) % this.m_lengths.reduce((acc, curr) => acc + curr, 0);
  }

  get position(): [number, number] {
    const PATH_COUNT = this.m_positionData.length;

    // Compute Index
    let index: number = 0;
    let time: number = this.m_time;
    while (time >= this.m_lengths[index]) {
      time -= this.m_lengths[index];
      index++;
    }

    const slopeX: number =
      (this.m_positionData[(index + 1) % PATH_COUNT][0] -
        this.m_positionData[index][0]) /
      this.m_lengths[index];
    const slopeY: number =
      (this.m_positionData[(index + 1) % PATH_COUNT][1] -
        this.m_positionData[index][1]) /
      this.m_lengths[index];

    return [
      this.m_positionData[index][0] + time * slopeX,
      this.m_positionData[index][1] + time * slopeY,
    ];
  }
}

export function ComputeWater(pos: [number, number], t: number): number {
  // Yes... This is unfortunately a hardcoded mess...
  // You might want to refer to Map.png to see how all this is connected
  // Water flows to the bottom right of the map starting from (0, 0)

  if (pos[0] == 0 && pos[1] == 0) return t % 100 < 60 ? 1 : 0;
  if (pos[0] == 1 && pos[1] == 0) return ComputeWater([0, 0], t - 60) / 2;
  if (pos[0] == 0 && pos[1] == 1)
    return (t % 100 > 60 ? 1 : 0) + ComputeWater([0, 0], t - 60);
  if (pos[0] == 1 && pos[1] == 1)
    return ComputeWater([1, 0], t - 60) + ComputeWater([0, 1], t - 60) / 2;
  if (pos[0] == 5 / 4 && pos[1] == 1) return ComputeWater([1, 1], t - 15) / 2;
  if (pos[0] == 3 && pos[1] == 1) return ComputeWater([5 / 4, 1], t - 45);
  if (pos[0] == 5 / 4 && pos[1] == 3 / 2)
    return ComputeWater([5 / 4, 1], t - 30);
  if (pos[0] == 1 && pos[1] == 2) return ComputeWater([1, 1], t - 60);
  if (pos[0] == 2 && pos[1] == 2)
    return (
      (ComputeWater([1, 2], t - 60) +
        ComputeWater([5 / 4, 3 / 2], t - 15 * Math.sqrt(61))) /
      2
    );
  if (pos[0] == 3 && pos[1] == 2)
    return ComputeWater([3, 1], t - 60) + ComputeWater([2, 2], t - 60);

  // Fallback: Interpolate between values
  let distance = Math.sqrt(
    (pos[0] - Math.floor(pos[0])) ** 2 + (pos[1] - Math.floor(pos[1])),
  );
  return ComputeWater([Math.floor(pos[0]), Math.floor(pos[1])], t - distance);
}

const NODES: Array<[number, number]> = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
  [5 / 4, 1],
  [3, 1],
  [5 / 4, 3 / 2],
  [1, 2],
  [2, 2],
  [3, 2],
];

const PIPES: Array<[[number, number], [number, number]]> = [
  [NODES[0], NODES[1]],
  [NODES[0], NODES[2]],
  [NODES[1], NODES[3]],
  [NODES[2], NODES[3]],
  [NODES[3], NODES[4]],
  [NODES[4], NODES[5]],
  [NODES[4], NODES[6]],
  [NODES[3], NODES[7]],
  [NODES[7], NODES[8]],
  [NODES[6], NODES[8]],
  [NODES[5], NODES[9]],
  [NODES[8], NODES[9]],
];

const Manholes: Array<[number, number]> = [
  [0, 0],
  [0, 1],
  [1, 1],
  [1, 2],
  [3, 2],
];

export function ComputeLight(pos: [number, number]) {
  let Light = 0;
  for (let p of Manholes) {
    Light += Math.exp(-((pos[0] - p[0]) ** 2 + (pos[1] - p[1]) ** 2) * 3.0);
  }
  // Scale to 0-255 range, assuming a max natural light value of around 2.5-3.0
  // Clamp between 0 and 255 and round to nearest integer
  const scaledLight = Math.round(Math.max(0, Math.min(255, (Light / 2.5) * 255)));
  return scaledLight;
}

/**
 * Generates simulated and modeled camera data and returns the output
 *
 * @param time
 * @returns Simulated sewer camera data that moves over time
 */
/**
 * Generates simulated and modeled camera data and returns the output
 *
 * @param time
 * @returns Simulated sewer camera data that moves over time
 */
function generateData(time: number): Array<Camera> {
  const CameraList: Array<Camera> = new Array();

  // Generate data for nodes
  for (let i = 0; i < NODES.length; i++) {
    const position = NODES[i];

    let status: string;
    if (i % 3 === 0) {
      status = "OK";
    } else if (i % 3 === 1) {
      status = "LOWLIGHT";
    } else {
      status = "CRITICAL";
    }

    CameraList.push({
      Position: position,
      SegmentID: i, // Unique SegmentID for nodes
      Water: ComputeWater(position, time + i * 5) / 2,
      Light: ComputeLight(position),
      Status: status,
      isNode: true,
    });
  }

  // Generate data for points on pipes
  let segmentIdCounter = NODES.length;
  for (let i = 0; i < PIPES.length; i++) {
    const pipe = PIPES[i];
    const pointsOnPipe = generatePointsOnPipe(pipe, 3);
    for (let j = 0; j < pointsOnPipe.length; j++) {
      const position = pointsOnPipe[j];

      let status: string;
      if (segmentIdCounter % 3 === 0) {
        status = "OK";
      } else if (segmentIdCounter % 3 === 1) {
        status = "LOWLIGHT";
      } else {
        status = "CRITICAL";
      }

      CameraList.push({
        Position: position,
        SegmentID: segmentIdCounter++, // Unique SegmentID for points on pipes
        Water: ComputeWater(position, time + segmentIdCounter * 5) / 2,
        Light: ComputeLight(position),
        Status: status,
        isNode: false,
      });
    }
  }

  return CameraList;
}

function generatePointsOnPipe(pipe: [[number, number], [number, number]], numPoints: number): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  const [start, end] = pipe;
  for (let i = 1; i <= numPoints; i++) {
    const t = i / (numPoints + 1);
    const x = start[0] + t * (end[0] - start[0]);
    const y = start[1] + t * (end[1] - start[1]);
    points.push([x, y]);
  }
  return points;
}

export function findClosestPoint(point: [number, number]): [number, number] {
  let closestPoint: [number, number] = [-1, -1];
  let minDistance = Infinity;

  for (const pipe of PIPES) {
    const [start, end] = pipe;
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];

    if (dx === 0 && dy === 0) {
      // The pipe is a point (start and end are the same)
      const d = Math.sqrt((point[0] - start[0]) ** 2 + (point[1] - start[1]) ** 2);
      if (d < minDistance) {
        minDistance = d;
        closestPoint = start;
      }
      continue;
    }

    // Calculate the projection of the point onto the line defined by the pipe
    // t is the parameter along the line segment [0, 1]
    const t =
      ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) /
      (dx * dx + dy * dy);

    let currentClosest: [number, number];
    if (t < 0) {
      // Closest point is the start of the segment
      currentClosest = start;
    } else if (t > 1) {
      // Closest point is the end of the segment
      currentClosest = end;
    } else {
      // Closest point is on the segment
      currentClosest = [start[0] + t * dx, start[1] + t * dy];
    }

    const distance = Math.sqrt(
      (point[0] - currentClosest[0]) ** 2 + (point[1] - currentClosest[1]) ** 2
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = currentClosest;
    }
  }

  return closestPoint;
}

export function asJSON(time: number): string {
  let Data = generateData(time);

  return JSON.stringify(Data);
}

export async function asCSV(time: number): Promise<string> {
  let csv = new ObjectsToCSV(generateData(time));
  let Data: string = await csv.toString();

  return Data;
}
