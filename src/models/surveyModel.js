// This file handles the survey submission logic using Prisma ORM

// Import the Prisma client instance for database access
const prisma = require('../prismaClient');


//calculate respondent age
function calcAge(dob){
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    // Adjust age if the birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;

    }
    return age;
}
async function submitSurvey(data){
    const {
        full_name,email, contact_no,  date_of_birth, favorite_foods, lifestyle_rating
    } = data;

    const age = calcAge(date_of_birth);
    // Validate required field
    if (age < 5 || age > 120) {
        throw new Error("Age must be between 5 and 120 to participate in the survey.");
    }
     // Validate phone number (South African format - exactly 10 digits)
    if (!/^\d{10}$/.test(contact_no)) {
        throw new Error("Phone number must be exactly 10 digits (South African format).");
    }
    //Validate email (prevent duplicate participation)
    const existing = await prisma.respondents.findFirst({
        where: { email }
    });

    if (existing) {
        throw new Error("This email has already participated in the survey.");
    }
    //create a new respondent
    const respondent = await prisma.respondents.create({
        data: {
            full_name,
            email,
            contact_no,
            age,
            date_of_birth: new Date(date_of_birth),
        }
    });

    //save favorite foods 
    await prisma.favorite_foods.createMany({
        data: favorite_foods.map(food => ({
            respondent_id: respondent.id,
            food_name: food
        }))
    });

    // Prepare complete lifestyle ratings with defaults (if missing)
    const completeRatings = {
        watch_movie: parseInt(lifestyle_rating?.watch_movie) || 0,
        listen_radio: parseInt(lifestyle_rating?.listen_radio) || 0,
        eat_out: parseInt(lifestyle_rating?.eat_out) || 0,
        watch_tv: parseInt(lifestyle_rating?.watch_tv) || 0

    };
    //save lifestyle ratings
    await prisma.lifestyle_rating.create({
        data:{
            respondent_id: respondent.id,
            ...completeRatings
        }
    });

    return respondent.id;

}

module.exports = {submitSurvey};