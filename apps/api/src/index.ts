import express from 'express';
import cors from 'cors';
import beanRoutes from './routes/beanRoutes.js';
import preparationRoutes from './routes/preparationRoutes.js';
import brewRoutes from './routes/brewRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
import { runMigrations } from './database/migrate.js';

const app = express();

// Middleware
app.use(cors());

// Foto 5 MB dalam Base64 membutuhkan sekitar 6.7 MB.
app.use(express.json({ limit: '8mb' }));

// API routes
app.use('/api/beans', beanRoutes);
app.use('/api/preparations', preparationRoutes);
app.use('/api/brews', brewRoutes);

// Error handler harus berada setelah seluruh routes.
app.use(errorHandler);

// JSON response untuk endpoint yang tidak ditemukan.
app.use((_req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan.' });
});

// Jalankan migration sebelum server menerima request.
runMigrations();

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server API berjalan di http://localhost:${PORT}`);
});
