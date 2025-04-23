require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/form', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
});

app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, 'results.html'));
});

app.post('/predict', async (req, res) => {
    try {
        const userData = req.body;
        
        // Prepare prompt for Gemini API
        const prompt = `Predict cardiovascular disease risk based on these factors:
        - Age: ${userData.age} years
        - Gender: ${userData.gender}
        - Blood Pressure: ${userData.systolic}/${userData.diastolic} mmHg
        - Total Cholesterol: ${userData.cholesterol} mg/dL
        - HDL Cholesterol: ${userData.hdl} mg/dL
        - Smoker: ${userData.smoker ? 'Yes' : 'No'}
        - Diabetes: ${userData.diabetes ? 'Yes' : 'No'}
        - Family History: ${userData.family_history ? 'Yes' : 'No'}

        Provide the risk level (Low, Medium, High), confidence score (0-1), 
        a brief description, and 3-5 specific recommendations. 
        Return in JSON format with these keys: 
        risk_level, confidence, description, recommendations`;

        // Call Google Gemini API
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: prompt,
                        
                    }]
                }]
            }
        );

        // Parse the response
        const geminiResponse = response.data.candidates[0].content.parts[0].text;
        const result = parseGeminiResponse(geminiResponse);

        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Failed to process your request',
            details: error.message
        });
    }
});

function parseGeminiResponse(text) {
    try {
        // Try to parse as JSON directly
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;
        const jsonString = text.slice(jsonStart, jsonEnd);
        return JSON.parse(jsonString);
    } catch (e) {
        // Fallback to mock data if parsing fails
        console.warn('Failed to parse Gemini response, using mock data');
        return {
            risk_level: "Medium",
            confidence: 0.75,
            description: "You have moderate risk of cardiovascular disease based on your health profile.",
            recommendations: [
                "Increase physical activity to at least 150 minutes per week",
                "Consider reducing saturated fat intake",
                "Monitor your blood pressure regularly",
                "Schedule annual check-ups with your doctor"
            ]
        };
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});