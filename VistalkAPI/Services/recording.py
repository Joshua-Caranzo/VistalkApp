from flask import request, jsonify, send_from_directory
import os
from db import CPhase1, get_db_connection, IlonggoPhase1,  WarayPhase1, CPhase2, IlonggoPhase2, WarayPhase2, CPhase2Incorrect, IlonggoPHase2Incorrect, WarayPhase2Incorect
import random

def save_content():
    content_id = int(request.form.get('contentId', 0))
    content_name = request.form.get('contentName', 'default_name').replace(' ', '_')
    
    directory_name = f"{content_name}_{content_id}"
    content_directory = os.path.join(CPhase1, directory_name)
    
    random_digits = random.randint(1000, 9999)

    os.makedirs(content_directory, exist_ok=True)

    audio_file_path = os.path.join(content_directory, f"{content_name}_{random_digits}.wav")
    
    audio_file = request.files.get('audioFile')
    if audio_file:
        audio_file.save(audio_file_path)
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
            INSERT INTO fileData (contentId, filePath, isAccepted, fileName) VALUES (%s, %s, %s, %s)
        """
        values = [content_id, audio_file_path, 0, f"{content_name}_{random_digits}.wav"]
        cursor.execute(query, values)
        conn.commit()
        return jsonify({'isSuccess': True, "message": "Content saved successfully"}), 200
    else:
        return jsonify({'isSuccess': False, "message": "No audio file provided"}), 400


def get_contents():
    searchString = request.args.get('searchString')
    pageNo = int(request.args.get('pageNo', 1))
    languageId = request.args.get('languageId')
    pageSize = 15
    offset = (pageNo - 1) * pageSize
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT fd.*, c.contentText
        FROM fileData fd inner join content c on c.contentID = fd.contentID where fd.isAccepted = 0 and fd.isRejected = 0
        AND c.languageID = %s
    """
    values = [languageId,]

    if searchString:
        query += " AND (c.contentText LIKE %s)"
        likePattern = f"%{searchString}%"
        values.extend([likePattern])
    print(query)
    query += """
        ORDER BY fd.Id DESC
        LIMIT %s OFFSET %s
    """
    values.extend([pageSize, offset])
  
    cursor.execute(query, tuple(values))
    contents = cursor.fetchall()
    
    return jsonify({
        'isSuccess': True,
        'message': 'Successfully retrieved reports',
        'data': contents,
        'totalCount': None
    }), 200
    
def getRecordingByFileName():
    fileName = request.args.get('fileName')
    languageId = int(request.args.get('languageId'))
    contentId = request.args.get('contentId') 
    contentName = request.args.get('contentName')

    directory_name = f"{contentName}_{contentId}"

    if languageId == 1:
        content_directory = os.path.join(CPhase1, directory_name)
        return send_from_directory(content_directory, fileName)
    if languageId == 2:
        content_directory = os.path.join(IlonggoPhase1, directory_name)
        return send_from_directory(content_directory, fileName)
    if languageId == 3:
        content_directory = os.path.join(WarayPhase1, directory_name)
        return send_from_directory(content_directory, fileName)
    
def acceptRecording():
    fileId = int(request.args.get('fileId')) 
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    update_query = "UPDATE fileData SET isAccepted = 1 WHERE id = %s"
    cursor.execute(update_query, (fileId,))
    conn.commit()
        
    select_query = """
            SELECT fd.*, c.languageId, c.contentText, c.contentId FROM fileData fd 
            INNER JOIN content c ON c.contentId = fd.contentId 
            WHERE fd.id = %s
        """
    cursor.execute(select_query, (fileId,))
    content = cursor.fetchone()
        
    if not content:
        return jsonify({'isSuccess': False, 'message': 'File not found'}), 404

    directory_name = f"{content['contentText']}_{content['contentId']}"
    content_directory = None
   
    if content['languageId'] == 1:
        content_directory = os.path.join(CPhase1, directory_name)
        target_directory = os.path.join(CPhase2, directory_name)
    elif content['languageId'] == 2:
        content_directory = os.path.join(IlonggoPhase1, directory_name)
        target_directory = os.path.join(IlonggoPhase2, directory_name)
    elif content['languageId'] == 3:
        content_directory = os.path.join(WarayPhase1, directory_name)
        target_directory = os.path.join(WarayPhase2, directory_name)

        
        
    if content_directory and target_directory:
        source_file_path = os.path.join(content_directory, content['fileName'])
        target_file_path = os.path.join(target_directory, content['fileName'])
        
        
        os.makedirs(target_directory, exist_ok=True)
        with open(source_file_path, 'rb') as src_file, open(target_file_path, 'wb') as tgt_file:
            tgt_file.write(src_file.read())
            
        update_query = "UPDATE fileData SET filePath = %s WHERE id = %s"
        cursor.execute(update_query, (target_file_path, fileId))
        conn.commit()
        
    return jsonify({'isSuccess': True, 'message': 'Report updated successfully'}), 200

def rejectRecording():
    fileId = int(request.args.get('fileId')) 
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    
    update_query = "UPDATE fileData SET isRejected = 1 WHERE id = %s"
    cursor.execute(update_query, (fileId,))
    conn.commit()
        
    
    select_query = """
        SELECT fd.*, c.languageId, c.contentText, c.contentId, fd.fileName FROM fileData fd 
        INNER JOIN content c ON c.contentId = fd.contentId 
        WHERE fd.id = %s
    """
    cursor.execute(select_query, (fileId,))
    content = cursor.fetchone()
        
    if not content:
        return jsonify({'isSuccess': False, 'message': 'File not found'}), 404

    
    directory_name = f"{content['contentText']}_{content['contentId']}"
    content_directory = None
    target_directory = None
        
    if content['languageId'] == 1:
        content_directory = os.path.join(CPhase1, directory_name)
        target_directory = os.path.join(CPhase2Incorrect, directory_name)
    elif content['languageId'] == 2:
        content_directory = os.path.join(IlonggoPhase1, directory_name)
        target_directory = os.path.join(IlonggoPHase2Incorrect, directory_name)
    elif content['languageId'] == 3:
        content_directory = os.path.join(WarayPhase1, directory_name)
        target_directory = os.path.join(WarayPhase2Incorect, directory_name)

    
    if content_directory and target_directory:
        source_file_path = os.path.join(content_directory, content['fileName'])
        target_file_path = os.path.join(target_directory, content['fileName'])
        
        
        os.makedirs(target_directory, exist_ok=True)

        
        with open(source_file_path, 'rb') as src_file, open(target_file_path, 'wb') as tgt_file:
            tgt_file.write(src_file.read())

        
        update_query = "UPDATE fileData SET filePath = %s WHERE id = %s"
        cursor.execute(update_query, (target_file_path, fileId))
        conn.commit()
        
    return jsonify({'isSuccess': True, 'message': 'Report updated successfully'}), 200