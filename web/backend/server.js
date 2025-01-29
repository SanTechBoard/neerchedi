const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const cookieParser = require('cookie-parser');
// const bodyParser = require('body-parser');
const app = express();
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

dotenv.config();
const PORT = process.env.PORT; 

app.use(cors({origin: "http://localhost:3000", // Allow React frontend
    credentials: true,})
);
app.use(express.json());
app.use(cookieParser());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1 * 60 * 24
    }
    })
);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.log('Database connection error:', err));


// Login route
app.post('/login', async (req, res) => {

    if (req.session.user) {
        return res.status(400).json({ message: "Already logged in!" });
      }
    
    const { email, password } = req.body;
    // console.log('Incoming login JSON:', req.body);

    try {
        const user = await User.findOne({email});
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: 'Invalid password' });

        req.session.user = { email };
        return res.json({ message: 'Logged in successfully' });
        // res.json({ message: 'Logged in successfully', data: req.session.user,valid: true});
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

app.post("/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

// Authentication Check Route
app.get("/auth", (req, res) => {
    if (req.session.user) {
      res.json({ isAuthenticated: true });
    } else {
      res.json({ isAuthenticated: false });
    }
  });

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
