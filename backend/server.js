const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/userAuthRoutes');
const cityRoutes = require('./routes/cityRoutes');
const attractionRoutes = require('./routes/attractionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userAccountRoutes');
const adminRoutes = require('./routes/adminRoutes');
const utilityRoutes = require('./routes/utilityRoutes');
const imageRoutes = require('./routes/imageRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ message: 'CityExplorer backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/attractions', attractionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/utils', utilityRoutes);
app.use('/api/images', imageRoutes);

// Keep unknown API routes as API 404 responses.
app.use('/api', notFound);

const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
const hasFrontendBuild = fs.existsSync(path.join(frontendDistPath, 'index.html'));

// Serve the merged user and admin portal from one origin in production.
if (hasFrontendBuild) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    console.error('Stop the existing backend process or change PORT in backend/.env, then restart.');
    process.exit(1);
  }

  console.error('Server startup error:', error.message);
  process.exit(1);
});
