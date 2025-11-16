import express from 'express';
import { getLatestCameraData } from './data-provider';

const app = express();
const port = 3000;

app.get('/api/data', (req, res) => {
  const data = getLatestCameraData();
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
