const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 3000;
const axios = require('axios'); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
const RECAPTCHA_SECRET_KEY = '6LcbvBQqAAAAAOpP7ccBgPdOog_61jg907uOChFt';


// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE users (username TEXT PRIMARY KEY, password TEXT, name TEXT, age INTEGER, gender TEXT, weight REAL, height REAL)");
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/patientsignup',(req,res)=>
{
    res.render('patientsignup');
});
app.get('/doctordashboard',(req,res)=>
    {
        res.render('doctor-dashboard');
    });
    app.get('/prescription',(req,res)=>
        {
            res.render('pres');
        });
        app.get('/treatment',(req,res)=>
            {
                res.render('treatmentplan');
            });

async function verifyRecaptcha(token) {
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${token}`);
    return response.data.success;
}
app.post('/signup', async(req, res) => {
    const { username, password, name, age, gender, weight, height,'g-recaptcha-response': recaptchaToken } = req.body;
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
        return res.json({ success: false, message: 'Failed CAPTCHA verification.' });
    }
    console.log(`Sign Up Attempt: Username - ${username}, Password - ${password}, Name - ${name}, Age - ${age}, Gender - ${gender}, Weight - ${weight}, Height - ${height}`);
    db.get("SELECT username FROM users WHERE username = ?", [username], (err, row) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.json({ success: false, message: 'Database error.' });
        }
        if (row) {
            console.log('User already exists.');
            return res.json({ success: false, message: 'User already exists.' });
        }
        db.run("INSERT INTO users (username, password, name, age, gender, weight, height) VALUES (?, ?, ?, ?, ?, ?, ?)", [username, password, name, age, gender, weight, height], (err) => {
            if (err) {
                console.error('Error inserting into database:', err);
                return res.json({ success: false, message: 'Error creating user.' });
            }
            console.log('User created successfully.');
            res.json({ success: true });
        });
    });
});

app.post('/login', async(req, res) => {
    const { username, password , 'g-recaptcha-response': recaptchaToken} = req.body;
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
        return res.json({ success: false, message: 'Failed CAPTCHA verification.' });
    }
    console.log(`Login Attempt: Username - ${username}, Password - ${password}`);
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.json({ success: false, message: 'Database error.' });
        }
        if (!row) {
            console.log('No such user exists.');
            return res.json({ success: false, message: 'No such user exists.' });
        }
        if (row.password !== password) {
            console.log('Incorrect password.');
            return res.json({ success: false, message: 'Incorrect password.' });
        }
        console.log('Login successful.');
        res.json({ success: true, user: row });
    });
});

app.get('/dashboard', (req, res) => {
    const { username } = req.query;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.send('Database error.');
        }
        if (!row) {
            return res.send('No such user exists.');
        }
        res.render('dashboard', { user: row });
    });
});

app.get('/appointment', (req, res) => {
    const { username } = req.query;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.send('Database error.');
        }
        if (!row) {
            return res.send('No such user exists.');
        }
        res.render('appointment', { user: row });
    });
});
app.get('/bookappointment', (req, res) => {
    const { username } = req.query;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.send('Database error.');
        }
        if (!row) {
            return res.send('No such user exists.');
        }
        res.render('bookappointment', { user: row });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});