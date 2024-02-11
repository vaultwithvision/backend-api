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
                            );

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

        try {
            // get the data from req.body
            const { email, password } = req.body;
    
            // check for the email existance
            if (!email) {
                throw new APIerrorHandler(400, "Email is required to login!");
            };
    
            // find the user by email
            const user = await User.findOne(
                { $or: [ {email}] }
            );
            if (!user) {
                throw new APIerrorHandler(404, "User does not exist. Please Register first and then try to login.")
            };
    
            // check password for the user
            const isCorrectPassword = user.verifyPassword(password);
            if (!isCorrectPassword) {
                throw new APIerrorHandler(401, "Invalid user credentials!");
            };
    
            // generate refreshToken and accessToken for the user
            const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    
            // getting logged-in user details from the DB
            const loggedInUser = await User.findById(user._id).select(
                "-password -refreshToken"
            );
    
            // send the access and refresh token by cookie
            const options = {
                httpOnly: true,
                secure: true
            };
            
            // sending response 
            return res.status(200)
                            .cookie("access-token", accessToken, options)
                            .cookie("refresh-token", refreshToken, options)
                            .json(
                                new APIresponseHandler(
                                    200,
                                    {
                                        user: loggedInUser, accessToken, refreshToken
                                    },
                                    "Successfully logged-in the user."
                                )
                            );
        } catch (error) {
            throw new APIerrorHandler(400, "Unable to login!")
        }

    }
);

// User controller for logout
const logoutUser = asyncHandlerWithPromise(
    async(req, res) => {
        
        try {
            // getting userId from req.user
            const userId = req.user._id;
    
            // finding the requesting user from DB by Id
            await User.findByIdAndUpdate(
                userId,
                {
                    // without changing the value this removes the field from the mongoDB document.
                    $unset: {
                        refreshToken: 1
                    }
                }, { new: true }
            );
    
            // setting token options
            const options = {
                httpOnly: true, 
                secure: true
            };
    
            //sending response
            return res.status(200)
                            .clearCookie("access-token", options)
                            .clearCookie("refresh-token", options)
                            .json(
                                new APIerrorHandler(
                                    200, 
                                    {},
                                    "User LoggedOut Successfully.."
                                )
                            );
        } catch (error) {
            throw new APIerrorHandler(400, "Unable to logged you out!")
        }
    }
);

// User controller to get current logged in user
const getCurrentLoggedInUser = asyncHandlerWithPromise(
    async(req, res) => {
        
        try {
            // getting user-id from req.user
            const userId = req.user._id;
    
            // getting the user from DB 
            const user = await User.findOne(userId).select(
                "-password refreshToken"
            );
    
            // sending response 
            return res.status(200)
                            .json(
                                new APIresponseHandler(
                                    200,
                                    user,
                                    "User account fetched successfully"
                                )
                            );
        } catch (error) {
            throw new APIerrorHandler(400, "Unable to get the user!")
        }

    }
);

// User controller to update user details
const updateUserDetails = asyncHandlerWithPromise(
    async(req, res) => {
        
        try {
            // get details from req.body
            const { email, firstName, lastName } = req.body
            // getting userID from request
            const userID = req.user?._id
    
            // checking for the userID
            if (!userID) {
                throw new APIerrorHandler(400, "Invalid Request!")
            }
    
            // checking for user-input
            if (
                [email, firstName, lastName].some((field) => field.trim() === "")
            ) {
                throw new APIerrorHandler(400, "All the fields are required!")
            }
    
            // getting user from DB and updating 
            const  user = await User.findByIdAndUpdate(
                userID,
                {
                    $set: {
                        email, 
                        firstName,
                        lastName
                    }
                },
                { new: true }
            ).select("-password -refreshToken");
    
            // sending response 
            return res.status(200)
                            .json(
                                new APIresponseHandler(
                                    200,
                                    user,
                                    "Account details has been updated successfully."
                                )
                            );
        } catch (error) {
            throw new APIerrorHandler(400, "Unable to update profile.")
        }

    }
);

// User controller to update profile picture
const updateUserProfilePicture = asyncHandlerWithPromise(
    async(req, res) => {
        
        try {
            // getting userId from request
            const userID = req.user?._id
    
            // getting locally uploaded file path
            const profilePictureLocalPath = req.file?.path
            // checking for the existance of the fle path
            if (!profilePictureLocalPath) {
                throw new APIerrorHandler(400, "File is missing!")
            } 
    
            // uploading file on Cloudinary
            const profilePicture = await uploadOnCloudinary(profilePictureLocalPath);
            // checking for the file uploading
            if (!profilePicture) {
                throw new APIerrorHandler(400, "Error while uploading your profile picture!")
            }
    
            // uploading profilePicture of the user-profile in DB
            const user = await User.findByIdAndUpdate(
                userID,
                {
                    $set: {
                        profilePicture: profilePicture?.url
                    }
                },
                { new : true }
            ).select("-password -refreshToken");
    
            // sending response
            return res.status(200)
                            .json(
                                new APIresponseHandler(
                                    200,
                                    user,
                                    "Profile Picture has been updated successfully."
                                )
                            );
        } catch (error) {
            throw new APIerrorHandler(400, "Unable to update profile picture!")
        }

    }
);

