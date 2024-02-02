import mongoose from 'mongoose';

const userActivityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activityType: {
      type: String,
      required: true,
    },
    activityDetails: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
    },
    location: {
      type: String,
    },
    deviceType: {
      type: String,
    },
    browser: {
      type: String,
    },
    duration: {
      type: Number,
      default: 0,
    },
    isSuccess: {
      type: Boolean,
      default: true,
    },
    errorDetails: {
      type: String,
    },
    additionalData: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export const UserActivityLog = mongoose.model('UserActivityLog', userActivityLogSchema);
