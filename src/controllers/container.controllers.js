import mongoose from "mongoose";
import jwt from 'jsonwebtoken';

import { Container } from '../models/container.models.js';

import { asyncHandlerWithPromise } from '../utils/asyncHandler.js';
import { APIerrorHandler } from '../utils/APIerrorHandler.js';
import { APIresponseHandler } from '../utils/APIresponseHandler.js';
import { uploadOnCloudinary } from '../utils/uploadTocloudinary.js';



// create a Container
const createContainer = asyncHandlerWithPromise(
    async(req, res) => {
        try {
            const { title, description } = req.body;
    
            if (
                [title, description].some((field) => field?.trim() === "")
            ) {
                throw new APIerrorHandler(400, "You need to pass some data to create a container.");
            }
    
            const container = await Container.create({ 
                title, 
                description,
                owner: req.user._id,
                submitters: [ req.user._id],
                admins: [req.user._id]
             }); 
    
            if (!container) {
                throw new APIerrorHandler(400, "Unable To Create Container Due to some reason!");
            }
    
            const createdContainer = await Container.findById(container._id);
    
            return res.status(201)
                            .json(
                                new APIresponseHandler(
                                    201,
                                    createdContainer,
                                    "Container has been created successfully."
                                )
                            )
        } catch (error) {
            throw new APIerrorHandler(400, error.message);
        }

    }
);

// get the list of all Containers
const getAllContainers = asyncHandlerWithPromise(
    async(req, res) => {

    }
);

// get a single Container by ID
const getContainerByID = asyncHandlerWithPromise(
    async(req, res) => {
        try {
            const containerID = req.params;
    
            if (!containerID) {
                throw new APIerrorHandler(400, "Invalid Request");
            }
    
            const container = await Container.findById(containerID);
    
            if (!container) {
                throw new APIerrorHandler(400, "Unable to find container")
            }
    
            return res.status(200)
                            .json(
                                new APIresponseHandler(
                                    200,
                                    container,
                                    "Container details fetched successfully."
                                )
                            )
        } catch (error) {
            throw new APIerrorHandler(400, error.message);
        }

    }
);

// get ContainersUploadedByTheUser
const geyContainersUploadedByTheUser = asyncHandlerWithPromise(
    async(req, res) => {
        try {
            const user = req.user;
    
            const containers = await Container.find( { owner: user._id });
    
            if (!containers || containers.length === 0) {
                throw new APIerrorHandler(400, "No containers uploaded by the user.");
            }
    
            return res.status(200)
                            .json(
                                new APIresponseHandler(
                                    200,
                                    containers,
                                    "Containers uploaded by the user fetched successfuly."
                                )
                            )
        } catch (error) {
            throw new APIerrorHandler(400, error.message);
        }

    }
);

// update a Container details
const updateContainer = asyncHandlerWithPromise(
    async(req, res) => {

        try {
            const containerID = req.params;
            const { title, description } = req.body;
    
            if (!containerID) {
                throw new APIerrorHandler(400, "Invalid Request");
            }
    
            if (
                [title, description].some((field) => field.trim() === "")
            ) {
                throw new APIerrorHandler(400, "You need to pass valid data to update.");
            }
    
            const  container = await Container.findByIdAndUpdate(
                containerID,
                {
                    $set: {
                        title,
                        description
                    }
                },
                {new: true}
            );
            
            if (!container) {
                throw new APIerrorHandler(400, "Unable to find that container in DB");
            }
    
            return res.status(200)
                            .json(
                                new APIresponseHandler(
                                    200,
                                    container,
                                    "Container details has been updated successfully"
                                )
                            )
        } catch (error) {
            throw new APIerrorHandler(400, error.message);
        }

    }
);

// update Container Logo
const updateContainerLogo = asyncHandlerWithPromise(
    async (req, res) => {
        const containerID = req.params;
        const logoLocalPath = req.file?.path;

        if (!logoLocalPath) {
            throw new APIerrorHandler(400, "Logo file is required!");
        }

        const logo = await uploadOnCloudinary(logoLocalPath);

        if (!logo.url) {
            throw new APIerrorHandler(400, "Error while uploading logo!");
        }

        const container = await Container.findByIdAndUpdate(
            containerID,
            {
                $set: {
                    logo: logo.url
                }
            },
            {new: true}
        );

        return res.status(200)
                        .json(
                            new APIresponseHandler(
                                200,
                                container,
                                "Logo for the Container has been updated successfuly."
                            )
                        )
    }
);

// delete Container by ID
const deleteContainer = asyncHandlerWithPromise(
    async(req, res) => {
        const containerID = req.params;

        if (!containerID) {
            throw new APIerrorHandler(400, "Invalid Request");
        }

        await Container.findByIdAndDelete(containerID);

        return res.status(200)
                        .json(
                            new APIresponseHandler(
                                200,
                                {},
                                "Container has been deleted successfully."
                            )
                        )

    }
);



export  {
    createContainer,
    getAllContainers,
    getContainerByID,
    geyContainersUploadedByTheUser,
    updateContainer,
    updateContainerLogo,
    deleteContainer
}