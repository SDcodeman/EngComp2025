import express from 'express';
import cors from 'cors'; // Import cors
import { getLatestCameraData } from './data-provider';

const app = express();
const port = 3000;

app.use(cors()); // Use cors middleware

app.get('/api/data', (req, res) => {
  const data = getLatestCameraData();
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
