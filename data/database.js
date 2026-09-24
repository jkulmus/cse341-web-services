const { MongoClient } = require('mongodb');

let database;

async function connectDB() {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is missing from .env');
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();

    database = client.db('contactsDB');
    console.log('Connected to MongoDB');
}

function getDB() {
    if (!database) {
        throw new Error('Database is not connected');
    }

    return database;
}

module.exports = { connectDB, getDB };