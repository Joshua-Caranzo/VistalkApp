import mysql.connector

def get_db_connection():
	return mysql.connector.connect(
		host="localhost",
		user="root",
		password="joshua021603",
		database="vistalkdb"
	)

HOST = '192.168.1.8'
PORT = 5000
DEBUG = True

PronunciationDirectory = "C:\\VistalkApp\\VistalkApp\\Vistalk Pronunciation Audio"
SyllableDirectory = "C:\\VistalkApp\\VistalkApp\\Vistalk Pronunciation Audio\\Syllables"
ItemImage = 'C:\\VistalkApp\\VistalkApp\\Item Image'
BackGroundMusicDirectory = 'C:\\VistalkApp\\VistalkApp\\Background Music Files'
QuestionFiles =  'C:\\VistalkApp\\VistalkApp\\QuestionFile'
UserImages = 'C:\\VistalkApp\\VistalkApp\\User Images'
SECRET_KEY='8807c2bfe813ec02b9178d3c5826118894f3cd01e5d1630555f03d64ee42e655'
