import jwt from 'jsonwebtoken';
import { asyncHandlerWithPromise } from '../utils/asyncHandler';
import { APIerrorHandler } from '../utils/APIerrorHandler';
import { User } from '../models/user.models';


export const verifyJWT = asyncHandlerWithPromise(
    async(req, res, next) => {
        try {
            const token = req.cookies?.access-token || req.header("Authorization")?.replace("Bearer ", "");
            if (!token) {
                throw new APIerrorHandler(401, "Unauthorized request");
            }

            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            const user = await User.findById(decodedToken?._id).select(
                "-password -refreshToken"
            );

            if (!user) {
                throw new APIerrorHandler(401, "Invalid Access Token");
            }

            req.user = user;
            next();

        } catch (error) {
            throw new APIerrorHandler(401, error?.message || "Invalid access token")
        }
    }
)