from flask import Flask, request, jsonify
import sqlite3 as sql 
import re
from datetime import datetime
from GenerateFirstWeek import GenerateWorkout 

app = Flask(__name__)
email_re = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'

@app.route("/")
def index():
    return "Hello world"

@app.route("/login", methods=["POST", "GET"])
def login():
    data = request.get_json() # Deconstruct the data received by the user
    if request.method == "GET":
        return jsonify({"success": True, "message": "GET WORKS!"})
    
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
            query = f"SELECT user_id, username FROM users where email='{email}' AND password='{password}'"
            cursor.execute(query)
            user = cursor.fetchone()
            print(user)
            
            if user:
                id, username = user
                return jsonify({
                    "success": True,
                    "message": "Login successful!",
                    "user": {
                        "id": id, 
                        "username": username
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
            return jsonify({"success": True, "message": "User registered!", "user":{"id":id, "username":username}})
        except sql.IntegrityError as e:
            error_msg = str(e)
            print(f"Database error: {error_msg}")
            conn.close()
            if "UNIQUE constraint failed: users.email" in error_msg:
                return jsonify({"success": False, "message": "Email already exists. Please use a different email."}), 400
            if "UNIQUE constraint failed: users.username" in error_msg:
                return jsonify({"success": False, "message": "Username already in use. Please try a different username."}), 400

def generate_plan(id, days, goal):
    date = datetime.today().strftime("%Y-%m-%d")

    # DB connection
    conn = sql.connect("sql.db")
    cursor = conn.cursor()
    print("DB init...")

    try:
        # Inserting user data and closing the connection
        plan_query = f"INSERT INTO workout_plans (user_id, created, completed) VALUES ('{id}', '{date}', 0)"
        cursor.execute(plan_query)
        conn.commit()

        plan_id = cursor.lastrowid
        
        plan = GenerateWorkout.generate_workout_plan(days_per_week=days, goal=goal)
        for day, exercises in plan.items():
            day_query = f"INSERT INTO workout_days (plan_id, day_type) VALUES ('{plan_id}', '{day}')"
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

    

if __name__ == "__main__":
    app.run(debug=True)