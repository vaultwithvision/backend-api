import mongoose from 'mongoose';

import { itemLevels } from '../constants/itemLevels.constants.js';

const documentSchema = new mongoose.Schema(
  {
    inArchive: {
      type: Boolean,
      default: false,
    },
    discoverable: {
      type: Boolean,
      default: false,
    },
    withdrawn: {
      type: Boolean,
      default: false,
    },
    owningCollection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
    },
    templateItemOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
    },
    submitter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    collections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection',
      },
    ],
    bundles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bundle',
      },
    ],
    title: {
        type: String,
        required: true,
        maxlength: 255,
      },
    abstract: {
        type: String,
    },
    keywords: [
    {
        type: String,
        maxlength: 50,
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
    files: [{
      type: String,
    }]
  },
  { timestamps: true }
);

export const Item = mongoose.model('Document', documentSchema);
