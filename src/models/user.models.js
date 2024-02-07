import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { spokenLanguages } from '../constants/spokenLanguages.constants.js';
import { userRoles } from '../constants/userRoles.constants.js';


const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            maxlength: 24,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            maxlength: 64
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        profilePicture: {
            type: String,
        },
        coverImage: {
            type: String
        },
        lastActive: {
            type: Date
        },
        canLogIn: {
            type: Boolean,
            default: true,
        },
        selfRegistered: {
            type: Boolean,
            default: true
        },
        password: { 
            type: String, 
            maxlength: 128,
            required: [true, "Password is required!"]
        },
        refreshToken: {
            type: String,
        },
        verified: {
            type: Boolean,
            default: false
        },
        role: {
            type: String,
            enum: userRoles.map(role => role.name),  // Getting all the role names from the  array of objects in constant file.
            default: 'reader',
        },
        viewHistory: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        }],
        userAnalytics: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UserAnalytic'
        },
        userActivityLog: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UserActivityLog'
        }],
        socialMediaLinks: [
            { type: String, default: "" }
        ],
        profileVisibility: {
            type: Boolean,
            default: true
        },
        notificationPreferences: {
            type: Boolean,
            default: false
        },
        languagePreferences: [{
            type: String,
            enum: spokenLanguages.map(language => language.name),
            default: "English"
        }],
        themePreferences: {
            type: String,
            enum: ['dark','light'],
            default: 'dark',
        }

    },
    { timestamps: true }
);

userSchema.pre("save", 
    async function(next) {
        if (!this.isModified("password")) {
            return next();
        }
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
);

userSchema.methods.verifyPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function() {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email
        },
        // ACCESS_TOKEN_SECRET_KEY /TODO: Create a method with crypto to generate secretToken
        {
            //entriesIn: // ACCESS_TOKEN_EXPIRY
        }
    )
};

userSchema.methods.generateRefreshToken = async function() {
    return jwt.sign(
        {
            _id: this._id
        },
        // REFRESH_TOKEN_SECRET_KEY /TODO: Create a method with crypto to generate secretToken
        {
            //entriesIn: // REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema); 