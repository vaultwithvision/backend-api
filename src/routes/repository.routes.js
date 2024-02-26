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


