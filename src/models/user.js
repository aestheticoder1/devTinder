const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        minlength: 4
    },
    lastName:{
        type: String
    },
    emailId:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email");
            }
        }
    },
    password:{
        type: String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Weak password entered");
            }
        }
    },
    age:{
        type: Number,
        min:18
    },
    gender:{
        type: String,
        validate(value){
            if(!["male", "female","others"].includes(value)){
                throw new Error("Gender should be male, female or others");
            }
        }
    },
    photoUrl:{
        type: String,
        default: "https://media.istockphoto.com/id/1316420668/vector/user-icon-human-person-symbol-social-profile-icon-avatar-login-sign-web-user-symbol.jpg?s=612x612&w=0&k=20&c=AhqW2ssX8EeI2IYFm6-ASQ7rfeBWfrFFV4E87SaFhJE=",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("Invalid Photo URL");
            }
        }
    },
    about:{
        type: String,
        default: "No description provided"
    },
    skills:{
        type: [String]
    }
},
{
    timestamps: true,
});

const User = mongoose.model('User',userSchema);

module.exports = User;
