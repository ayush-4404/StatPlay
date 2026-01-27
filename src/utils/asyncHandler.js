// const asyncHandler = (requesHandler)>{
//     return
// }

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.statusCode || 500).json({
//             success: false,
//             message: error.message || "Internal Server Error"
//         });
//     }

// }

const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err)=>next(err));
}};



module.exports = asyncHandler;