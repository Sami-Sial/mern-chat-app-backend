const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    pic: {
        type: String,
        default: "https://t4.ftcdn.net/jpg/01/23/09/33/360_F_123093367_c7WoJ0uHCkepbgLasnGFBKK8sSNiJw6l.jpg"
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;