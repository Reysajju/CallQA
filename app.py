from flask import Flask, render_template, request, redirect, url_for, send_file
from werkzeug.utils import secure_filename
import os
import time
from threading import Thread
from vosk import Model, KaldiRecognizer
import wave

# Initialize Flask app
app = Flask(__name__)

# Set upload folder and allowed extensions
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp3', 'wav'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Function to check if file extension is allowed
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Function to transcribe audio file
def transcribe_audio(filepath):
    # Load pre-trained model for transcription
    model = Model("model")
    # Initialize recognizer
    recognizer = KaldiRecognizer(model, 16000)
    
    # Read audio file
    wf = wave.open(filepath, "rb")
    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getcomptype() != "NONE":
        return "Audio file must be mono WAV format."
    
    # Start recognition process
    recognizer.SetWords(True)
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        recognizer.AcceptWaveform(data)
    result = recognizer.FinalResult()
    
    return result["text"]

# Route for home page
@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # Check if the post request has the file part
        if 'file' not in request.files:
            return redirect(request.url)
        file = request.files['file']
        # If user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            return redirect(request.url)
        if file and allowed_file(file.filename):
            # Save the file to the upload folder
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            # Start transcription process in a separate thread
            t = Thread(target=transcribe_and_save, args=(filepath,))
            t.start()
            # Render template with loading animation
            return render_template('loading.html')
    return render_template('index.html')

# Function to transcribe audio and save transcription to a text file
def transcribe_and_save(filepath):
    # Transcribe audio
    transcription = transcribe_audio(filepath)
    # Save transcription to a text file
    with open(filepath + '.txt', 'w') as f:
        f.write(transcription)

# Route to download transcription
@app.route('/download/<filename>')
def download_file(filename):
    return send_file(filename, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
