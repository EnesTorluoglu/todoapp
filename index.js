const express = require('express');
const mongoose = require('mongoose');
const app = express();
const ToDo = require('./models/ToDo');

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
})

// Get all todos
app.get('/api/todos', async(req, res) => {
    try{
        const todos = await ToDo.find({}).sort('dueDate');
        res.status(200).json(todos);
    }catch(err){
        res.status(500).json({message: err.message});
    }
})

// Get a single one of todos with given ID
app.get('/api/todos/:id', async(req, res) => {
    try{
        const {id} = req.params;
        const todo = await ToDo.findById(id);
        if(!todo){
            return res.status(404).json({message: `ToDo not found with id ${id}`});
        }
        res.status(200).json(todo);
    }catch(err){
        res.status(500).json({message: err.message});
    }
})

app.post('/api/todos', async(req, res) => {
    try {
        const todo = await ToDo.create(req.body);
        res.status(200).json(todo);
    }catch(err) {
        console.log(err.message);
        res.status(500).json({message: err.message});
    }
})

app.put('/api/todos/:id', async(req, res) => {
    try{
        const {id} = req.params;
        const todo = await ToDo.findByIdAndUpdate(id, req.body, {new: true});
        if(!todo){
            return res.status(404).json({message: `ToDo not found with this id: ${id}`});
        }
        res.status(200).json(todo);
    }catch(err){
        console.log(err.message);
        res.status(500).json({message: err.message});
    }
})

app.patch('/api/todos/:id', async(req, res) => {
    try{
        const {id} = req.params;
        const todo = await ToDo.findByIdAndUpdate(id, req.body, { new: true });
        if(!todo){
            return res.status(404).json({message: `ToDo not found with this id: ${id}`});
        }
        res.status(200).json(todo);
    }catch(err){
        console.log(err.message);
        res.status(500).json({message: err.message});
    }
})

app.delete('/api/todos/:id', async(req, res) => {
    try{
        const {id} = req.params;
        const todo = await ToDo.findByIdAndDelete(id);
        if(!todo){
            return res.status(404).json({message: `ToDo not found with this id: ${id}`});
        }
        res.status(200).json(todo);
    }catch(err){
        console.log(err.message);
        res.status(500).json({message: err.message});
    }
})

const port = process.env.PORT || 3000;
mongoose.
connect('mongodb+srv://enestorluoglu:XA8TJ6KjyR7Envcx@democluster.kqywdg8.mongodb.net/ToDo-API?retryWrites=true&w=majority&appName=DemoCluster')
.then(() => {
    console.log('MongoDB Connected')
    app.listen(port, () => {
        console.log(`Listening on port ${port}...`)
    });
}).catch(err => console.log(err));
