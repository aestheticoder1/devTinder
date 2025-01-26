const express = require('express');

const profileRouter = express.Router();

const User = require('../models/user')
const { userAuth } = require('../middlewares/auth')
const { validateProfileEditData } = require('../utils/validation')

profileRouter.get('/profile/view', userAuth, async (req, res) => {
    try {
        // Get the user from the database
        const user = req.user;
        res.send(user);
    }
    catch (err) {
        res.status(400).send("Error : " + err.message);
    }
})

profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
    try{
        if(!validateProfileEditData(req)){
            throw new Error("Invalid Edit Request");
        }
        
        const loggedInUser = req.user;
        Object.keys(req.body).forEach(key => (loggedInUser[key] = req.body[key]));

        await loggedInUser.save();

        res.json({
            message: `${loggedInUser.firstName} your profile was updated successfully`,
            data: loggedInUser
        });
    }
    catch (err) {
        res.status(400).send("Error : " + err.message);
    }
})

module.exports = profileRouter;