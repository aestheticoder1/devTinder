const express = require('express')
const validator = require('validator')
const cookieParser = require('cookie-parser')

const connectDB = require('./config/database')
const app = express();
const User = require('./models/user');
const { validateSignUpData } = require('./utils/validation')
const { userAuth } = require('./middlewares/auth')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


app.use(express.json()); // To parse JSON request bodies
app.use(cookieParser()); // To parse cookies

app.post('/signup', async (req, res) => {
    // NEVER TRUST REQ.BODY - IT CAN CONTAIN ANYTHING !!

    // VALIDATE THE DATA BEFORE SAVING TO THE DATABASE!!!
    validateSignUpData(req);

    // ENCRYPT THE PASSWORD
    const { firstName, lastName, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    // NEW INSTANCE OF THE USER MODEL
    const user = new User({
        firstName,
        lastName,
        emailId,
        password: passwordHash
    })

    try {
        await user.save();
        res.send("User registered successfully!");
    }
    catch (err) {
        res.status(400).send("Error : " + err.message);
    }
})

app.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!validator.isEmail(emailId))
            throw new Error("Invalid credentials");

        const user = await User.findOne({ emailId: emailId });
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isPasswordValid = await user.validatePassword(password);
        if (isPasswordValid) {

            // CREATE A JWT token
            const token = await user.getJWT();
            // console.log(token);
            // PASS THE TOKEN IN THE COOKIE THEN TO THE RESPONSE
            res.cookie("token", token, {expires: new Date(Date.now() + 8*3600000)}); //EXPIRES IN 8 HOURS

            res.send("Login successful!");
        }
        else {
            throw new Error("Invalid credentials");
        }
    }
    catch (err) {
        res.status(400).send("Error : " + err.message);
    }
})

app.get('/profile', userAuth, async (req, res) => {
    try {
        // Get the user from the database
        const user = req.user;
        res.send(user);
    }
    catch (err) {
        res.status(400).send("Error : " + err.message);
    }
})

connectDB()
    .then(() => {
        console.log("MongoDB Connected...");
        app.listen(7777, () => {
            console.log('Server is running on port 7777');
        });
    }).catch(err => {
        console.error("Error connecting to MongoDB:");
    })

