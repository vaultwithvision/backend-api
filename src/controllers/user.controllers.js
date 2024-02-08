import mongoose from "mongoose";
import jwt from 'jsonwebtoken';

import { User } from '../models/user.models.js';
import { Token } from "../models/secretCode.models.js";

import { asyncHandlerWithPromise } from '../utils/asyncHandler.js';
import { APIerrorHandler } from '../utils/APIerrorHandler.js';
import { APIresponseHandler } from '../utils/APIresponseHandler.js';
import { uploadOnCloudinary } from '../utils/uploadTocloudinary.js';
import { generateToken } from '../utils/generateToken.js';
import { sendEmail } from '../utils/emailTransporter.js';

import { userEmail, secretCode, emailSubject, emailBody } from '../constants/emailSubjectAndBody.js';


// Method to generate Access & Refresh Tokens
const generateAccessAndRefreshTokens = async (userId) => {

    try {

        const user = await User.findById(userId);

        if (!user) {
            throw new APIerrorHandler(404, "User Not Found!");
        }

        // Generate access token asynchronously
        const accessTokenPromise = user.generateAccessToken();
        // Generate refresh token asynchronously
        const refreshTokenPromise = user.generateRefreshToken();

        // Await both promises
        const [ accessToken, refreshToken ] = await Promise.all(
            [accessTokenPromise, refreshTokenPromise]);

        // Update refresh token in user object
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }

    } catch (error) {

        if (error.name === "APIerrorHandler") {
            throw error;
        } else {
            console.log(error);
            throw new APIerrorHandler(500, "Something went wrong while generating your tokens!");
        }

    }

};


// User controller for registration
const registerUser = asyncHandlerWithPromise(
    async(req, res) => {
        
        try {

            // gathering user-info from req-body
            const { username, email, firstName, lastName, password, confirmPassword } = req.body;

            // user-input validation
            if (
                [username, email, firstName, lastName, password, confirmPassword].some(
                    (field) => field?.trim() === "")
            ) {
                throw new APIerrorHandler(400, "All fields ae required to register!")
            }

            // checking for password and confirmPassword
            if (password !== confirmPassword) {
                throw new APIerrorHandler(400, "Your password and confirm password must match")
            }

            // checking if user is already in the DB
            const existedUser = await User.findOne(
                { $or: [{ username }, { email }] }
            );

            if (existedUser) {
                throw new APIerrorHandler(400, `User with username : ${username} or email : ${email} already exist. Please try with a different username or email.`)
            }

            // checking for user profilePicture  && coverImage
            let profilePictureLocalPath;
            if (req.files && Array.isArray(req.files.profilePicture) && req.files.profilePicture.length > 0) {
                profilePictureLocalPath = req.files.profilePicture[0].path;
            }
            if (!profilePictureLocalPath) {
                console.log("Are you sure you want to register without profile picture?");
            }

            let coverImageLocalPath;
            if (req.files && Array.isArray(req.files.profilePicture) && req.files.profilePicture.length > 0) {
                coverImageLocalPath = req.files.profilePicture[0].path;
            }

            // upload images to cloudinary and confirmation for upload
            const profilePicture = await uploadOnCloudinary(profilePictureLocalPath);
            const coverImage = await uploadOnCloudinary(coverImageLocalPath);
            
            if (!profilePicture || !coverImage) {
                throw new APIerrorHandler(400, "Sorry! We are unable to upload your file for some reason!")
            }

            // create an user-object with the form data provided by the user
            const createdUser = await User.create(
                {
                    username,
                    email,
                    firstName,
                    lastName,
                    profilePicture,
                    coverImage,
                    password,
                    profilePicture: profilePicture?.url || "",
                    coverImage: coverImage?.url || ""
                }
            );

            if (!createdUser) {
                throw new APIerrorHandler(400, "Something went wrong while creating your records in Database.")
            };

            // check for user in DB
            const getRecentlyCreatedUserFromDBbyId = await User.findById(createdUser._id).select(
                "-password -refreshToken"
            )

            if (!getRecentlyCreatedUserFromDBbyId) {
                throw new APIerrorHandler(500, "Something went wrong while registering user!")
            }

            const tokenCode = generateToken();

            await new Token({
                user: getRecentlyCreatedUserFromDBbyId._id,
                code: tokenCode,
                purpose: "To Verify Email Address",
            }).save();

            userEmail = getRecentlyCreatedUserFromDBbyId.email;
            secretCode = tokenCode;

            console.log("Sending Verification Email..");
            await sendEmail(userEmail, emailSubject, emailBody);

            // if user is created, return response
            return res.status(201)
                            .json(
                                new APIresponseHandler(
                                    201,
                                    getRecentlyCreatedUserFromDBbyId,
                                    `Thank you for registering ${firstName} ${lastName}, 
                                    \nAn Email sent to your email : ${email}, please verify.`
                                )
                            )

        } catch (error) {
            console.log(error)
            throw new APIerrorHandler(400, "Somehing went wrong while creating your account!");

        }

    }
);

