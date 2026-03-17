const { Router } = require('express');
const { verifyJWT, verifyAdmin } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/multer.middleware');
const {
    addCricketer,
    getAllCricketers,
    updateCricketer,
    deleteCricketer,
    toggleCricketerStatus
} = require('../controllers/admin.controller');

const router = Router();

// All admin routes require authentication and admin privileges
router.use(verifyJWT);
router.use(verifyAdmin);

// API endpoints
router.route('/cricketers').get(getAllCricketers);
router.route('/cricketers').post(upload.single('hiddenImage'), addCricketer);
router.route('/cricketers/:id').patch(upload.single('hiddenImage'), updateCricketer);
router.route('/cricketers/:id').delete(deleteCricketer);
router.route('/cricketers/:id/toggle-status').patch(toggleCricketerStatus);

module.exports = router;
