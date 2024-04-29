from flask import Flask, render_template, request
from pydub import AudioSegment

import whisper

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/transcribe', methods=['POST'])
def transcribe():
    # Check if a file was uploaded
    if 'file' not in request.files:
        return "No file uploaded", 400

    audio_file = request.files['file']

    # Check if the file is empty
    if audio_file.filename == '':
        return "No file selected", 400

    # Save the uploaded file
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"{timestamp}_{audio_file.filename}"
    audio_file.save(filename)

    # Load the audio file using pydub
    audio = AudioSegment.from_file(filename)

    # Extract the first 60 seconds
    audio_60_sec = audio[:60000]  # 60 seconds * 1000 milliseconds/second

    # Export the 60-second audio segment to a temporary file
    audio_60_sec.export("audio_60_sec.wav", format="wav")

    # Load the Whisper model
    model = whisper.load_model("base")

    # Transcribe the 60-second audio segment
    result = model.transcribe("audio_60_sec.wav")

    # Write the transcription to a .txt file
    output_filename = f"{timestamp}_transcription.txt"
    with open(output_filename, "w") as f:
        f.write(result["text"])

    return f"Transcription saved to {output_filename}", 200

if __name__ == '__main__':
    app.run(debug=True)
