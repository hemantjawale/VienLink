import express from 'express';
import { authorize } from '../middleware/auth.middleware.js';
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

// @route   POST /api/chatbot/chat
// @desc    Send message to AI chatbot using Google GenAI SDK
// @access  Public
router.post('/chat', async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty',
      });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Chatbot service is not configured',
      });
    }

    // Initialize Google GenAI
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a helpful assistant for Vien Link Blood Bank Management System. Provide helpful information about blood banking, donations, blood inventory management, and the features of the system. Be concise and professional.\n\nUser question: ${message}`,
    });

    const aiMessage = response.text || 'Sorry, I could not generate a response.';

    res.json({
      success: true,
      data: {
        message: aiMessage,
      },
    });
  } catch (error) {
    console.error('Chatbot Error:', error);
    next(error);
  }
});

export default router;
