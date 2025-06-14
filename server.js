const express = require('express');
const pool = require('./src/config/database');
const app = express();

app.use(express.json()); // Middleware to parse JSON bodies

//test connection route
app.get('/test', async (req, res) => {
    try {
        const results = await pool.query('SELECT NOW()');
        res.json({ message: 'Database connection successful', server_time: results.rows[0].now });
    }catch (error){
        console.error('Database connection error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// API Route to Submit Survey Data

app.post('/api/submit-survey', async (req, res) => {
    const client = await pool.connect(); //get client from the pool

    try{
        await client.query('BEGIN'); //start a transaction for atomicity

        // 1. Insert into respondents table
        const respondentInsertQuery = `
            INSERT INTO respondents (full_name, email, contact_no, date_of_birth, age)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `;
        const respondentResult = await client.query(
            respondentInsertQuery,
            [
                req.body.full_name,
                req.body.email,
                req.body.contact_no,
                req.body.date_of_birth,
                req.body.age
            ]
        );
        const respondentId = respondentResult.rows[0].id;
        console.log(`Inserted respondent with ID: ${respondentId}`);

        // 2. Insert into favorite_foods table (if any)
        if (req.body.favorite_foods && Array.isArray(req.body.favorite_foods) && req.body.favorite_foods.length > 0) {
            const foodInsertPromises = req.body.favorite_foods.map(food => {
                return client.query(
                    `INSERT INTO favorite_foods (respondent_id, food_name) VALUES ($1, $2);`,
                    [respondentId, food]
                );
            });
            await Promise.all(foodInsertPromises);
        }

        // 3. Insert into lifestyle_rating table
        const ratingsInsertQuery = `
            INSERT INTO lifestyle_rating (respondent_id, watch_movie, listen_radio, eat_out, watch_tv)
            VALUES ($1, $2, $3, $4, $5);
        `;
        await client.query(ratingsInsertQuery, [
            respondentId,
            req.body.lifestyle_rating.watch_movie,
            req.body.lifestyle_rating.listen_radio,
            req.body.lifestyle_rating.eat_out,
            req.body.lifestyle_rating.watch_tv
        ]);

        await client.query('COMMIT'); // Commit the transaction
        res.status(201).json({ message: 'Survey data submitted successfully', respondentId });
    }catch(error){
        await client.query('ROLLBACK'); // Rollback the transaction in case of error
        console.error('Error submitting survey data:', error);
        res.status(500).json({ error: 'Failed to submit survey data', details: error.message });
    }finally{
        client.release(); // Always release the client back to the pool
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Test survey submission by sending a POST request to http://localhost:${PORT}/api/submit-survey`);
});