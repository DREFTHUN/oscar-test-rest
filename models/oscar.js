const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    winner: {
        type: Boolean,
        required: false,
        default: false,
    },
    movie: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false,
    }
})

module.exports = mongoose.model("oscar", schema)