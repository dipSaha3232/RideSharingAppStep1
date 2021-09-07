const mongoose = require('mongoose');


const driverSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },

    rating : {
        type : Number,
        required : true
    }
})

module.exports = mongoose.model('Driver', driverSchema)