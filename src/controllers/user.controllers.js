import mongoose from "mongoose";
import jwt from 'jsonwebtoken';

import { asyncHandlerWithPromise } from '../utils/asyncHandler.js';
import { APIerrorHandler } from '../utils/APIerrorHandler.js';
import { APIresponseHandler } from '../utils/APIresponseHandler.js';
import { User } from "../models/user.models.js";



// Method to generate Access & Refresh Tokens
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken }

    } catch (error) {
        throw new APIerrorHandler(500, "Something went wrong while generating your tokens!")
    }
}


// User controller for registration
const registerUser = asyncHandlerWithPromise(
    async(req, res) => {
        // TODO: to write user-register controller with proper error handling
    }
);


const loginUser = asyncHandlerWithPromise(
    async(req, res) => {
        // TODO: to write user-login controller with proper error handling
    }
);


export { registerUser, loginUser }