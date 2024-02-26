const mongoose = require('mongoose');

import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

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
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    submitters: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    admins: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    repositories: [{
        type: Schema.Types.ObjectId,
        ref: 'Repository'
    }]
});

containerSchema.plugin(mongooseAggregatePaginate);

// Create the Container model using the schema
export const Container = mongoose.model('Container', containerSchema);
