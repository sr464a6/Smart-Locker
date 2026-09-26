import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import lockersRouter from './routes/lockers.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/lockers', lockersRouter);
app.get('/', (req, res) => res.send('Gojek Smart Locker API v3 - GET /api/lockers'));

const PORT = process.env.PORT || 4000;
initDb().then(() => app.listen(PORT, () => console.log(`Backend jalan di http://localhost:${PORT}`)));
