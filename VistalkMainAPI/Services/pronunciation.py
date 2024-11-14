from flask import request, jsonify
import io
import librosa
from pydub import AudioSegment
from google.oauth2 import service_account
from google.cloud import speech
import os
import tempfile
from db import get_db_connection

def checkPronunciation():
    data = request.form
    content_id = int(data.get('contentId', 0))
    userId = int(data.get('userId', 0))
    audio_file = request.files.get('audioFile')
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT contentText from content where contentID = %s
    """
    cursor.execute(query, (content_id,))
    ctext_row = cursor.fetchone()
    ctext = ctext_row['contentText'].lower()
    
    if not audio_file:
        return jsonify({'error': 'No audio file provided'}), 400

    
    temp_audio_path = save_audio_file(audio_file)
    
    
    transcription, average_confidence = pronounciate(temp_audio_path)
    transcription = transcription.lower()
    score = 0
    if(transcription == ctext and average_confidence >= 0.75):
        score = 1
        
    insertQuery = """
        INSERT INTO pronounciationresult (userPlayerID, contentID, pronunciationScore) VALUES (%s, %s, %s)
    """
    cursor.execute(insertQuery, (userId, content_id, score))
    conn.commit()
    
    if(transcription == ctext and average_confidence >= 0.75):
        return jsonify({
            'isSuccess': True,
            'message': 'Correct',
            'data': transcription,
            'data2': None,
            'totalCount': None  
        }), 200
    else:
        return jsonify({
            'isSuccess': False,
            'message': 'Incorrect',
            'data': transcription,
            'data2': None,
            'totalCount': None  
        }), 200

def save_audio_file(audio_file):
    
    temp_dir = tempfile.gettempdir()  
    temp_audio_path = os.path.join(temp_dir, audio_file.filename)
    
    
    audio_file.save(temp_audio_path)
    return temp_audio_path

def pronounciate(audio_file):
    client_file = "sa_vistalk.json"
    credentials = service_account.Credentials.from_service_account_file(client_file)
    client = speech.SpeechClient(credentials=credentials)
    
    
    languageId = 1
    languageCode = ""
    if(languageId == 1):
        languageCode = "fil-PH"
    elif(languageId == 2):
        languageCode = "es-ES"

    
    if not audio_file.lower().endswith('.flac'):
        audio_file, channels = convert_to_flac(audio_file)
    else:
        audio_data, sample_rate = librosa.load(audio_file, sr=None, mono=False)
        channels = 1 if audio_data.ndim == 1 else 2

    audio_data, sample_rate = librosa.load(audio_file, sr=None, mono=False)
    
    
    with io.open(audio_file, 'rb') as f:
        content = f.read()
        audio = speech.RecognitionAudio(content=content)
    
    
    encoding = speech.RecognitionConfig.AudioEncoding.LINEAR16  
    if audio_file.lower().endswith('.flac'):
        encoding = speech.RecognitionConfig.AudioEncoding.FLAC  
    
    
    config = speech.RecognitionConfig(
        encoding=encoding,  
        sample_rate_hertz=sample_rate,  
        language_code=languageCode,  
        audio_channel_count=channels,  
        model="default"  
    )
    
    
    response = client.recognize(config=config, audio=audio)
    
    
    if not response.results:
        print("No transcription results. Check audio configuration and language support.")
        return None
    else:
        transcription = ""
        confidences = []  

        for result in response.results:
            alternative = result.alternatives[0]
            transcription += alternative.transcript + " "
            confidences.append(alternative.confidence)

        
        average_confidence = sum(confidences) / len(confidences) if confidences else 0

        return transcription.strip(), average_confidence

def convert_to_flac(audio_file):
    
    audio = AudioSegment.from_file(audio_file)
    flac_file = "converted_audio.flac"
    audio.export(flac_file, format="flac")
    return flac_file, audio.channels


def getPronunciationProgress():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    userId = request.args.get('userId')
    contentId = request.args.get('contentId')
    
    query = """
        SELECT 
            SUM(pronunciationScore = 1) AS correct, 
            SUM(pronunciationScore = 0) AS incorrect 
        FROM 
            pronounciationresult 
        WHERE 
            userPlayerID = %s
    """
    
    values = [userId]  
    if contentId is not None:
        query += " AND contentID = %s"
        values.append(contentId)
        
    cursor.execute(query, tuple(values))  
    vistas = cursor.fetchone()

    if not vistas:
        return jsonify({
            'isSuccess': True,
            'message': 'No sections found',
            'data': [],
            'data2': None,
            'totalCount': 0
        }), 200

    return jsonify({
        'isSuccess': True,
        'message': 'Successfully Retrieved',
        'data': vistas,
        'data2': None,
        'totalCount': None 
    }), 200

    
def getPronunciationList():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    userId = request.args.get('userId')
    contentId = request.args.get('contentId')
    
    query = """
        SELECT resultId, pr.contentId, c.contentText, pronunciationScore FROM pronounciationresult pr
        inner join content c on c.contentId =  pr.contentId
        WHERE 
            userPlayerID = %s
    """
    
    values = [userId]  
    if contentId is not None:
        query += " AND contentID = %s"
        values.append(contentId)
    
    cursor.execute(query, tuple(values))  
    vistas = cursor.fetchall()  

    if not vistas:
        return jsonify({
            'isSuccess': True,
            'message': 'No records found',
            'data': [],
            'data2': None,
            'totalCount': 0
        }), 200

    return jsonify({
        'isSuccess': True,
        'message': 'Successfully Retrieved',
        'data': vistas,
        'data2': None,
        'totalCount': len(vistas)  
    }), 200
