import mongoose from "mongoose";
import jwt from 'jsonwebtoken';

import { Document } from '../models/document.models.js';

import { asyncHandlerWithPromise } from '../utils/asyncHandler.js';
import { APIerrorHandler } from '../utils/APIerrorHandler.js';
import { APIresponseHandler } from '../utils/APIresponseHandler.js';
import { uploadOnCloudinary } from '../utils/uploadTocloudinary.js';



// to get all the uploaded documents
const getAlldocuments = asyncHandlerWithPromise(
    async(req, res) => {
        
    }
);

// upload a single document
const uploadDocument = asyncHandlerWithPromise(
    async( req, res) => {

        try {
            // Extract infos from req body
            const { title, description, keywords } = req.body;
            // Extract uploaded files array from req
            const filesPathArray = req.files?.files;
    
            // Validate required fields and throw error if file is empty
            if (
                [title, description, keywords].some((field) => field.trim() === "")
            ) {
                throw new APIerrorHandler(400, "Title and Description fields are required to upload Document.");
            }
    
            // check if any files are uploaded
            if (!filesPathArray || filesPathArray.length === 0) {
                throw new APIerrorHandler(400, "You need to upload a valid Document to post.");
            }
    
            // Upload each file to cloudinary and get array of  file URLs
            const files = await Promise.all(
                filesPathArray.map( 
                    async (file) => {
                        try {
                            // Get loacl file path of requested file
                            const localFilePath = file.path;
                            // Upload file to cloudinar and get response
                            const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
                            // return URL of uploaded file
                            return cloudinaryResponse.url;
                        } catch (error) {
                            console.error("Error while uploading files to cloudinay");
                            throw new APIerrorHandler(400, "Failed to upload files to cloudinary")
                        }
                    }
                )
            );
    
            // check if the urls of the files exists
            if (!files || files.length === 0) {
                throw new APIerrorHandler(400, "Something went wrong while uploading your files, Please try again.");
            }
    
            // Create new document object in DB
            const document = await Document.create({
                title, 
                description,
                keywords,
                files: files,
    
            })
    
            // Fetch the newly created document form the DB
            const uploadedDocument = await Document.findById(document._id);
    
            // Check if document is successfully created
            if (!uploadDocument) {
                throw new APIerrorHandler(400, "Unable to add records in DB")
            }
    
            // Send success response with uploaded document
            return res.status(201)
                            .json(
                                new APIresponseHandler(
                                    201,
                                    uploadedDocument,
                                    "Document Uploaded Successfully."
                                )
                            )
        } catch (error) {
            throw new APIerrorHandler(400, error.message);
        }

    }
);

// get a single Document by Id
const getDocumentByID = asyncHandlerWithPromise(
    async(req, res) => {

        try {
            const documentID = req.params;
    
            if (!documentID) {
                throw new APIerrorHandler(400, "Invalid Request!");
            }
    
            const document = await Document.findById(documentID);
    
            if (!document) {
                throw new APIerrorHandler(400, "Unable to find requested document");
            }
    
            return res.status(200)
                            .json(
                                new APIresponseHandler(
                                    200,
                                    document,
                                    "Requested Document fetched successfully."
                                )
                            )
        } catch (error) {
            throw new APIerrorHandler(400, error.message);
        }

    }
);

// get Documents uploaded by the user
const getDocumentsUploadedByTheUser = asyncHandlerWithPromise(
    async(req, res) => {
        
        try {
            const user = req.user;
    
            if (!user) {
                throw new APIerrorHandler(400, "Invalid Request");
            }
    
            const documents = await Document.find( { owner: user._id });
    
            if (!documents || documents.length === 0) {
                throw new APIerrorHandler(404, "No documents uploaded by the user.")
            }
    
            return res.status(200)
                            .json(
                                200,
                                documents,
                                "Documents uploaded by the user fetched successfully."
                            )
        } catch (error) {
            throw new APIerrorHandler(500, error.message);
        }

    }
);

// update/edit uploaded document
const updateDocument = asyncHandlerWithPromise(
    async(req, res) =>{

        try {
            const { title, description } = req.body;
            const documentID = req.params;
    
            if (!documentID) {
                throw new APIerrorHandler(400, "Invalid Request");
            }
    
            if (
                [title, description].some((field) => field.trim() === "")
            ) {
                throw new APIerrorHandler(400, "Title and Description field is required to update a document");
            }
    
            const document = await Document.findById(documentID);
    
            if (!document) {
                throw new APIerrorHandler(400, "Unable to find the requested document in DB");
            }
    
            if (document.owner.toString() !== req.user._id.toString()) {
                throw new APIerrorHandler(403, "Unauthorized: You are not the owner of this document")
            }
    
            const updatedDocument = await Document.findByIdAndUpdate(
                documentID,
                {
                    $set: {
                        title,
                        description
                    }
                }, { new: true }
            );
    
            return res.status(200)
                            .json(
                                new APIresponseHandler(
                                    200,
                                    updatedDocument,
                                    "Document has been updated successfully."
                                )
                            )
        } catch (error) {
            throw new APIerrorHandler(400, error.message);
        }

    }
);

// delete single document
const deleteDocument = asyncHandlerWithPromise(
    async(req, res) => {

        try {
            const documentID = req.params;
    
            if (!documentID) {
                throw new APIerrorHandler(400, "Invalid Request");
            }
    
            await Document.findByIdAndDelete(documentID);
    
            return res.status(200)
                            .json(
                                new APIresponseHandler(
                                    200,
                                    {},
                                    "Document has been deleted successfully."
                                )
                            )
        } catch (error) {
            throw new APIerrorHandler(400, error.message);
        }

    }
);



export default {
    getAlldocuments,
    uploadDocument,
    getDocumentByID,
    getDocumentsUploadedByTheUser,
    updateDocument,
    deleteDocument
}