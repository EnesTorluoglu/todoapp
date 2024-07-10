const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json()); // Middleware to parse JSON bodies

app.listen(port, () => console.log(`Listening on port ${port}...`));

const port = process.env.PORT || 3000;
mongoose.
connect('mongodb+srv://enestorluoglu:XA8TJ6KjyR7Envcx@democluster.kqywdg8.mongodb.net/ToDo-API?retryWrites=true&w=majority&appName=DemoCluster')
.then(() => {
    console.log('MongoDB Connected')
    app.listen(port, () => {
        console.log(`Listening on port ${port}...`)
    });
}).catch(err => console.log(err));
