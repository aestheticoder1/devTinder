const cron = require('node-cron');
const { subDays, startOfDay, endOfDay } = require('date-fns');
const sendEmail = require("./sendEmail");
const ConnectionRequestModel = require('../models/connectionRequest');

// This job will run at 8 A.M. everyday.
cron.schedule("0 8 * * *", async () => {
    try {
        const yesterday = subDays(new Date(), 1);
        const yesterdayStart = startOfDay(yesterday);
        const yesterdayEnd = endOfDay(yesterday);

        const pendingRequests = await ConnectionRequestModel.find({
            status: "interested",
            createdAt: {
                $gte: yesterdayStart,
                $lt: yesterdayEnd
            }
        }).populate("fromUserId toUserId")

        const listOfEmails = [...new Set(pendingRequests.map(req => req.toUserId.emailId))];
        // console.log(listOfEmails);
        for (const email of listOfEmails) {
            try {
                const res = await sendEmail.run("New Connection Request pending for " + email, "There are so many connection requests pending for you !! PLEASE LOGIN.")
                // console.log(res);
            }
            catch (err) {
                console.error(`Error sending email to ${email}: ${err.message}`);
            }
        }

    }
    catch (err) {
        console.error(err);
    }
})