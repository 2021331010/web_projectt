const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/Auth');
const {
  getComments,
  postComment,
  deleteComment,
  likeComment
} = require('../controllers/CommentController');

// Public routes
router.get('/:articleId', getComments);

// Protected routes
router.post('/', protect, postComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, likeComment);

module.exports = router;