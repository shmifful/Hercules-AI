from flask import Flask, request, jsonify
import sqlite3 as sql 
import re
from datetime import datetime, timedelta
from GenerateFirstWeek import GenerateWorkout 
import urllib.parse

app = Flask(__name__)
email_re = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'

@app.route("/")
def index():
    return "Hello world"

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json() # Deconstruct the data received by the user
    
    if request.method == "POST":
        email = data.get("email")
        password = data.get("password")
        print(email, password)

        if not email or not password:
            return jsonify({"success": False, "message": "Email or password not provided"})

        # DB connection
        conn = sql.connect("sql.db")
        cursor = conn.cursor()
        print("DB init...")
        try:
            # Check if user details are correct
            query = f"SELECT user_id, username, days FROM users where email='{email}' AND password='{password}'"
            cursor.execute(query)
            user = cursor.fetchone()
            print(user)
            
            if user:
                id, username, days = user
                return jsonify({
                    "success": True,
                    "message": "Login successful!",
                    "user": {
                        "id": id, 
                        "username": username,
                        "days": days
                        } 
                })
            else:
                # No matching user found
                return jsonify({"success": False, "message": "Invalid email or password"}), 401
        except sql.IntegrityError:
            print("Something went wrong")
        finally:
            conn.close()


        return jsonify({"success": True, "message": "Login data received"})

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json() 

    if request.method == "POST":
        # Decomposing the data received by the user
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        cpass = data.get("confirmPassword")
        days = data.get("days")
        goal = data.get("goal")

        # Verying details entered by user is valid
        if not re.fullmatch(email_re, email):
            return jsonify({"success": False, "message": "Invalid email. Please try again."}), 400
        elif len(password) < 8:
            return jsonify({"success": False, "message": "The password chosen is too short. Your password must be at least 8 characters long."}), 400
        elif password != cpass:
            return jsonify({"success": False, "message": "The passwords entered do not match. Please try again."}), 400

        # DB connection
        conn = sql.connect("sql.db")
        cursor = conn.cursor()
        print("DB init...")
        try:
            # Inserting user data and closing the connection
            query = f"INSERT INTO users (username, email, password, days, goal) VALUES ('{username}', '{email}', '{password}', '{days}', '{goal}')"
            cursor.execute(query)
            conn.commit()
            print(username, email, password, cpass, days, goal)

            query = f"SELECT user_id, username FROM users where email='{email}' AND password='{password}'"
            cursor.execute(query)
            user = cursor.fetchone()
            id, username = user

            conn.close()
            generate_plan(id, days, goal)
            return jsonify({"success": True, "message": "User registered!", "user":{"id":id, "username":username, "days":days}})
        except sql.IntegrityError as e:
            error_msg = str(e)
            print(f"Database error: {error_msg}")
            conn.close()
            if "UNIQUE constraint failed: users.email" in error_msg:
                return jsonify({"success": False, "message": "Email already exists. Please use a different email."}), 400
            if "UNIQUE constraint failed: users.username" in error_msg:
                return jsonify({"success": False, "message": "Username already in use. Please try a different username."}), 400

def generate_plan(id, days, goal):
    # Calculate start of week (Monday)
    today = datetime.today()
    start_of_week = today - timedelta(days=today.weekday())
    start_of_week = start_of_week.strftime("%Y-%m-%d")

    # DB connection
    conn = sql.connect("sql.db")
    cursor = conn.cursor()
    print("DB init...")

    try:
        # Inserting user data and closing the connection
        plan_query = f"INSERT INTO workout_plans (user_id, start) VALUES ('{id}', '{start_of_week}')"
        cursor.execute(plan_query)
        conn.commit()

        plan_id = cursor.lastrowid
        
        plan = GenerateWorkout.generate_workout_plan(days_per_week=days, goal=goal)
        for day, exercises in plan.items():
            day_query = f"INSERT INTO workout_days (plan_id, day_type, completed) VALUES ('{plan_id}', '{day}', 0)"
            cursor.execute(day_query)
            conn.commit()
            day_id = cursor.lastrowid

            for ex in exercises:
                day_query = f"INSERT INTO workout_exercises (day_id, exercise_title, sets, reps_suggested, rest) VALUES ({day_id},'{ex['Exercise']}', '{ex['Sets']}', '{ex['Reps']}', '{ex['Rest']}')"
                cursor.execute(day_query)
                conn.commit()

        conn.close()
    except sql.IntegrityError as e:
        error_msg = str(e)
        print(f"Database error: {error_msg}")
        conn.close()

