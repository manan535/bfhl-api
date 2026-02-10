require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const EMAIL = process.env.EMAIL || 'firstname.lastname@chitkara.edu.in';

app.use(cors());
app.use(express.json());

// Helper Functions
const getFibonacci = (n) => {
    if (typeof n !== 'number' || n < 0) return null; // Invalid input handling
    if (n === 0) return [];
    if (n === 1) return [0];
    const sequence = [0, 1];
    while (sequence.length < n) {
        sequence.push(sequence[sequence.length - 1] + sequence[sequence.length - 2]);
    }
    return sequence;
};

const isPrime = (num) => {
    if (typeof num !== 'number' || num < 2 || !Number.isInteger(num)) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
};

const getGCD = (a, b) => {
    return b === 0 ? a : getGCD(b, a % b);
};

const getLCM = (a, b) => {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / getGCD(a, b);
};

const calculateLCM = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    if (!arr.every(num => typeof num === 'number' && Number.isInteger(num))) return null;
    let result = arr[0];
    for (let i = 1; i < arr.length; i++) {
        result = getLCM(result, arr[i]);
    }
    return result;
};

const calculateHCF = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    if (!arr.every(num => typeof num === 'number' && Number.isInteger(num))) return null;
    let result = arr[0];
    for (let i = 1; i < arr.length; i++) {
        result = getGCD(result, arr[i]);
    }
    return result;
};

// POST /bfhl Endpoint
app.post('/bfhl', async (req, res) => {
    try {
        const bodyKeys = Object.keys(req.body);
        
        // Define allowed keys
        const allowedKeys = ['fibonacci', 'prime', 'lcm', 'hcf', 'AI'];
        
        // Filter input to find which valid key is present
        const presentKeys = bodyKeys.filter(key => allowedKeys.includes(key));

        // Requirement: "Each request will contain exactly one of"
        // Also need to allow for cases where body might contain other junk, strictly speaking validation usually implies rejection of invalid schemas. 
        // But the requirement says "Each request will contain exactly one of...". 
        // Let's enforce that exactly one valid operation key is present.
        
        if (presentKeys.length !== 1) {
            return res.status(400).json({
                is_success: false,
                official_email: EMAIL,
                message: "Request must contain exactly one valid operation key: fibonacci, prime, lcm, hcf, or AI."
            });
        }

        const operation = presentKeys[0];
        const value = req.body[operation];
        let resultData;

        switch (operation) {
            case 'fibonacci':
                if (!Number.isInteger(value)) {
                    throw new Error('Input for fibonacci must be an integer.');
                }
                resultData = getFibonacci(value);
                break;
            
            case 'prime':
                if (!Array.isArray(value)) {
                    throw new Error('Input for prime must be an array of integers.');
                }
                // Filter specifically for numbers that are prime
                resultData = value.filter(isPrime);
                break;

            case 'lcm':
                if (!Array.isArray(value)) {
                    throw new Error('Input for lcm must be an array of integers.');
                }
                resultData = calculateLCM(value);
                break;

            case 'hcf':
                if (!Array.isArray(value)) {
                    throw new Error('Input for hcf must be an array of integers.');
                }
                resultData = calculateHCF(value);
                break;

            case 'AI':
                if (typeof value !== 'string') {
                    throw new Error('Input for AI must be a string.');
                }
                
                if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
                     throw new Error('Server misconfiguration: Gemini API Key is missing.');
                }

                try {
                    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;
                    const prompt = `Answer the following question in a single word: ${value}`;
                    
                    const aiResponse = await axios.post(geminiUrl, {
                        contents: [{ parts: [{ text: prompt }] }]
                    });

                    // Extract text from Gemini response structure
                    const candidate = aiResponse.data.candidates[0];
                    if (candidate && candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                        // Trim potential newlines or spaces
                        resultData = candidate.content.parts[0].text.trim();
                        
                        // Ensure single word (removing trailing punctuation if AI added it)
                        resultData = resultData.split(/\s+/)[0]; 
                    } else {
                        throw new Error('No response from AI model.');
                    }
                } catch (aiError) {
                    console.error('AI API Error:', aiError.response ? aiError.response.data : aiError.message);
                    return res.status(503).json({
                        is_success: false,
                        official_email: EMAIL,
                        message: "AI Service unavailable or returned error."
                    });
                }
                break;
        }

        if (resultData === null) {
             return res.status(400).json({
                is_success: false,
                official_email: EMAIL,
                message: "Invalid input values for the selected operation."
            });
        }

        res.json({
            is_success: true,
            official_email: EMAIL,
            data: resultData
        });

    } catch (error) {
        // Log the error message but avoid full stack trace for validation errors
        console.log(`[Handled Error] ${error.message}`);
        res.status(400).json({
            is_success: false,
            official_email: EMAIL,
            message: error.message || "Invalid Request"
        });
    }
});

// GET /health Endpoint
app.get('/health', (req, res) => {
    res.json({
        is_success: true,
        official_email: EMAIL
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
