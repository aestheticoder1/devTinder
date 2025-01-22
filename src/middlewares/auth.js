const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req, res, next) => {
    try {
        // READ TOKEN FROM THE REQUEST COOKIES
        const cookies = req.cookies;
        const { token } = cookies;

        // VALIDATE THE TOKEN
        if (!token) {
            throw new Error('Invalid token')
        }
        const decodedMessage = await jwt.verify(token, "DEV@Tinder$798");
        const { _id } = decodedMessage;

        // FIND THE USER IN THE DATABASE
        const user = await User.findById(_id);
        if (!user) {
            throw new Error('Invalid user')
        }

        req.user = user;
        next();
    }
    catch (error) {
        res.status(400).send("ERROR : " + error.message);
    }
}

module.exports = {
    userAuth
}