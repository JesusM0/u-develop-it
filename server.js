//This first line of code must always be included into a server file when using express
const express = require('express');

//This assigns the sqlite3 package to a const var
//This statement sets the execution mode to verbose to produce messages in the terminal regarding the state of the runtime
const sqlite3 = require('sqlite3').verbose();

//
const inputCheck = require('./utils/inputCheck');

//This assigns the Port that will be used by the server(3001)
const PORT = process.env.PORT || 3001;
//This assigns the express functionality that we will use when running the server
const app = express();

//Express Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Connect to Database
const db = new sqlite3.Database('./db/election.db', err => {
    if (err) {
        return console.error(err.message);
    }

    console.log('Connected To The Election Database.');
});

/*AS a user, I can request a list of all potential candidates.
• The .all() method d runs the SQL query and executes the callback with all the resulting rows that match the query.
• Rows, which is the database query response.
• GET route for all candidates */
app.get('/api/candidates', (req, res) => {
    const sql = `SELECT * FROM candidates`;
    const params = [];

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json({
            message: 'Success',
            data: rows
        });
    });
});

/*AS a user, I can request a single candidates's information
• This get() method runs the SQL query and executes the callback with the specific request information in the WHERE
• In this case, we requested info based on the ID of the row.
• GET route for single candidate
• Error status code(400) will notify the client that their request wasn't accepted and to try a different request.*/
app.get('/api/candidate/:id', (req, res) => {
    const sql = `SELECT * FROM candidates WHERE id = ?`;
    const params = [req.params.id];

    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        res.json({
            message: 'Data Retrieved',
            data: row
        });
    });
});

/*AS a user, i want to delete a candidate
• The run() method executes an SQL query but wont retrieve any result data
• We used function instead of => so that we can use the changes property. */
app.delete('/api/candidate/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];

    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ error: res.message });
            return;
        }

        res.json({
            message: 'Deleted Successfully',
            changes: this.changes
        });
    });
});

/* Create Candidate
• In the callback function, we'll use the object req.body instead of just req to populate the candidate's data.
•  */
app.post('/api/candidate', ({ body }, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }

    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected) 
              VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];
    // ES5 function, not arrow function, to use `this`
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: body,
            id: this.lastID
        });
    });
});

// Default response for any other requests(NOT FOUND) Catch all
// This route handler makes sure that is an incorrect endpoint is inserted,
// a error(404) will be displayed.
app.use((req, res) => {
    res.status(404).end();
});

//This function will start the Express.js server on port 3001
//Start Server After Database Connection, We must wrap the Express connection in an event handler
db.on('open', () => {
    app.listen(PORT, () => {
        console.log(`Server runnning on Port: ${PORT}`);
    });
});