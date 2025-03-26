import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCL1yZlzosekEPpB7QeBaaAuKXdePdvYRo");

export async function transcribeAudio(audioContent: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Please transcribe this audio content and format it with proper punctuation and paragraphs. If you can't process the audio directly, please let me know.`;
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "audio/mpeg",
          data: audioContent.split(',')[1] // Remove the data URL prefix
        }
      }
    ]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Unable to transcribe audio. Please try again or contact support if the issue persists.');
  }
}

export async function analyzeTranscription(transcription: string, questions: string[]): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const analysisPromises = questions.map(async (question) => {
      try {
        const prompt = `Based on this transcription: "${transcription}", please answer the following question: ${question}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        console.error(`Analysis error for question "${question}":`, error);
        return `Unable to analyze this aspect. Please try again.`;
      }
    });

    return Promise.all(analysisPromises);
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error('Unable to analyze transcription. Please try again or contact support if the issue persists.');
  }
}