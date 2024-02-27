import { Router } from 'express';

import { 
    createRepository,
    getAllRepositories,
    getRepositoryByID,
    getRepositoriesUploadedByTheUser,
    updateRepository,
    updateRepositoryLogo,
    deleteRepository
} from '../controllers/repository.controllers.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
import { upload } from '../middlewares/multer.middlewares.js';


const router = Router();

router.use(verifyJWT);

router.route("/")
        .get(getAllRepositories)
        .get(getRepositoriesUploadedByTheUser)
        .post(createRepository);

router.route("/:repository:ID")
        .get(getRepositoryByID)
        .patch(updateRepository)
        .patch(upload.single("logo"), updateRepositoryLogo)
        .delete(deleteRepository);


export default router;