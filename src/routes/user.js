const express = require('express');
const userRouter = express.Router();

const User = require('../models/user');
const { userAuth } = require('../middlewares/auth')
const ConnectionRequest = require('../models/connectionRequest')

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills"

// GET ALL CONNECTION REQUESTS OF THE LOGGED IN USER;
userRouter.get("/user/requests/received",
    userAuth,
    async (req, res) => {
        try {
            const loggedInUser = req.user;

            const connectionRequests = await ConnectionRequest.find({
                toUserId: loggedInUser._id,
                status: "interested"
            }).populate("fromUserId", "firstName lastName photoUrl age gender about skills")

            res.json({
                message: "Connection requests fetched successfully",
                data: connectionRequests
            });
        }
        catch (err) {
            res.status(400).send("Error : " + err.message);
        }
    }
)

// GET ALL CONNECTIONS OF THE LOGGED IN USER;
userRouter.get("/user/connections",
    userAuth,
    async (req, res) => {
        try {
            const loggedInUser = req.user;

            const connectionRequests = await ConnectionRequest.find({
                $or: [
                    { fromUserId: loggedInUser._id, status: 'accepted' },
                    { toUserId: loggedInUser._id, status: 'accepted'}
                ]
            }).populate("fromUserId", USER_SAFE_DATA).populate("toUserId", USER_SAFE_DATA)

            const data = connectionRequests.map((row) => {
                if(row.fromUserId._id.toString() === loggedInUser._id.toString()){
                    return row.toUserId
                }
                else{
                    return row.fromUserId
                }
            });

            res.json({
                message: "Connections fetched successfully",
                data
            });
        }
        catch (err) {
            res.status(400).send("Error : " + err.message);
        }
    }
)

// GET THE FEED FOR A USER
userRouter.get("/feed",
    userAuth,
    async (req, res) => {
        try {
            const loggedInUser = req.user;
            const page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 10;
            limit = limit > 50 ? 50: limit;
            const skip = (page-1)*(limit);
            

            // USER SHOULD SEE ALL THE USER CARDS EXCEPT :
            // 1. THE USER HIMSELF - DONE
            // 2. HIS CONNECTIONS - DONE
            // 3. USERS THAT HE HAS REQUESTED TO CONNECT WITH - DONE
            // 4. USERS THAT HE HAS IGNORED - DONE
            // 5. USERS THAT HAS SENT HIM THE CONNECTION REQUEST - DONE
           
            // FIRST, FIND ALL CONNECTION REQUESTS (SENT + RECEIVED)
            const connectionRequests = await ConnectionRequest.find({
                $or: [
                    { fromUserId: loggedInUser._id },
                    { toUserId: loggedInUser._id }
                ]
            }).select("fromUserId toUserId")
            // .populate("fromUserId", "firstName")
            // .populate("toUserId", "firstName")

            const hideUsersFromFeed = new Set();
            // hideUsersFromFeed.add(loggedInUser._id.toString());

            connectionRequests.forEach(req => {
                hideUsersFromFeed.add(req.fromUserId.toString());
                hideUsersFromFeed.add(req.toUserId.toString());
            });

            // console.log(hideUsersFromFeed);

            const users = await User.find({
                $and: [
                    { _id: { $nin: Array.from(hideUsersFromFeed) } },
                    { _id: { $ne: loggedInUser._id } }
                ]
            }).select(USER_SAFE_DATA)
            .skip(skip).limit(limit)

            res.json({data: users});

            // res.status(200).json({connectionRequests})
        }
        catch (err) {
            res.status(400).send("Error : " + err.message);
        }
    }
)


module.exports = userRouter;