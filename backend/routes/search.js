const express = require('express');
const router = express.Router();

// ==========================================
// Static Topics/Pages Database
// ==========================================
const topics = [
  // Basics
  { id: 1, title: 'The Basics', category: 'basics', url: '/basics.html', keywords: ['introduction', 'fundamental', 'overview'] },
  
  // Head
  { id: 2, title: 'Head', category: 'head', url: '/head.html', keywords: ['skull', 'cranium', 'face', 'facial bones'] },
  
  // Neuroanatomy
  { id: 3, title: 'Neuroanatomy', category: 'neuroanatomy', url: '/neuroanatomy.html', keywords: ['brain', 'nervous system', 'neurons', 'cerebrum', 'cerebellum'] },
  
  // Neck
  { id: 4, title: 'Neck', category: 'neck', url: '/neck.html', keywords: ['cervical', 'throat', 'vertebrae', 'muscles'] },
  
  // Thorax
  { id: 5, title: 'Thorax', category: 'thorax', url: '/thorax.html', keywords: ['chest', 'ribs', 'sternum', 'heart', 'lungs', 'respiratory'] },
  
  // Back
  { id: 6, title: 'Back', category: 'back', url: '/back.html', keywords: ['spine', 'vertebral column', 'spinal cord', 'dorsal'] },
  
  // Upper Limb
  { id: 7, title: 'Upper Limb', category: 'upper-limb', url: '/upper-limb.html', keywords: ['arm', 'shoulder', 'elbow', 'wrist', 'hand', 'fingers', 'humerus', 'radius', 'ulna'] },
  
  // Lower Limb
  { id: 8, title: 'Lower Limb', category: 'lower-limb', url: '/lower-limb.html', keywords: ['leg', 'hip', 'knee', 'ankle', 'foot', 'femur', 'tibia', 'fibula'] },
  
  // Abdomen
  { id: 9, title: 'Abdomen', category: 'abdomen', url: '/abdomen.html', keywords: ['stomach', 'intestines', 'liver', 'digestive', 'abdominal organs'] },
  
  // Pelvis
  { id: 10, title: 'Pelvis', category: 'pelvis', url: '/pelvis.html', keywords: ['pelvic', 'hip bones', 'reproductive organs', 'bladder'] },
  
  // Additional Pages
  { id: 11, title: 'Question Bank', category: 'quiz', url: '/question-bank.html', keywords: ['questions', 'quiz', 'test', 'practice'] },
  { id: 12, title: 'Quiz', category: 'quiz', url: '/quiz.html', keywords: ['quiz', 'test', 'exam', 'assessment'] },
  { id: 13, title: 'Flashcards', category: 'flashcards', url: '/flashcards.html', keywords: ['flashcard', 'study', 'memorize', 'cards'] },
  { id: 14, title: 'Spotter', category: 'spotter', url: '/spotter.html', keywords: ['spotter', 'identify', 'image quiz'] },
  { id: 15, title: 'Leaderboards', category: 'leaderboard', url: '/leaderboards.html', keywords: ['leaderboard', 'ranking', 'scores', 'top users'] },
  { id: 16, title: 'Pricing', category: 'pricing', url: '/pricing.html', keywords: ['pricing', 'plans', 'subscription', 'cost'] }
];

// ==========================================
// GET /api/search/topics
// Search topics/pages
// ==========================================
router.get('/topics', async (req, res) => {
  console.log('🔍 GET /api/search/topics');
  
  try {
    const { q, category, limit = 10 } = req.query;

    // If no query, return all topics
    if (!q || q.trim().length === 0) {
      const filteredTopics = category 
        ? topics.filter(t => t.category === category)
        : topics;

      return res.status(200).json({
        success: true,
        data: {
          query: '',
          topics: filteredTopics.slice(0, parseInt(limit)),
          totalResults: filteredTopics.length
        }
      });
    }

    const searchTerm = q.trim().toLowerCase();
    console.log(`🔎 Searching topics for: "${searchTerm}"`);

    // Search in title, category, and keywords
    let results = topics.filter(topic => {
      const titleMatch = topic.title.toLowerCase().includes(searchTerm);
      const categoryMatch = topic.category.toLowerCase().includes(searchTerm);
      const keywordMatch = topic.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchTerm)
      );

      return titleMatch || categoryMatch || keywordMatch;
    });

    // Filter by category if provided
    if (category) {
      results = results.filter(t => t.category === category);
    }

    // Limit results
    results = results.slice(0, parseInt(limit));

    console.log(`✅ Found ${results.length} topics`);

    res.status(200).json({
      success: true,
      data: {
        query: searchTerm,
        topics: results,
        totalResults: results.length
      }
    });

  } catch (error) {
    console.error('❌ Search Topics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching topics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==========================================
// GET /api/search/suggestions
// Get search suggestions/autocomplete
// ==========================================
router.get('/suggestions', async (req, res) => {
  console.log('💡 GET /api/search/suggestions');
  
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(200).json({
        success: true,
        data: { suggestions: [] }
      });
    }

    const searchTerm = q.trim().toLowerCase();
    const searchLimit = parseInt(limit) || 5;

    // Find matching topics
    const matches = topics.filter(topic => {
      const titleMatch = topic.title.toLowerCase().includes(searchTerm);
      const keywordMatch = topic.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchTerm)
      );
      return titleMatch || keywordMatch;
    });

    // Format suggestions
    const suggestions = matches.slice(0, searchLimit).map(topic => ({
      text: topic.title,
      category: topic.category,
      url: topic.url
    }));

    res.status(200).json({
      success: true,
      data: { suggestions }
    });

  } catch (error) {
    console.error('❌ Suggestions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting suggestions'
    });
  }
});

// ==========================================
// GET /api/search/categories
// Get all available categories
// ==========================================
router.get('/categories', async (req, res) => {
  console.log('📂 GET /api/search/categories');
  
  try {
    const categories = [
      { name: 'Basics', value: 'basics', icon: '📚' },
      { name: 'Head', value: 'head', icon: '🧠' },
      { name: 'Neuroanatomy', value: 'neuroanatomy', icon: '🧬' },
      { name: 'Neck', value: 'neck', icon: '🦴' },
      { name: 'Thorax', value: 'thorax', icon: '🫀' },
      { name: 'Back', value: 'back', icon: '🏋️' },
      { name: 'Upper Limb', value: 'upper-limb', icon: '💪' },
      { name: 'Lower Limb', value: 'lower-limb', icon: '🦵' },
      { name: 'Abdomen', value: 'abdomen', icon: '🫃' },
      { name: 'Pelvis', value: 'pelvis', icon: '🦴' }
    ];

    res.status(200).json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('❌ Get Categories Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

module.exports = router;