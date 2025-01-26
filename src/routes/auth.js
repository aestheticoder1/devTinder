const express = require('express')

const authRouter = express.Router();

const {validateSignUpData} = require('../utils/validation')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const validator = require('validator');

authRouter.post('/signup', async (req, res) => {
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

authRouter.post('/login', async (req, res) => {
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

authRouter.post('/logout', (req, res) => {
    res.cookie("token", null, {expires: new Date(Date.now())});
    res.send("Logout successful!");
})


module.exports = authRouter;