import ObjectsToCSV from "objects-to-csv";

interface Camera {
  Position: [number, number];
  SegmentID: number;
  Water: number;
  Light: number;
  Status: string;
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

function ComputeWater(pos: [number, number], t: number): number {
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

const Manholes: Array<[number, number]> = [
  [0, 0],
  [0, 1],
  [1, 1],
  [1, 2],
  [3, 2],
];

function ComputeLight(pos: [number, number]) {
  let Light = 0;
  for (let p of Manholes) {
    Light += Math.exp(-((pos[0] - p[0]) ** 2 + (pos[1] - p[1]) ** 2) * 3.0);
  }

  return Light;
}

/**
 * Generates simulated and modeled camera data and returns the output
 *
 * @param time
 * @returns Simulated sewer camera data that moves over time
 */
function generateData(time: number): Array<Camera> {
  const CameraList: Array<Camera> = new Array();

  let Pos0: AnimatedPos = new AnimatedPos([
    [0.0, 0.0],
    [0.0, 1.0],
    [1.0, 1.0],
    [1.0, 0.0],
  ]);
  let Pos1: AnimatedPos = new AnimatedPos([
    [1.0, 1.0],
    [1.0, 2.0],
    [2.0, 2.0],
    [1.25, 1.5],
    [1.25, 1.0],
  ]);
  let Pos2: AnimatedPos = new AnimatedPos([
    [3.0, 2.0],
    [3.0, 1.0],
    [1.25, 1.0],
    [1.25, 1.5],
    [2.0, 2.0],
  ]);

  Pos0.time = time;
  Pos1.time = time;
  Pos2.time = time;

  CameraList.push({
    Position: Pos0.position,
    SegmentID: 0,
    Water: ComputeWater(Pos0.position, time) / 2,
    Light: ComputeLight(Pos0.position),
    Status: "OK",
  });
  CameraList.push({
    Position: Pos1.position,
    SegmentID: 1,
    Water: ComputeWater(Pos1.position, time) / 2,
    Light: ComputeLight(Pos1.position),
    Status: "LOWLIGHT",
  });
  CameraList.push({
    Position: Pos2.position,
    SegmentID: 2,
    Water: ComputeWater(Pos2.position, time) / 2,
    Light: ComputeLight(Pos2.position),
    Status: "OK",
  });

  return CameraList;
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
