import mongoose from 'mongoose';

const userAnalyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalLogins: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
    },
    totalActions: {
      type: Number,
      default: 0,
    },
    averageSessionDuration: {
      type: Number,
      default: 0,
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
    totalComments: {
      type: Number,
      default: 0,
    },
    totalShares: {
      type: Number,
      default: 0,
    },
    totalPurchases: {
      type: Number,
      default: 0,
    },
    totalDownloads: {
      type: Number,
      default: 0,
    },
    totalPageViews: {
      type: Number,
      default: 0,
    },
    totalFollowers: {
      type: Number,
      default: 0,
    },
    totalMessagesSent: {
      type: Number,
      default: 0,
    },
    totalMessagesReceived: {
      type: Number,
      default: 0,
    },
    totalOrdersPlaced: {
      type: Number,
      default: 0,
    },
    totalItemsAdded: {
      type: Number,
      default: 0,
    },
    totalSearchQueries: {
      type: Number,
      default: 0,
    },
  },
  
);

export const UserAnalytic = mongoose.model('UserAnalytic', userAnalyticsSchema);
