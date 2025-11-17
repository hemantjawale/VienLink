/**
 * local server entry file, for local development
 */
import app from './app.js';
import connectDB from './config/database.js';

/**
 * Connect to MongoDB and start server
 */
const PORT = process.env.PORT || 3001;

// Connect to MongoDB first
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server ready on port ${PORT}`);
  });

  /**
   * close server
   */
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}).catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
  process.exit(1);
});

export default app;