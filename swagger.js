const swaggerAutogen = require('swagger-autogen')({
    openapi: '3.0.0'
});

const contactProperties= {
    firstName: {
        type: 'string',
        pattern: '\\s',
        example: 'Demo'
    },
    lastName: {
        type: 'string',
        pattern: '\\s',
        example: 'Contact'
    },
    email: {
        type: 'string',
        pattern: '\\s',
        example: 'demo@example.com'
    },
    favoriteColor: {
        type: 'string',
        pattern: '\\s',
        example: 'Blue'
    },
    birthday: {
        type: 'string',
        pattern: '\\s',
        example: '2000-01-01'
    }
};

const doc = {
    info: {
        title: 'Contacts API',
        description: 'Create, view, update, and delete contacts stored in MongoDB. Each contact has firstName, lastName, email, favoriteColor, and birthday',
        version: '1.0.0'
    },
    servers: [
        {
            url: '/',
            description: 'Current API server'
        }
    ],
    tags: [
        {
            name: 'Contacts',
            description: 'Manage contacts'
        }
    ],
    components: {
        '@schemas': {
            ContactInput: {
                type: 'object',
                description:
                    'All five fields must contain nonblank text. Leading and trailing whitespace is removed. Email and birthday formats are not validated by this API. Extra fields are ignored',
                required: Object.keys(contactProperties),
                properties: contactProperties
            },
            Contact: {
                allOf: [
                    {
                        $ref: '#/components/schemas/ContactInput'
                    },
                    {
                        type: 'object',
                        required: ['_id'],
                        properties: {
                            _id: {
                                type: 'string',
                                description: 'MongoDB conact ID',
                                pattern: '^[a-fA-F0-9]{24}$',
                                example: '507f1f77bcf86cd799439011'
                            }
                        }
                    }
                ]
            },
            CreatedContact: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: {
                        type: 'string',
                        example: '507f1f77bcf86cd799439011'
                    }
                }
            },
            Message: {
                type: 'object',
                required: ['message'],
                properties: {
                    message: {
                        type: 'string'
                    }
                }
            }
        }
    }
};

const outputFile = './swagger-output.json';
const routes = ['./routes/index.js'];

swaggerAutogen(outputFile, routes, doc);