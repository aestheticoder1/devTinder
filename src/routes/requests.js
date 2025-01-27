const express = require('express')

const requestRouter = express.Router();

const {userAuth} = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest')
const User = require('../models/user')

requestRouter.post("/request/send/:status/:toUserId",
    userAuth,
    async (req, res) => {
        try{
            const fromUserId = req.user._id;
            const {status, toUserId} = req.params;

            const allowedStatus = ["ignored", "interested"];
            if (!allowedStatus.includes(status)) {
                return res
                .status(400)
                .json({message: "Invalid status type: " + status})
            }

            // CHECK IF THE TO USER EXISTS
            const toUser = await User.findById(toUserId);
            if(!toUser){
                return res
               .status(400)
               .json({message: "User Not Found"})
            }

            // CHECK IF THERE IS AN EXISTING CONNECTION REQUEST BETWEEN THESE TWO
            // USERS ALREADY
            const existingConnectionRequest = await ConnectionRequest.findOne({
                $or:[
                    {fromUserId: fromUserId, toUserId: toUserId},
                    {fromUserId: toUserId, toUserId: fromUserId},
                ]
            })
            if(existingConnectionRequest){
                return res
                .status(400)
                .send({message: "Connection request already exists"})
            }

            const connectionRequest = new ConnectionRequest({
                fromUserId,
                toUserId,
                status
            })

            const data = await connectionRequest.save();
            res.json({
                message: "Connection request sent successfully",
                data,
            })
        }
        catch (error) {
            res.status(400).send("Error : " + error.message);
        }
    }
)


module.exports = requestRouter;