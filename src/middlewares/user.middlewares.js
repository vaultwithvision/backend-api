const checkUserRoles = (requiredRole) => {
    return(req, res, next) => {

        if (!req.user) {
            res.status(401)
                .json(
                    { message: "Unauthorized" }
                )
        }

        if (req.user && req.user.role === requiredRole) {
            next();
        } else {
            res.status(403)
                .json(
                    { message: "Forbidden" }
                )
        }
        
    }
} 