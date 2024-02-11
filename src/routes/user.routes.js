import { Router } from 'express';
import { registerUser, 
    verifyAccountViaEmail,
    loginUser,
    logoutUser,
    regenerateAccessToken,
    forgotPassword,
    getCurrentLoggedInUser,
    updateUserDetails,
    updateUserProfilePicture,
    updateUserCoverImage,
    deleteUserProfile, 
} from '../controllers/user.controllers.js';
import { upload } from '../middlewares/multer.middlewares.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';


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

// user login route
router.route("/user/login").post(loginUser);

//secured routes
router.route("/user/verify-email/id?:userId").post(verifyJWT, verifyAccountViaEmail);
router.route("/user/logout").post(verifyJWT, logoutUser);
router.route("/user/regenerate-token").post(regenerateAccessToken);
router.route("/user/forgot-password").post(verifyJWT, forgotPassword);
router.route("/user/profile-detais").get(verifyJWT, getCurrentLoggedInUser);
router.route("/user/update-profile-details").patch(verifyJWT, updateUserDetails);
router.route("/user/update-profilePicture").patch(
    verifyJWT,
    upload.single("profilePicture"),
    updateUserProfilePicture
);
router.route("/user/update-coverImage").patch(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
);
router.route("/user/delete-user/id?:userId").delete(verifyJWT,deleteUserProfile);


export default router;