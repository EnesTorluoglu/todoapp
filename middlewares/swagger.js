const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

const PORT = process.env.PORT || 3000;

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ToDo App API',
            version: '1.0.0',
            description: 'API Documentation for to do app',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
        components: {
            schemas: {
                ToDo: {
                    type: 'object',
                    properties: {
                        _id: {
                            description: 'The auto-generated id of the todo',
                            type: 'string',
                        },
                        name: {
                            description: 'The title of the todo',
                            type: 'string',
                            required: true,
                            minlength: 3,
                            maxlength: 255
                        },
                        dueDate: {
                            description: 'The due date of the todo',
                            type: 'string',
                            format: 'date',
                            required: true,
                        },
                        completed: {
                            description: 'Indicates whether to do is completed or not',
                            type: 'boolean',
                            default: false
                        },
                        priority: {
                            description: 'Priority of the todo',
                            type: 'string',
                            enum: ['Low', 'Medium', 'High'],
                            default: 'Medium'
                        },
                        userId: {
                            description: 'The id of the user who owns the todo',
                            type: 'string',
                            required: true
                        }
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        username:{
                            description: 'The username of the user',
                            type: 'string',
                            unique: true,
                            required: true,
                        },
                        password: {
                            description: "Password of the user",
                            type: 'string',
                            required: true,
                        }
                    }
                }
            },
        },
    },
    apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;