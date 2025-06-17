# CallQA - AI-Powered Call Analysis & Transcription

CallQA is a modern web application that transforms audio calls into actionable insights using Google's Gemini AI. It provides instant transcription, analysis, and quality assurance for better business decisions.

## Features

- **Audio Transcription**: Convert audio files to text with high accuracy
- **Smart Summarization**: Generate comprehensive summaries of call content
- **Timestamped Transcription**: Create detailed conversation breakdowns with speaker identification
- **Custom Analysis**: Answer preset questions about call content
- **Interactive Chat**: Ask questions about transcribed content
- **Dark/Light Theme**: Modern UI with theme switching
- **Data Export/Import**: Backup and restore your transcription data
- **Local Storage**: All data stored securely in your browser

## Setup Instructions

### 1. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. Add your API key to the `.env` file:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

### 2. Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the provided local URL

### 3. Production Deployment

For production deployment, you can set the environment variable directly in your hosting platform:

- **Netlify**: Add `VITE_GEMINI_API_KEY` in Site Settings > Environment Variables
- **Vercel**: Add `VITE_GEMINI_API_KEY` in Project Settings > Environment Variables
- **Other platforms**: Follow your platform's documentation for setting environment variables

## Usage

1. **Upload Audio**: Drag and drop or select an audio file (MP3, WAV, M4A, OGG, AAC, FLAC)
2. **Select Features**: Choose which processing options you want (Summary, Transcription, Analysis, etc.)
3. **Process**: Click "Process Selected Features" to analyze your audio
4. **Review Results**: View transcription, summary, analysis, and chat with the content
5. **Export Data**: Save your results for future reference

## Supported Audio Formats

- MP3
- WAV
- M4A
- OGG
- AAC
- FLAC

Maximum file size: 500MB

## Browser Extension

The project also includes a Chrome extension for analyzing audio directly from web pages. To use the extension:

1. Load the extension in Chrome Developer Mode
2. Set your API key in the extension options
3. Use the "Analyze Audio" button that appears next to audio elements on web pages

## Security

- API keys are stored as environment variables, never hardcoded
- All data is stored locally in your browser
- No data is sent to external servers except for AI processing

## Development

### Project Structure

```
src/
├── components/          # React components
├── lib/                # Utilities and API functions
├── types.ts            # TypeScript type definitions
└── App.tsx             # Main application component
```

### Key Technologies

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Google Generative AI** for transcription and analysis
- **Lucide React** for icons
- **React Dropzone** for file uploads

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue on the GitHub repository.