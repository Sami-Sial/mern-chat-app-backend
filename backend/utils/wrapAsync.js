function asyncErrorHandler(fnx) {
    return function (req, res, next) {
        fnx(req, res, next).catch((err) => next(err));
    }
}  

module.exports = asyncErrorHandler;