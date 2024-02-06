import mongoose from 'mongoose';

import { itemLevels } from '../constants/itemLevels.constants.js';

const itemSchema = new mongoose.Schema(
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
    lastModified: {
      type: Date,
      default: Date.now,
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
      ref: 'EPerson',
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
        maxlength: 10,
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
    }
    },
  { timestamps: true }
);

export const Item = mongoose.model('Item', itemSchema);
