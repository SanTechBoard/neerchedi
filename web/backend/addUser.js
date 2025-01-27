const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');   

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.log('Database connection error:', err));

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true } // Added username field
});

const User = mongoose.model('User', UserSchema);

async function addUser() {
    const email = 'amithabey13@gmail.com';
    const password = '1234';
    const username = 'amithabey13'; // Added username

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hashedPassword, username }); // Added username
    await user.save();
    console.log('User created:', user);
    mongoose.connection.close();
}

addUser();