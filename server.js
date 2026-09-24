require('dotenv').config();

const express = require('express');
const { connectDB } = require('./data/database');

const app = express();
const port = process.env.PORT || 3000;

app.use('/', require('./routes'));

async function startServer() {
    try {
        await connectDB();

        app.listen(port,() => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.getMaxListeners(1);
    }
}

startServer();