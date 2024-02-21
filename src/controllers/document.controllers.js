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
        const {} = req.body;
    }
);

// get a single Document by Id
const getDocumentByID = asyncHandlerWithPromise(
    async(req, res) => {

    }
);

// update/edit uploaded document
const updateDocument = asyncHandlerWithPromise(
    async(req, res) =>{

    }
);

// delete single document
const deleteDocument = asyncHandlerWithPromise(
    async(req, res) => {

    }
);



export default {
    getAlldocuments,
    uploadDocument,
    getDocumentByID,
    updateDocument,
    deleteDocument
}