const express = require('express');
const surveyRoutes = require('./src/routes/surveyRoutes');

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

app.use('/api', surveyRoutes); // Use the survey routes
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});