const express = require('express');
const { handleSubmission } = require('../controllers/surveyController');
const router = express.Router();

// Define the route for survey submission
router.post('/submit', handleSubmission);

// Export the router to be used in the main app
module.exports = router;