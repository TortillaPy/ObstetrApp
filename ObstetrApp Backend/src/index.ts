import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

import { router } from './routes';

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ObstetrApp API' });
});

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
