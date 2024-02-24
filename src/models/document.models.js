import mongoose, { Schema } from 'mongoose';

import { itemLevels } from '../constants/itemLevels.constants.js';

const documentSchema = new mongoose.Schema(
  {
    inArchive: {
      type: Boolean,
      default: false,
    },
    discoverable: {
      type: Boolean,
      default: true,
    },
    withdrawn: {
      type: Boolean,
      default: false,
    },
    owningRepository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
    },
    templateItemOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
    },
    submitter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    files: [{
      type: String,
      required: true
    }],
    title: {
        type: String,
        required: true,
        maxlength: 255,
    },
    description: {
      type: String,
      required: true
    },
    abstract: {
        type: String,
    },
    keywords: [
    {
        type: String,
        maxlength: 50,
        required: true
    },
    ],
    language: {
        type: String,
        enum: spokenLanguages.map(language => language.name),
        default: "English"
    },
    license: {
        type: String,
        maxlength: 50,
    },
    embargoEndDate: {
        type: Date,
    },
    archivedDate: {
        type: Date,
    },
    documentLevel: {
        type: String,
        enum: itemLevels.map(levelName => levelName.name),
        default: 'Public Access'
    },
    totalViews: {
      type: Number,
      default: 0
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export const Document = mongoose.model('Document', documentSchema);
