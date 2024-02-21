const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Define the schema for the Container model
const containerSchema = new Schema({

    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    legacyId: {
        type: Number,
    },
    logo: {
        type: String,
    },
    template: {
        type: Schema.Types.ObjectId,
        ref: 'Document'
    },
    submitters: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },
    admins: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },
    repositories: [{
        type: Schema.Types.ObjectId,
        ref: 'Repository'
    }]
});


// Create the Container model using the schema
export const Container = mongoose.model('Container', containerSchema);
