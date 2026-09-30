require('dotenv').config();

const express = require('express');
const { connectDB } = require('./data/database');

const app = express();
const port = process.env.PORT || 3000;

// Read JSON sent in POST and PUT req
app.use(express.json());

app.use('/', require('./routes'));

async function startServer() {
    try {
        await connectDB();

        app.listen(port,() => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();