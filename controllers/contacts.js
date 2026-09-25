const { ObjectId } = require('mongodb');

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

async function getSingleContact(req, res) {
    const id = req.query.id;

    if (typeof id !== 'string' || !ObjectId.isValid(id)) {
        return res.status(400).json({
            message: 'Please provide a valid contact ID'
        });
    }

    try {
        const contact = await getDB()
            .collection('contacts')
            .findOne({ _id: new ObjectId(id) });

        if (!contact) {
            return res.status(404).json({
                message: 'Contact not found'
            });
        }

        res.status(200).json(contact);
    } catch (error) {
        console.error('Error fetching contact:', error.message);
        res.status(500).json({
            message: 'Unable to retrieve contact'
        });
    }
}

module.exports = { getAllContacts, getSingleContact };