@app.route("/get_workouts", methods=["POST"])
def get_workouts():
    data = request.get_json() # Deconstruct the data received by the user

    if request.method == "POST":
        id = data.get("id")

        # DB connection
        conn = sql.connect("sql.db")
        cursor = conn.cursor()
        print("DB init...")
        try:
            today = datetime.today()
        
            # Calculate start of week (Monday)
            start_of_week = today - timedelta(days=today.weekday())
            
            # Calculate end of week (Sunday)
            end_of_week = start_of_week + timedelta(days=6)

            start_of_week = start_of_week.strftime("%Y-%m-%d")
            end_of_week =  end_of_week.strftime("%Y-%m-%d")
            
            # Check if user details are correct
            plan_query = f"SELECT plan_id FROM workout_plans WHERE start>='{start_of_week}' AND start<='{end_of_week}' AND user_id='{id}'"
            cursor.execute(plan_query)
            plan = cursor.fetchone()
            print(plan)

            days_query = f"SELECT day_id, day_type, completed FROM workout_days WHERE plan_id={plan[0]}"
            cursor.execute(days_query)
            days = cursor.fetchall()
            print(days)
            send_data = {}
            
            for d in days:
                day_id, title, completed = d
                send_data[title] = {
                    "day_id": day_id,
                    "completed": completed
                }
            return jsonify(send_data)
        except sql.IntegrityError:
            print("Something went wrong")
        finally:
            conn.close()

@app.route("/get_exercises", methods=["POST"])
def get_exercises():
    data = request.get_json()

    if request.method == "POST":
        id = data.get("id")
        user_id = data.get("user_id")
        print(id)

        # DB connection
        conn = sql.connect("sql.db")
        cursor = conn.cursor()
        print("DB init...")
        try:
            # Check if user details are correct
            exercises_query = f"SELECT exercise_id, exercise_title, sets, reps_suggested, rest FROM workout_exercises WHERE day_id={id}"
            cursor.execute(exercises_query)
            exercises = cursor.fetchall()
            print(exercises)

            send_data = {}

            for ex in exercises:
                ex_id, title, sets, reps, rest = ex
                one_rm = get_max_one_rm(user_id, title)
                print(one_rm)
                send_data[title] = {
                    "id": ex_id,
                    "sets": sets,
                    "reps": reps,
                    "rest": rest,
                    "one_rm": one_rm if one_rm != None else 0
                }
            
            return jsonify(send_data)
        except sql.IntegrityError:
            print("Something went wrong")
        finally:
            conn.close()

def get_max_one_rm(user_id, exercise_name):
    conn = sql.connect("sql.db")
    cursor = conn.cursor()
    try:
        cursor = conn.cursor()
        
        # Execute the query
        query = f"SELECT MAX(we.one_rm) as max_one_rm FROM workout_exercises we JOIN workout_days wd ON we.day_id = wd.day_id JOIN workout_plans wp ON wd.plan_id = wp.plan_id WHERE wp.user_id = {user_id} AND we.exercise_title = '{exercise_name}' AND we.one_rm IS NOT NULL"
        
        cursor.execute(query)
        result = cursor.fetchone()
        
        # Return the max one_rm or None if no records found
        return result[0] if result and result[0] is not None else None
        
    except sql.Error as e:
        print(f"Database error: {e}")
        return None
    finally:
        if conn:
            conn.close()

@app.route("/update_one_rm", methods=["POST"])
def update_one_rm():
    data = request.get_json()

    if request.method == "POST":
        id = data.get("id")
        ex_name = data.get("exercise_name")
        one_rm = data.get("new_one_rm")

        conn = sql.connect("sql.db")
        cursor = conn.cursor()
        print(id, ex_name, one_rm)
        try:
            cursor = conn.cursor()
            
            # Execute the query
            query = f"UPDATE workout_exercises SET one_rm={int(one_rm)} WHERE exercise_id={id} AND exercise_title='{ex_name}'"

            cursor.execute(query)
            conn.commit()

            return jsonify({"success": True})
            
        except sql.Error as e:
            print(f"Database error: {e}")
            return jsonify({"success": False})
        finally:
            if conn:
                conn.close()

@app.route("/get_exercise_description", methods=["GET"])
def get_exercise_description():
    if request.method == "GET":
        ex = request.args.get("exercise")
    
        if not ex:
            return jsonify({"error": "Exercise parameter missing"}), 400
        
        description = GenerateWorkout.getExDesc(ex)
        print(description)
        
        return jsonify({
            "description": description
        })
            

if __name__ == "__main__":
    app.run(debug=True)