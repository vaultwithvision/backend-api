import { Router } from 'express';

import { 
    createContainer,
    getAllContainers,
    getContainerByID,
    getContainersUploadedByTheUser,
    updateContainer,
    updateContainerLogo,
    deleteContainer
} from '../controllers/container.controllers.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
import { upload } from '../middlewares/multer.middlewares.js'



const router = Router();

// To apply verifyJWT middleware to all routes.
router.use(verifyJWT);

// routes for Container
router.route("/")
        .get(getAllContainers)
        .post(createContainer)

router.route("/:containerID")
        .get(getContainerByID)
        .get(getContainersUploadedByTheUser)
        .patch(updateContainer)
        .patch(upload.single("logo"), updateContainerLogo)
        .delete(deleteContainer);


export default router;