const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255
    },
    description: {
        type: String,
        maxlength: 1024
    },
    dueDate: {
        type: Date,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;