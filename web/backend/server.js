const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
    })
);


const PORT = process.env.PORT   || 5000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.log('Database connection error:', err));

// User Schema
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// User Model
const User = mongoose.model('User', UserSchema);

let incomingLoginJSON = null;

// Login route
app.post('/login', async (req, res) => {
    
    const { email, password } = req.body;
    // Log the incoming JSON data
    console.log('Incoming login JSON:', req.body);

    // incomingData = req.body;
    incomingLoginJSON = req.body;

    try {
        const user = await User.findOne({email});
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.get('/admin', (req, res) => {
   if(req.session.email){
      
    return res.json({ message: 'Dashboard data',user: req.session.email });
   } else {
       res.status(401).json({ error: 'Unauthorized' });
   }})

app.get('/', (req, res) => {
    // res.send('Hello, World!');

    if (incomingLoginJSON) {
        res.send(`
            <html>
                <body>
                    <pre>${JSON.stringify(incomingLoginJSON, null, 2)}</pre>
                </body>
            </html>
        `);
    } else {
        res.send(`
            <html>
                <body>
                    <h1>No login JSON received yet</h1>
                </body>
            </html>
        `);
    }
});


// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
