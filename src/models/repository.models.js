const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the Repository model
const repositorySchema = new Schema({
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
        required: false // Assuming it's not mandatory
    },
    subCommunities: [{
        type: Schema.Types.ObjectId,
        ref: 'Container'
    }],
    parentCommunities: [{
        type: Schema.Types.ObjectId,
        ref: 'Container'
    }],
    admins: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },
    logo: {
        type: String,
        required: true
    },
});

// Create the Repository model using the schema
export const Repository = mongoose.model('Repository', repositorySchema);

