const mongoose = require('mongoose');

const connectDB = async ()=>{
    await mongoose.connect(
        "mongodb+srv://aestheticoder:Um%40rawat12@namastenode.cpswe.mongodb.net/devTinder"
    );
}

module.exports = connectDB;


