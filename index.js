import dotenv from 'dotenv';
import connectdb from './db/index.js';
import { app } from './app.js';

// Load environment variables
dotenv.config({
    path: './.env'
});

// Connect to MongoDB and start the server
connectdb()
    .then(() => {
        // Use Railway's PORT or fallback to 8000 for local testing
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running at port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log('MongoDB connection failed:', err);
    });
