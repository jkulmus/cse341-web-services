require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');
const { connectDB } = require('./data/database');

const app = express();
const port = process.env.PORT || 3000;

// Allow course frontend to read API responses
app.use(cors({
    origin: 'https://cse341-contacts-frontend.netlify.app'
}));

// READ json sent in POST adn PUT req
app.use(express.json());

// Display interactive swagger doc
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

// Load app routes
app.use('/', require('./routes'));

async function startServer() {
    try {
        await connectDB();

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();