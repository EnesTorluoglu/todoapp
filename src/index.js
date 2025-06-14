const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const ToDo = require('./models/ToDo');
const User = require('./models/User');
const authenticate = require('./middlewares/authenticate');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require("./middlewares/swagger");

const app = express();

const port = process.env.PORT || 3001;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());

const SECRET_KEY = "secret";
const LOGGING_SERVICE_URL = 'http://logging:3003/api/logs';

const logMessage = async (message) => {
    try {
        await axios.post(LOGGING_SERVICE_URL, { message });
    } catch (error) {
        console.error('Error logging message:', error);
    }
};

app.get('/', (req, res) => {
    res.send('Hello World!');
})

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Registered the new user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Server errors
 */
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();
        await logMessage(`User registered: ${username}`);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login the user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid username or password
 *       500:
 *         description: Server errors
 */
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            await logMessage(`Login failed for username: ${username}`);
            return res.status(401).json({ message: 'Invalid username' });
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            await logMessage(`Login failed for username: ${username}`);
            return res.status(401).json({ message: 'Invalid password' });
        }
        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
        await logMessage(`User logged in: ${username}`);
        res.status(200).json({ token });
    } catch (err) {
        await logMessage(`Error logging in user: ${err.message}`);
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Get all todos of the logged user, sorted by due date
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: A list of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ToDo'
 *       500:
 *         description: Server error
 */
app.get('/api/todos', authenticate, async(req, res) => {
    try{
        const todos = await ToDo.find({userId: req.user._id}).sort('dueDate');
        await logMessage('Fetched todos');
        res.status(200).json(todos);
    }catch(err){
        await logMessage(`Error fetching todos: ${err.message}`);
        res.status(500).json({message: err.message});
    }
})

/**
 * @swagger
 * /api/todos/:id:
 *   get:
 *     summary: Get a to do with the given id of the logged user
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: To do with the given id
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ToDo'
 *       400:
 *          description: There is no to do with given id
 *       500:
 *         description: Server error
 */
app.get('/api/todos/:id', authenticate, async(req, res) => {
    try{
        const {id} = req.params;
        const todo = await ToDo.findOne({ _id: id, userId: req.user._id });
        if(!todo){
            await logMessage(`ToDo not found with id ${id}`);
            return res.status(404).json({message: `ToDo not found with id ${id}`});
        }
        await logMessage('Fetched todo');
        res.status(200).json(todo);
    }catch(err){
        await logMessage(`Error fetching todos: ${err.message}`);
        res.status(500).json({message: err.message});
    }
})

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new to do
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ToDo'
 *     responses:
 *       200:
 *         description: The created todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ToDo'
 *       500:
 *         description: Server error
 */
app.post('/api/todos', authenticate, async(req, res) => {
    try {
        const todo = new ToDo({
            ...req.body,
            userId: req.user._id,
        });
        await todo.save();
        await logMessage(`Created todo: ${todo.name}`);
        res.status(200).json(todo);
    }catch(err) {
        await logMessage(`Error creating todo: ${err.message}`);
        res.status(500).json({message: err.message});
    }
})

/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: Update a to do by ID
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id of the to do to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ToDo'
 *     responses:
 *       200:
 *         description: The updated todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ToDo'
 *       404:
 *         description: To Do not found
 *       500:
 *         description: Server error
 */
app.put('/api/todos/:id', authenticate, async(req, res) => {
    try{
        const {id} = req.params;
        const todo = await ToDo.findOneAndUpdate({_id: id, userId: req.userId}, req.body, {new: true});
        if(!todo){
            await logMessage(`ToDo not found with id ${id}`);
            return res.status(404).json({message: `ToDo not found with this id: ${id}`});
        }
        await logMessage('Updated todo');
        res.status(200).json(todo);
    }catch(err){
        await logMessage(`Error updating todo: ${err.message}`);
        res.status(500).json({message: err.message});
    }
})

/**
 * @swagger
 * /api/todos/{id}:
 *   patch:
 *     summary: Partially update a to do by ID
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id of the to do to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ToDo'
 *     responses:
 *       200:
 *         description: The updated to do
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ToDo'
 *       404:
 *         description: To Do not found
 *       500:
 *         description: Server error
 */
app.patch('/api/todos/:id', authenticate, async(req, res) => {
    try{
        const {id} = req.params;
        const todo = await ToDo.findOneAndUpdate({_id: id, userId: req.userId}, req.body, { new: true });
        if(!todo){
            await logMessage(`ToDo not found with id ${id}`);
            return res.status(404).json({message: `ToDo not found with this id: ${id}`});
        }
        await logMessage('Updated todo');
        res.status(200).json(todo);
    }catch(err){
        await logMessage(`Error updating todo: ${err.message}`);
        res.status(500).json({message: err.message});
    }
})

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: Delete a to do by ID
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id of the to do to delete
 *     responses:
 *       200:
 *         description: The deleted to do
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ToDo'
 *       404:
 *         description: To Do not found
 *       500:
 *         description: Server error
 */
app.delete('/api/todos/:id', authenticate, async(req, res) => {
    try{
        const {id} = req.params;
        const todo = await ToDo.findOneAndDelete({ _id: id, userId: req.user._id });
        if(!todo){
            await logMessage(`ToDo not found with id ${id}`);
            return res.status(404).json({message: `ToDo not found with this id: ${id}`});
        }
        await logMessage(`Deleted todo with id: ${id}`);
        res.status(200).json(todo);
    }catch(err){
        await logMessage(`Error deleting todo: ${err.message}`);
        res.status(500).json({message: err.message});
    }
})

mongoose.
connect('') /*mongodb key*/
.then(async () => {
    await logMessage('MongoDB Connected');
    console.log('MongoDB Connected')
    app.listen(port, async () => {
        await logMessage(`Listening on port ${port}...`);
        console.log(`Listening on port ${port}...`)
    });
}).catch(err => console.log(err));
