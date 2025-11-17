class AnimatedPos {
  constructor(path) {
    this.m_positionData = path;
    this.m_lengths = [];

    const PATH_COUNT = this.m_positionData.length;
    for (let i = 0; i < PATH_COUNT; i++) {
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

  set time(t) {
    this.m_time =
      (t / 60) % this.m_lengths.reduce((acc, curr) => acc + curr, 0);
  }

  get position() {
    const PATH_COUNT = this.m_positionData.length;

    // Compute Index
    let index = 0;
    let time = this.m_time;
    while (time >= this.m_lengths[index]) {
      time -= this.m_lengths[index];
      index++;
    }

    const slopeX =
      (this.m_positionData[(index + 1) % PATH_COUNT][0] -
        this.m_positionData[index][0]) /
      this.m_lengths[index];
    const slopeY =
      (this.m_positionData[(index + 1) % PATH_COUNT][1] -
        this.m_positionData[index][1]) /
      this.m_lengths[index];

    return [
      this.m_positionData[index][0] + time * slopeX,
      this.m_positionData[index][1] + time * slopeY,
    ];
  }
}

function ComputeWater(pos, t) {
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

const Manholes = [
  [0, 0],
  [0, 1],
  [1, 1],
  [1, 2],
  [3, 2],
];

function ComputeLight(pos) {
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
function generateData(time) {
  const CameraList = [];

  const validCoordinates = [
    [0.0, 0.0],
    [1.0, 0.0],
    [0.0, 1.0],
    [1.0, 1.0],
    [1.25, 1.5],
    [1.0, 2.0],
    [2.0, 2.0],
    [3.0, 1.0],
    [3.0, 2.0],
  ];

  for (let i = 0; i < validCoordinates.length; i++) {
    const position = validCoordinates[i];

    let status;
    if (i % 3 === 0) {
      status = "OK";
    } else if (i % 3 === 1) {
      status = "LOWLIGHT";
    } else {
      status = "CRITICAL";
    }

    CameraList.push({
      Position: position,
      SegmentID: i,
      Water: ComputeWater(position, time + i * 5) / 2,
      Light: ComputeLight(position),
      Status: status,
    });
  }

  return CameraList;
}

export function asJSON(time) {
  let Data = generateData(time);
  return JSON.stringify(Data);
}

/**
 * Safe wrapper for ComputeWater that prevents stack overflow
 * @param {Array} pos - Position coordinates
 * @param {Number} t - Time
 * @param {Number} depth - Recursion depth tracker
 * @returns {Number} Water level
 */
function ComputeWaterSafe(pos, t, depth = 0) {
  // Prevent infinite recursion
  if (depth > 20) {
    return 0.5; // Return a default value
  }

  // For positions not explicitly defined, use interpolation or default
  const knownPositions = [
    [0, 0], [1, 0], [0, 1], [1, 1], [1.25, 1], [3, 1],
    [1.25, 1.5], [1, 2], [2, 2], [3, 2]
  ];

  const isKnown = knownPositions.some(
    known => Math.abs(known[0] - pos[0]) < 0.01 && Math.abs(known[1] - pos[1]) < 0.01
  );

  if (isKnown) {
    try {
      return ComputeWater(pos, t);
    } catch (e) {
      return 0.5;
    }
  }

  // For unknown positions, interpolate based on nearby known positions
  // Simple average of nearby values
  let nearestValue = 0.5;
  let minDist = Infinity;

  for (const known of knownPositions) {
    const dist = Math.sqrt((pos[0] - known[0]) ** 2 + (pos[1] - known[1]) ** 2);
    if (dist < minDist) {
      minDist = dist;
      try {
        nearestValue = ComputeWater(known, t);
      } catch (e) {
        nearestValue = 0.5;
      }
    }
  }

  return nearestValue;
}

/**
 * Generates data for all camera locations (expanded grid coverage)
 * This includes many more monitoring points across the sewer system
 *
 * @param time
 * @returns Simulated sewer camera data for all locations
 */
function generateAllLocationsData(time) {
  const CameraList = [];

  // Comprehensive grid of all camera locations
  // Covers a 4x3 grid with 0.5 unit spacing for detailed monitoring
  const allCoordinates = [
    // Row y=0
    [0.0, 0.0],
    [0.5, 0.0],
    [1.0, 0.0],
    [1.5, 0.0],
    [2.0, 0.0],
    [2.5, 0.0],
    [3.0, 0.0],

    // Row y=0.5
    [0.0, 0.5],
    [0.5, 0.5],
    [1.0, 0.5],
    [1.5, 0.5],
    [2.0, 0.5],
    [2.5, 0.5],
    [3.0, 0.5],

    // Row y=1.0
    [0.0, 1.0],
    [0.5, 1.0],
    [1.0, 1.0],
    [1.25, 1.0],
    [1.5, 1.0],
    [2.0, 1.0],
    [2.5, 1.0],
    [3.0, 1.0],

    // Row y=1.25
    [1.25, 1.25],

    // Row y=1.5
    [0.0, 1.5],
    [0.5, 1.5],
    [1.0, 1.5],
    [1.25, 1.5],
    [1.5, 1.5],
    [2.0, 1.5],
    [2.5, 1.5],
    [3.0, 1.5],

    // Row y=2.0
    [0.0, 2.0],
    [0.5, 2.0],
    [1.0, 2.0],
    [1.5, 2.0],
    [2.0, 2.0],
    [2.5, 2.0],
    [3.0, 2.0],

    // Row y=2.5
    [0.0, 2.5],
    [0.5, 2.5],
    [1.0, 2.5],
    [1.5, 2.5],
    [2.0, 2.5],
    [2.5, 2.5],
    [3.0, 2.5],
  ];

  for (let i = 0; i < allCoordinates.length; i++) {
    const position = allCoordinates[i];

    let status;
    if (i % 3 === 0) {
      status = "OK";
    } else if (i % 3 === 1) {
      status = "LOWLIGHT";
    } else {
      status = "CRITICAL";
    }

    CameraList.push({
      Position: position,
      SegmentID: i,
      Water: ComputeWaterSafe(position, time + i * 5) / 2,
      Light: ComputeLight(position),
      Status: status,
    });
  }

  return CameraList;
}

/**
 * Exports all locations data as JSON string
 *
 * @param time
 * @returns JSON string of all camera locations
 */
export function asJSONAllLocations(time) {
  let Data = generateAllLocationsData(time);
  return JSON.stringify(Data);
}
