import * as datagen from "./datagen";

export async function response(req: any, res: any): Promise<void> {
  const time = new Date();

  let data = await datagen.asCSV(time.valueOf() / 1000);
  console.log(data);

  res.send(data);
}
