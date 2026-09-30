const { ObjectId } = require('mongodb');
const { getDB } = require('../data/database');

// Check that all fields contain text
function hasRequiredFields(body) {
    const fields = [
        'firstName',
        'lastName',
        'email',
        'favoriteColor',
        'birthday'
    ];

    return fields.every(
        (field) =>
            typeof body?.[field] === 'string' &&
            body[field].trim() !== ''
    );
}

// Build a contact using allowed fields
function buildContact(body) {
    return {
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        email: body.email.trim(),
        favoriteColor: body.favoriteColor.trim(),
        birthday: body.birthday.trim()
    };
}

// GET: Retrieve all contacts
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

// GET: Retrieve one contact using query string ID
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

// POST: Create contact and return new ID
async function createContact(req,res) {
    if (!hasRequiredFields(req.body)) {
        return res.status(400).json({
            message:
                'firstName, lastName, email, favoriteColor, and birthday are required'
        });
    }

    try {
        const contact = buildContact(req.body);

        const result = await getDB()
            .collection('contacts')
            .insertOne(contact);

        return res.status(201).json({
            id: result.insertedId
        });
    } catch (error) {
        console.error('Error creating contact:', error.message);
        return res.status(500).json({
            message: 'Unable to create contact'
        });
    }
}

// PUT: Update contact using ID
async function updateContact(req, res) {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({
            message: 'Please provide a valid contact ID'
        });
    }

    if (!hasRequiredFields(req.body)) {
        return res.status(400).json({
            message: 
                'firstName, lastName, email, favoriteColor, and birthday are required.'
        });
    }

    try {
        const contact = buildContact(req.body);

        const result = await getDB()
            .collection('contacts')
            .updateOne(
                { _id: new ObjectId(id) },
                { $set: contact }
            );

        if (result.matchedCount === 0) {
            return res.status(400).json({
                message: 'Contact not found'
            });
        }

        return res.status(204).send();
    } catch (error) {
        console.error('Error updating contact:', error.message);
        return res.status(500).json({
            message: 'Unable to update contact'
        });
    }
}

// DELETE: Delete a contact using its ID
async function deleteContact(req, res) {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({
            message: 'Please provide a valid contact ID'
        });
    }

    try {
        const result = await getDB()
            .collection('contacts')
            .deleteOne({ _id: new ObjectId(id) });

        if (result.deleteCount === 0) {
            return res.status(404).json({
                message: 'Contact not found'
            });
        }

        return res.status(200).json({
            message: 'Contact deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting contact:', error.message);
        return res.status(500).json({
            message: 'Unable to delete contact'
        });
    }
}

module.exports = {
    getAllContacts,
    getSingleContact,
    createContact,
    updateContact,
    deleteContact
};