const { Comment, User } = require('../models');

// @desc    Get all comments for an article
// @route   GET /api/comments/:articleId
// @access  Public
const getComments = async (req, res) => {
  try {
    const { articleId } = req.params;

    const comments = await Comment.findAll({
      where: { articleId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: { 
        comments,
        count: comments.length
      }
    });

  } catch (error) {
    console.error('❌ Get Comments Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments'
    });
  }
};

// @desc    Post a new comment
// @route   POST /api/comments
// @access  Private
const postComment = async (req, res) => {
  try {
    const { articleId, content } = req.body;

    if (!articleId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Article ID and content are required'
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot be empty'
      });
    }

    const comment = await Comment.create({
      articleId,
      userId: req.user.id,
      content: content.trim()
    });

    const newComment = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Comment posted successfully',
      data: { comment: newComment }
    });

  } catch (error) {
    console.error('❌ Post Comment Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error posting comment'
    });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (only owner)
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    await comment.destroy();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete Comment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment'
    });
  }
};

// @desc    Like a comment
// @route   POST /api/comments/:id/like
// @access  Private
const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    await comment.increment('likes');

    res.status(200).json({
      success: true,
      message: 'Comment liked',
      data: { likes: comment.likes + 1 }
    });

  } catch (error) {
    console.error('❌ Like Comment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking comment'
    });
  }
};

module.exports = {
  getComments,
  postComment,
  deleteComment,
  likeComment
};