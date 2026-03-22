const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const resumeController = require('../controllers/resumeController');

router.post('/upload', upload.single('resume'), resumeController.uploadResume);
router.post('/downloadResume', resumeController.downloadResume);

module.exports = router;
