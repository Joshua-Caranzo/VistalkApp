from db import get_db_connection, PronunciationDirectory, SyllableDirectory
from flask import request, jsonify, send_from_directory

def get_Content():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    
    searchString = request.args.get('searchString', '')
    print(searchString)
    offset = int(request.args.get('offset', 0))  
    limit = int(request.args.get('limit', 10))   
    print(offset)
    
    query = "SELECT * FROM content WHERE isInDictionary = 1"

    
    if searchString and searchString != "" and searchString != " ":
        query += " AND (contentText LIKE %s OR englishTranslation LIKE %s)"
        likePattern = f"%{searchString}%"
        cursor.execute(query + " ORDER BY contentText LIMIT %s OFFSET %s", 
                       (likePattern , likePattern, limit, offset))
    else:
        cursor.execute(query + " ORDER BY contentText LIMIT %s OFFSET %s", 
                       (limit, offset))

    
    content = cursor.fetchall()
    print(content)
    
    if not content:
        return jsonify({
            'isSuccess': True,
            'message': 'No content found',
            'data': [],
            'totalCount': 0
        }), 200

    
    cursor.execute("SELECT COUNT(*) AS total FROM content WHERE isInDictionary = 1")
    total_count = cursor.fetchone()['total']

    return jsonify({
        'isSuccess': True,
        'message': 'Successfully Retrieved',
        'data': content,
        'totalCount': total_count  
    }), 200


def getContentByID():
    contentId = request.args.get('contentId')
    if not contentId:
        return jsonify({
            'isSuccess': False,
            'message': 'contentId is required',
            'data': [],
            'totalCount': 0
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = "SELECT * FROM content WHERE contentId = %s"
    cursor.execute(query, (contentId,))
    
    results = cursor.fetchone()

    if results:
        return jsonify({
            'isSuccess': True,
            'message': 'Content retrieved successfully',
            'data': results,
            'totalCount': len(results)
        }), 200
    else:
        return jsonify({
            'isSuccess': False,
            'message': 'No content found with the given contentId',
            'data': [],
            'totalCount': 0
        }), 404
    
def getContentSyllableByID():
    contentId = request.args.get('contentId')
    if not contentId:
        return jsonify({
            'isSuccess': False,
            'message': 'contentId is required',
            'data': [],
            'totalCount': 0
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = "SELECT * FROM contentSyllable WHERE contentId = %s ORDER BY orderNumber"
    cursor.execute(query, (contentId,))
    
    results = cursor.fetchall()

    if results:
        return jsonify({
            'isSuccess': True,
            'message': 'Content syllables retrieved successfully',
            'data': results,
            'totalCount': len(results)
        }), 200
    else:
        return jsonify({
            'isSuccess': False,
            'message': 'No syllables found for the given contentId',
            'data': [],
            'totalCount': 0
        }), 404
    
def getContentExampleByID():
    contentId = request.args.get('contentId')
    if not contentId:
        return jsonify({
            'isSuccess': False,
            'message': 'contentId is required',
            'data': [],
            'totalCount': 0
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = "SELECT * FROM contentexample WHERE contentId = %s ORDER BY orderNumber"
    cursor.execute(query, (contentId,))
    
    results = cursor.fetchall()

    if results:
        return jsonify({
            'isSuccess': True,
            'message': 'Content examples retrieved successfully',
            'data': results,
            'totalCount': len(results)
        }), 200
    else:
        return jsonify({
            'isSuccess': False,
            'message': 'No examples found for the given contentId',
            'data': [],
            'totalCount': 0
        }), 404
    
def getContentDefinitionByID():
    contentId = request.args.get('contentId')
    if not contentId:
        return jsonify({
            'isSuccess': False,
            'message': 'contentId is required',
            'data': [],
            'totalCount': 0
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = "SELECT * FROM contentdefinition WHERE contentId = %s ORDER BY orderNumber"
    cursor.execute(query, (contentId,))
    
    results = cursor.fetchall()

    if results:
        return jsonify({
            'isSuccess': True,
            'message': 'Content definitions retrieved successfully',
            'data': results,
            'totalCount': len(results)
        }), 200
    else:
        return jsonify({
            'isSuccess': False,
            'message': 'No definitions found for the given contentId',
            'data': [],
            'totalCount': 0
        }), 404
    
def getContentPronunciation():
    fileName = request.args.get('fileName')
    timestamp = request.args.get('t')
    try:
        return send_from_directory(PronunciationDirectory, fileName)
    except FileNotFoundError:
        return None
    
def getSyllablePronunciation():
    fileName = request.args.get('fileName')
    timestamp = request.args.get('t')
    try:
        return send_from_directory(SyllableDirectory, fileName)
    except FileNotFoundError:
        return None