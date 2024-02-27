import { Router } from 'express';

import { 
    getAlldocuments,
    uploadDocument,
    getDocumentByID,
    getDocumentsUploadedByTheUser,
    updateDocument,
    deleteDocument
 } from '../controllers/document.controllers.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
import { upload } from '../middlewares/multer.middlewares.js'
import router from './container.routes';


const router = Router();
router.use(verifyJWT);


router.route("/")
        .get(getAlldocuments)
        .get(getDocumentsUploadedByTheUser)
        .post(
            upload.fields([
                {
                    name: "logo"
                }
            ]),
            uploadDocument
        );

router.route("/:documentID")
            .get(getDocumentByID)
            .patch(updateDocument)
            .delete(deleteDocument)