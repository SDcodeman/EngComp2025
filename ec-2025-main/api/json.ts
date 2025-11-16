import * as datagen from "./datagen";

export function response(req: any, res: any): void {
  const time = new Date();
  res.json(datagen.asJSON(time.valueOf() / 1000));
}
