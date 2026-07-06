const express = require('express');
const multer = require('multer');
const postController = require('../controllers/postController');

const router = express.Router();

// Configure storage limits (e.g., 5MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Pass the middleware to your POST route. 
// 'media' must match the key name used in formData.append("media", ...) on the client.
router.post('/api/posts', upload.single('media'), postController.createPost);

module.exports = router;