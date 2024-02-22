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
    },
    subContainers: [{
        type: Schema.Types.ObjectId,
        ref: 'Container'
    }],
    parentContainer: {
        type: Schema.Types.ObjectId,
        ref: 'Container'
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    admins:[{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    logo: {
        type: String,
        required: true
    },
});

// Create the Repository model using the schema
export const Repository = mongoose.model('Repository', repositorySchema);

