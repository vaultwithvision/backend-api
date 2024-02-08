import { Router } from 'express';
import { registerUser, verifyAccountViaEmail } from '../controllers/user.controllers.js';
import { upload } from '../middlewares/multer.middlewares.js';


const router = Router();


router.route("/user/register").post(
    upload.fields([
        {
            name: "profilePicture",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/user/verify-email/id?:userId").post(verifyAccountViaEmail);


export default router;