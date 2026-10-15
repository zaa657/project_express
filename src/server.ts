import app from './app';
import { ENV } from './config/env';
import { initDatabase } from './config/database';

const startServer = async () => {
  try {
    await initDatabase();

    app.listen(ENV.PORT, () => {
      console.log(`Server running on port ${ENV.PORT}`);
    });
  } catch (error) {
    console.error('Server error:', error);
    process.exit(1);
  }
};

startServer();
