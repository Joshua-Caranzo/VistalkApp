from db import get_db_connection, QuestionFiles
from flask import request, jsonify, send_from_directory
from datetime import date

def getDailyTasks():
    userId = request.args.get('userId')
    dateToday = date.today() 
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """SELECT pdt.*, dt.rewardcoins, dt.tasktypeId, dtt.typeName as taskName, dtt.description as taskDescription, dt.quantity as totalValue, el.currentValue
               FROM playerdailytask pdt 
               INNER JOIN dailytask dt ON dt.taskId = pdt.taskId 
               INNER JOIN dailytasktype dtt ON dtt.id = dt.tasktypeId
               INNER JOIN eventlogs el on el.dailyTaskid = dt.taskid
               WHERE pdt.userplayerID = %s AND dt.taskDate = %s AND dtt.isImplemented = 1;"""
    values = (userId, dateToday)
    cursor.execute(query, values)
    tasks = cursor.fetchall()

    if not tasks:
        return jsonify({
            'isSuccess': True,
            'message': 'No tasks found',
            'data': [],
            'data2': None,
            'totalCount': 0
        }), 200
    
    return jsonify({
        'isSuccess': True,
        'message': 'Successfully Retrieved',
        'data': tasks,
        'data2': None,
        'totalCount': None
    }), 200