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
const cors = require('cors')

require("dotenv").config()

app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from the specified origin
    credentials: true, // Send cookies with the response
})); // Enable CORS for all requests

app.use(express.json()); // To parse JSON request bodies
app.use(cookieParser()); // To parse cookies

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/requests');
const userRouter = require('./routes/user')

app.use('/',authRouter);
app.use('/',profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);

connectDB()
    .then(() => {
        console.log("MongoDB Connected...");
        app.listen(7777, () => {
            console.log('Server is running on port 7777');
        });
    }).catch(err => {
        console.error("Error connecting to MongoDB:",+err.message);
    })

