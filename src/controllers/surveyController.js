const {submitSurvey} = require('../models/surveyModel');

async function handleSubmission(req, res){
    try{
        const respondentId = await submitSurvey(req.body);
        res.status(201).json({message: 'Survey submitted successfully', respondentId});
    }catch (err){
        console.error('Error submitting survey:', err); // still log full error
        res.status(500).json({
            error: 'Survey submission failed',
            details: err.message // 👈 helpful for debugging
        });
    }
}

// Export the controller function for use in routes
module.exports = {
    handleSubmission
};