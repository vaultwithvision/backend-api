import mongoose from "mongoose";
import jwt from 'jsonwebtoken';

import { Repository } from '../models/repository.models.js';

import { asyncHandlerWithPromise } from '../utils/asyncHandler.js';
import { APIerrorHandler } from '../utils/APIerrorHandler.js';
import { APIresponseHandler } from '../utils/APIresponseHandler.js';
import { uploadOnCloudinary } from '../utils/uploadTocloudinary.js';



// create a Repository
const createRepository = asyncHandlerWithPromise(
    async(req, res) => {
        try {
            const { title, description} = req.body;
            const user = req.user;
            const container = req.params;
    
            if (
                [title, description].some((field) => field.trim() === "")
            ) {
                throw new APIerrorHandler(400, "Title and Description is required");
            }
    
            if (!user && !container) {
                throw new APIerrorHandler(400, "Invalid Request");
            }
    
            const repository = await Repository.create(
                {
                    title,
                    description,
                    owner: user._id,
                    parentContainer: container,
                    admins: [user._id]
                }
            );
    
            if (!repository) {
                throw new APIerrorHandler(400, "Unable to create Repository.");
            }
    
            const createdRepo =  await Repository.findById((await repository)._id);
    
            return res.status(201)
                            .json(
                                new APIresponseHandler(
                                    201,
                                    createdRepo,
                                    "Repository has been created successfully..."
                                )
                            )
        } catch (error) {
            throw new APIerrorHandler(400, error.message);
        }
    }
);

// get the list of all Repositories
const getAllRepositories = asyncHandlerWithPromise(
    async(req, res) => {

    }
);

// get a single Repository
const getRepositoryByID = asyncHandlerWithPromise(
    async(req, res) => {
        try {
            
            const repoID = req.params;

            if (!repoID) {
                throw new APIerrorHandler(400, "Invalid Request!");
            }

            const repo = await Repository.findById(repoID);

            if (!repo) {
                throw new APIerrorHandler(400, "Unable to find Repository");
            }

            return res.status(200)
                            .json(
                                new APIresponseHandler(
                                    200,
                                    repo,
                                    "Repository details fetched successfully!"
                                )
                            )

        } catch (error) {
            throw new APIerrorHandler(400, error.message);
        }
    }
);

// update Repository
const updateRepository = asyncHandlerWithPromise(
    async(req, res) => {
        try {
            
            const repoID = req.params;
            const { title, description } = req.body;

            if (!repoID) {
                throw new APIerrorHandler(400, "Invalid Request");
            }

            if (
                [title, description].some((field) => field.trim() === "")
            ) {
                throw new APIerrorHandler(400, "Title and description is required!");
            }

            const repo = await Repository.findById(repoID);

            if (!repo) {
                throw new APIerrorHandler(400, "Unable to find the Repository in DB");
            }

            if (repo.owner !== req.user._id) {
                throw new APIerrorHandler(403, "Unauthorized")
            }

            const updatedRepo = await Repository.findByIdAndUpdate(
                repoID,
                {
                    $set: {
                        title,
                        description
                    }
                },
                { new: true }
            );

            return res.status(200)
                            .json(
                                new APIresponseHandler(
                                    200, 
                                    updatedRepo,
                                    "Repository has been updated successfully."
                                )
                            )

        } catch (error) {
            throw new APIerrorHandler(400, error.message);
        }
    }
);  

// update Repository Logo
const updateRepositoryLogo = asyncHandlerWithPromise(
    async(req, res) => {

        try {
            
            const repoID = req.params;
            const logoLocalPath = req.file?.path;

            if (!repoID) {
                throw new APIerrorHandler(400, "Invalid Request");
            }

            if (!logoLocalPath) {
                throw new APIerrorHandler(400, "Logo file is required!");
            }

            const logo = await uploadOnCloudinary(logoLocalPath);

            if (!logo.url) {
                throw new APIerrorHandler(400, "Error while uploading logo!");
            }

            const repo = await Repository.findByIdAndUpdate(
                repoID,
                {
                    $set: {
                        logo: logo.url
                    }
                },
                { new: true }
            );

            return res.status(200)
                            .json(
                                new APIresponseHandler(
                                    200,
                                    repo,
                                    "Logo for the Repository has been updated successfully."
                                )
                            )

        } catch (error) {
            throw new APIerrorHandler(400, error.message);
        }

    }
);

// delete Repository
const deleteRepository = asyncHandlerWithPromise(
    async(req, res) => {
        try {
            
            const repoID = req.params;

            if (!repoID) {
                throw new APIerrorHandler(400, "Invalid Request");
            }

            await Repository.findByIdAndDelete(repoID);

            return res.status(200)
                            .json(
                                new APIresponseHandler(
                                    200,
                                    {},
                                    "Repository has been deleted successfully."
                                )
                            )

        } catch (error) {
            throw new APIerrorHandler(400, error.message);
        }
    }
);


export {
    createRepository,
    getRepositoryByID,
    getAllRepositories,
    updateRepository,
    updateRepositoryLogo,
    deleteRepository
}