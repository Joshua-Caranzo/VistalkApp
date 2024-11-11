from pydub import AudioSegment
from pydub.silence import split_on_silence
import os

def clean_and_save_audio(input_file_path: str, output_directory: str, output_filename: str):
    """
    Accepts an audio file, trims and cleans it (removes silence), and saves it as a WAV file.
    
    :param input_file_path: Path to the input audio file
    :param output_directory: Directory to save the cleaned and trimmed audio
    :param output_filename: Filename for the output audio file (without extension)
    """
    
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)
    
    
    audio = AudioSegment.from_file(input_file_path)
    
    
    trimmed_audio = trim_silence(audio)
    
    
    cleaned_audio = remove_internal_silence(trimmed_audio)
    
    
    output_path = os.path.join(output_directory, f"{output_filename}.wav")
    cleaned_audio.export(output_path, format="wav")
    
    print(f"Audio saved to: {output_path}")
    return output_path


def trim_silence(audio: AudioSegment) -> AudioSegment:
    """
    Trim silence from the start and end of the audio.
    
    :param audio: AudioSegment to trim
    :return: Trimmed AudioSegment
    """
    
    start_trim = detect_nonsilent_part(audio, "start")
    end_trim = detect_nonsilent_part(audio, "end")
    
    
    trimmed_audio = audio[start_trim:end_trim]
    return trimmed_audio


def detect_nonsilent_part(audio: AudioSegment, position: str) -> int:
    """
    Detect the index where the non-silent audio starts or ends.
    
    :param audio: AudioSegment to analyze
    :param position: "start" or "end" to determine which side to check
    :return: The index in milliseconds where non-silent audio starts or ends
    """
    silence_thresh = audio.dBFS - 14  
    if position == "start":
        
        return next((i for i, sample in enumerate(audio) if sample.dBFS > silence_thresh), 0)
    elif position == "end":
        
        return next((i for i, sample in enumerate(reversed(audio)) if sample.dBFS > silence_thresh), len(audio))


def remove_internal_silence(audio: AudioSegment) -> AudioSegment:
    """
    Remove internal silence (silence between sounds).
    
    :param audio: AudioSegment to clean
    :return: Cleaned AudioSegment with reduced internal silence
    """
    
    chunks = split_on_silence(audio, min_silence_len=1000, silence_thresh=-40)
    
    
    cleaned_audio = AudioSegment.empty()
    for chunk in chunks:
        cleaned_audio += chunk
    
    return cleaned_audio
