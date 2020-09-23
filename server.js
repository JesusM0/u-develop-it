//This first line of code must always be included into a server file when using express
const express = require('express');

//This assigns the Port that will be used by the server(3001)
const PORT = process.env.PORT || 3001;
//This assigns the express functionality that we will use when running the server
const app = express();

//Express Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//This is just a test route to see if server was running
// app.get('/', (req, res) => {
//     res.json({
//         message: 'Hello World'
//     });
// });

// Default response for any other requests(NOT FOUND) Catch all
// This route handler makes sure that is an incorrect endpoint is inserted,
// a error(404) will be displayed.
app.use((req, res) => {
    res.status(404).end();
});

//This function will start the Express.js server on port 3001
app.listen(PORT, () => {
    console.log(`Server runnning on Port: ${PORT}`);
});