const asyncHandlerWithPromise = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(
            requestHandler(req, res, next))
            .catch(
                (error) => next(error)
            );
    }
}


export { asyncHandlerWithPromise }