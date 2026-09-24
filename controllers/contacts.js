const { getDB } = require('../data/database');

async function getAllContacts(req, res) {
    try {
        const contacts = await getDB()
        .collection('contacts')
        .find({})
        .toArray();

        res.status(200).json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error.message);
        res.status(500).json({ message: 'Unable to retrieve contacts' });
    }
}

module.exports = { getAllContacts };