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
const http = require('http')

require("dotenv").config();

require('./utils/cronjob');

app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from the specified origin
    credentials: true, // Send cookies with the response
})); // Enable CORS for all requests

app.use(express.json()); // To parse JSON request bodies
app.use(cookieParser()); // To parse cookies

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/requests');
const userRouter = require('./routes/user');
const paymentRouter = require('./routes/payment');
const initializeSocket = require('./utils/socket');
const chatRouter = require('./routes/chat');

app.use('/',authRouter);
app.use('/',profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);
app.use('/',paymentRouter);
app.use('/',chatRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
    .then(() => {
        console.log("MongoDB Connected...");
        server.listen(process.env.PORT, () => {
            console.log('Server is running on port 7777');
        });
    }).catch(err => {
        console.error("Error connecting to MongoDB:",+err.message);
    })