// controller for token email verification
const verifyAccountViaEmail = asyncHandlerWithPromise(
    async(req, res) => {
        try {

            const userID = req.params;
            if (!userID) {
                throw new APIerrorHandler(400, "Invalid Request");
            };

            const userToken = req.body;
            if (!userToken) {
                throw new APIerrorHandler(400, "Please enter the code sent via email!")
            }

            const user = await User.findOne(userID);
            if (!user) {
                throw new APIerrorHandler(400, "Invalid Request");     
            };

            const token = await Token.findOne({
                user: user._id,
                code: userToken
            });

            if (!token) {
                throw new APIerrorHandler(400, "Invalid Token")
            };

            const updatedUser = await User.updateOne({
                _id: user._id,
                verified: true
            });

             await Token.updateOne({
                _id: token.id,
                used: true
            });

            return res.status(200)
                            .json(
                                new APIresponseHandler(
                                    200,
                                    updatedUser,
                                    "Your Account has been verified successfully."
                                )
                            )

        } catch (error) {
            res.status(400)
                .json({
                    message: "Ann error occured!"
                })
        }
    }
);

// User controller for login
const loginUser = asyncHandlerWithPromise(
    async(req, res) => {
        // TODO: to write user-login controller with proper error handling
    }
);

// User controller for logout
const logoutUser = asyncHandlerWithPromise(
    async(req, res) => {
        // TODO: to write user-logout controller with proper error handling
    }
);

// User controller to get current logged in user
const getCurrentLoggedInUser = asyncHandlerWithPromise(
    async(req, res) => {
        //TODO: get current logged-in user
    }
);

// User controller to update user details
const updateUserDetails = asyncHandlerWithPromise(
    async(req, res) => {
        //TODO: update user details.
    }
);

// User controller to update profile picture
const updateUserProfilePicture = asyncHandlerWithPromise(
    async(req, res) => {
        //TODO: update user profile picture.
    }
);

// User controller to update cover image
const updateUserCoverImage = asyncHandlerWithPromise(
    async(req, res) => {
        //TODO: update user cover image.
    }
);

// User controller to get user's view history
const getUserViewHistory = asyncHandlerWithPromise(
    async(req, res) => {
        //TODO: get user item view history
    }
);

// User controller to get user Analytics report
const getUserAnalytics = asyncHandlerWithPromise(
    async(req, res) => {
        //TODO: get user analytics report
    }
);

// User controller to get user's activity log
const getUserAactivityLog = asyncHandlerWithPromise(
    async(req, res) => {
        //TODO: get user activity log
    }
);

// User controller to delete user
const deleteUserProfile = asyncHandlerWithPromise(
    async(req, res) => {
        //TODO: delete user profile.
    }
);

// User controller to regenerate user's access-token
const regenerateAccessToken = asyncHandlerWithPromise(
    async(req, res) => {
        //TODO: regenerate accesstoken after token expiry
    }
);

// User controller to change current password
const changePassword = asyncHandlerWithPromise(
    async(req, res) => {
        //TODO: change password for user
    }
);




export { registerUser, 
            loginUser,
            logoutUser,
            verifyAccountViaEmail,
            getCurrentLoggedInUser,
            updateUserDetails,
            updateUserProfilePicture,
            updateUserCoverImage,
            getUserViewHistory,
            getUserAnalytics,
            getUserAactivityLog,
            deleteUserProfile,
            regenerateAccessToken,
            changePassword
        }