// User controller to update cover image
const updateUserCoverImage = asyncHandlerWithPromise(
    async(req, res) => {
        
        try {
            // getting userId from request
            const userID = req.user?._id
    
            // getting locally uploaded file path
            const coverImageLocalPath = req.file?.path
            // checking for the existance of the fle path
            if (!coverImageLocalPath) {
                throw new APIerrorHandler(400, "File is missing!")
            } 
    
            // uploading file on Cloudinary
            const coverImage = await uploadOnCloudinary(coverImageLocalPath);
            // checking for the file uploading
            if (!coverImage) {
                throw new APIerrorHandler(400, "Error while uploading your Cover image!")
            }
    
            // uploading coverImage of the user-cover-image in DB
            const user = await User.findByIdAndUpdate(
                userID,
                {
                    $set: {
                        coverImage: coverImage?.url
                    }
                },
                { new : true }
            ).select("-password -refreshToken");
    
            // sending response
            return res.status(200)
                            .json(
                                new APIresponseHandler(
                                    200,
                                    user,
                                    "Cover Image has been updated successfully."
                                )
                            );
        } catch (error) {
            throw new APIerrorHandler(400, "Unable to update cover image!")
        }

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
        
        try {
            // getting user id from req
            const userID = req.user._id;
            // getting password from req-body
            const { password, confirmPassword } = req.body;
    
            //checking for the user request
            if (!userID) {
                throw new APIerrorHandler(400, "Invalid Request");
            }
    
            //checking for the req-body data
            if (
                [password, confirmPassword].some((field) => field.trim() === "")
            ) {
                throw new APIerrorHandler(400, "Please enter your password and confirm password to delete your account!");
            }
    
            //checking for password and confirmPassword is matching or not
            if (password !== confirmPassword) {
                throw new APIerrorHandler(400, "Your password and confirm password doesn't match.");
            }
    
            // getting user from DB
            const user = await User.findById(userID);
            // checking for the user
            if (!user) {
                throw new APIerrorHandler(400, "Unable to get user from DB");
            }
    
            // checking for the user password
            const isPasswordValid = await user.verifyPassword(password);
            //throwing error if the password is wrong
            if (!isPasswordValid) {
                throw new APIerrorHandler(400, "Wrong Credential!");
            }
    
            //deleting user from DB
            await User.findByIdAndDelete(userID);
            
            //setting options
            const options = {
                httpOnly: true,
                secure: true
            }
    
            // sending response 
            return res.status(200)
                            .clearCookie("access-token", options)
                            .clearCookie('refresh-token', options)
                            .json(
                                new APIresponseHandler(
                                    200,
                                    null,
                                    "User account deleted successfully."
                                )
                            );
        } catch (error) {
            throw new APIerrorHandler(400, "Unable to delete user!")
        }

    }
);

// User controller to regenerate user's access-token
const regenerateAccessToken = asyncHandlerWithPromise(
    async(req, res) => {
        
        try {
            //getting the refresh-token from cookies or req-body
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
            //checking for the refreshToken
            if (!refreshToken) {
                throw new APIerrorHandler(401, "Unauthorized Request");
            }
    
            //decoding the refreshToken
            const decodedToken = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET
            );
    
            //geting the user from DB
            const user = await User.findById(decodedToken?._id);
            //checking for the user
            if (!user) {
                throw new APIerrorHandler(400, "Invalid Refresh Token!");
            }
    
            // matching the token with DB 
            if (refreshToken !== user?.refreshToken) {
                throw new APIresponseHandler(401, "Refresh toen is expired or invaid");
            }
    
            // setting options 
            const options = {
                httpOnly: true,
                secure: true
            }
    
            // generating new token for the user
            const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
    
            //sending response 
            return res.status(200)
                            .cookie("access-token", accessToken, options)
                            .cookie('refresh-token', newRefreshToken, options)
                            .json(
                                new APIresponseHandler(
                                    200,
                                    { accessToken, refreshToken },
                                    "Tokens regenerated successfully."
                                )
                            );
        } catch (error) {
            throw new APIerrorHandler(401, error?.message || "Invalid refresh token.")
        }

    }
);

// User controller to change current password
const forgotPassword = asyncHandlerWithPromise(
    async(req, res) => {
        
        try {
            // getting passwords from request-body
            const { oldPassword, newPassword, confirmPassword } = req.body
            //checking for the newPass and confirmPass
            if (newPassword !== confirmPassword) {
                throw new APIerrorHandler(400, "Your new password and confirm password doesn't match. Try Again!")
            };

            //getting the user from DB
            const user = await User.findById(req.user?.id);
            //checking for the user existance
            if (!user) {
                throw new APIerrorHandler(500, "We are unable to get your details! try after some time.")
            };

            // checking for the user password
            const isPasswordValid = await user.verifyPassword(oldPassword);
            // if the provided password is wrong throwing error
            if (!isPasswordValid) {
                throw new APIerrorHandler(400, "Invalid password!")
            };

            // reseting the passsword for the user
            user.password = newPassword;
            // saving the new data to DB 
            await user.save({validateBeforeSave: false});

            // sending response
            return res.status(200)
                            .json(
                                new APIresponseHandler(
                                    200,
                                    {},
                                    "Password changed successfully."
                                )
                            )

        } catch (error) {
            throw new APIerrorHandler(400, "Unable to Change your password!")
        }
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
            forgotPassword
    }