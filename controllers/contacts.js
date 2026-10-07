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
    /*
        #swagger.tags = ['Contacts']
        #swagger.summary = 'Get all contacts'
        #swagger.description = 'Return every contact in the contacts collection.'
        #swagger.responses[200] = {
            description: 'Array of contacts. An empty collection returns an empty array.',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Contact' } } } }
        }
        #swagger.responses[500] = {
            description: 'Unable to retrieve contacts.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } }
        }
    */
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
    /*
        #swagger.tags = ['Contacts']
        #swagger.summary = 'Get one contact by ID'
        #swagger.description = 'Supply a contact ID in the id query parameter.'
        #swagger.parameters['id'] = {
            in: 'query',
            description: '24-character hexadecimal MongoDB contact ID. Use an ID returned by GET all or POST.',
            required: true,
            type: 'string'
        }
        #swagger.responses[200] = {
            description: 'The matching contact.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } }
        }
        #swagger.responses[400] = {
            description: 'Contact ID is missing or invalid.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } }
        }
        #swagger.responses[404] = {
            description: 'Contact not found.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } }
        }
        #swagger.responses[500] = {
            description: 'Unable to retrieve contact.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } }
        }
    */
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
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.status(200).json(contact);
    } catch (error) {
        console.error('Error fetching contact:', error.message);
        res.status(500).json({ message: 'Unable to retrieve contact' });
    }
}

// POST: Create contact and return new ID
async function createContact(req,res) {
    /*
        #swagger.tags = ['Contacts']
        #swagger.summary = 'Create a contact'
        #swagger.description = 'Supply all five contact fields as nonblank strings. The response contains the new contact ID.'
        #swagger.requestBody = {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ContactInput' } } }
        }
        #swagger.responses[201] = {
            description: 'Contact created. Copy the returned id for the GET by ID, PUT, and DELETE requests.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatedContact' } } }
        }
        #swagger.responses[400] = {
            description: 'One or more contact fields are missing, blank, or not strings.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } }
        }
        #swagger.responses[500] = {
            description: 'Unable to create contact.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } }
        }
    */
    if (!hasRequiredFields(req.body)) {
        return res.status(400).json({
            message: 'firstName, lastName, email, favoriteColor, and birthday are required'
        });
    }

    try {
        const contact = buildContact(req.body);
        const result = await getDB()
            .collection('contacts')
            .insertOne(contact);

        return res.status(201).json({ id: result.insertedId });
    } catch (error) {
        console.error('Error creating contact:', error.message);
        return res.status(500).json({ message: 'Unable to create contact' });
    }
}

// PUT: Update contact using ID
async function updateContact(req, res) {
    /*
        #swagger.tags = ['Contacts']
        #swagger.summary = 'Update a contact'
        #swagger.description = 'Supply an existing contact ID and all five contact fields. All five fields are required even when changing just one.'
        #swagger.parameters['id'] = {
            in: 'path',
            description: '24-character hexadecimal MongoDB ID of the contact to update.',
            required: true,
            type: 'string'
        }
        #swagger.requestBody = {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ContactInput' } } }
        }
        #swagger.responses[204] = { description: 'Contact updated successfully. No response body is returned.' }
        #swagger.responses[400] = {
            description: 'Contact ID is invalid, or one or more contact fields are missing, blank, or not strings.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } }
        }
        #swagger.responses[404] = {
            description: 'Contact not found.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } }
        }
        #swagger.responses[500] = {
            description: 'Unable to update contact.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } }
        }
    */
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Please provide a valid contact ID' });
    }

    if (!hasRequiredFields(req.body)) {
        return res.status(400).json({
            message: 'firstName, lastName, email, favoriteColor, and birthday are required.'
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
            return res.status(400).json({ message: 'Contact not found' });
        }

        return res.status(204).send();
    } catch (error) {
        console.error('Error updating contact:', error.message);
        return res.status(500).json({ message: 'Unable to update contact' });
    }
}

// DELETE: Delete a contact using its ID
async function deleteContact(req, res) {
    /*
        #swagger.tags = ['Contacts']
        #swagger.summary = 'Delete a contact'
        #swagger.description = 'Delete the contact matching the supplied ID.'
        #swagger.parameters['id'] = {
            in: 'path',
            description: '24-character hexadecimal MongoDB ID of the contact to delete.',
            required: true,
            type: 'string'
        }
        #swagger.responses[200] = {
            description: 'Contact deleted successfully.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' }, example: { message: 'Contact deleted successfully' } } }
        }
        #swagger.responses[400] = {
            description: 'Contact ID is invalid.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } }
        }
        #swagger.responses[404] = {
            description: 'Contact not found.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } }
        }
        #swagger.responses[500] = {
            description: 'Unable to delete contact.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } }
        }
    */
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Please provide a valid contact ID' });
    }

    try {
        const result = await getDB()
            .collection('contacts')
            .deleteOne({ _id: new ObjectId(id) });

        if (result.deleteCount === 0) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        return res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error.message);
        return res.status(500).json({ message: 'Unable to delete contact' });
    }
}

module.exports = {
    getAllContacts,
    getSingleContact,
    createContact,
    updateContact,
    deleteContact
};