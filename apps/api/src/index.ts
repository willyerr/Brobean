import express from 'express';
import cors from 'cors';
import beanRoutes from './routes/beanRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
import { runMigrations } from './database/migrate.js';

const app = express();

// Middleware
app.use(cors());

// Foto 5 MB dalam Base64 membutuhkan sekitar 6.7 MB.
// Batas 8 MB memberi ruang untuk payload JSON.
app.use(express.json({ limit: '8mb' }));

// Bean API
app.use('/api/beans', beanRoutes);

app.use(errorHandler);

// JSON response untuk endpoint yang tidak ditemukan
app.use((_req, res) => {
  res.status(404).json({
    message: 'Endpoint tidak ditemukan.'
  });
});

/// Jalankan database migrations sebelum server dimulai
runMigrations();

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server API berjalan di http://localhost:${PORT}`);
});