const express = require('express')

const connectDB = require('./config/database')
const app = express();
const User = require('./models/user');

app.use(express.json()); // To parse JSON request bodies

app.post('/signup', async (req, res) => {
    // NEW INSTANCE OF THE USER MODEL
    const user = new User(req.body)

    try {
        await user.save();
        res.send("User registered successfully!");
    }
    catch (err) {
        res.status(400).send("Server error" + err.message);
    }
})

app.get('/user', async (req, res) => {
    const userEmail = req.body.emailId;
    try {
        const user = await User.findOne({ emailId: userEmail });
        if (!user) return res.status(404).send("User not found");
        else res.send(user);
    }
    catch (err) {
        res.status(400).send("Server error occured");
    }
})

app.get('/feed', async (req, res) => {
    try{
        const users = await User.find({});
        res.send(users);
    }
    catch (err) {
        res.status(400).send("Something went wrong");
    }
})

app.delete('/user', async (req, res) => {
    const userId = req.body.userId;
    try {
        const user = await User.findByIdAndDelete(userId);
        res.send("User deleted successfully!");
    }
    catch (err) {
        res.status(400).send("Server error occured");
    }
})

app.patch('/user/:userId', async (req, res)=> {
    const userId = req.params?.userId;
    const data = req.body;

    try{
        const ALLOWED_UPDATES = ["photoUrl","about","gender","age","skills"];

        const isUpdateAllowed = Object.keys(data).every((k)=>ALLOWED_UPDATES.includes(k));

        if(!isUpdateAllowed) {
            throw new Error("Updates not allowed");
        }

        if(data?.skills.length > 10){
            throw new Error("Skills count should not exceed 10");
        }

        //OPTIONS BHI HOTE H PATCH ME
        const user = await User.findByIdAndUpdate({_id:userId},data,{
            returnDocument:"after",
            runValidators: true
        });
        // console.log(user);
        res.send("User Updated Successfully");
    }
    catch (err) {
        res.status(400).send("Server error occured : " + err.message);
    }
})

// app.patch('/user', async (req, res)=> {
//     const userEmail = req.body.userEmail;
//     const data = req.body;
    
//     try{
//         const user = await User.findOneAndUpdate({emailId:userEmail},data);
//         res.send("User updated successfully");
//     }
//     catch (err) {
//         res.status(400).send("Server error occured");
//     }
// })

connectDB()
    .then(() => {
        console.log("MongoDB Connected...");
        app.listen(7777, () => {
            console.log('Server is running on port 7777');
        });
    }).catch(err => {
        console.error("Error connecting to MongoDB:");
    })

