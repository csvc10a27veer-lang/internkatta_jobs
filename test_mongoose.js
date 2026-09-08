const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    }
});

const Model = mongoose.model('TestMCQ', schema);

const doc = new Model({ question: "" });

const error = doc.validateSync();
console.log(error ? "Validation failed: " + error.message : "Validation passed!");
