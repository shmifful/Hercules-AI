from flask import Flask, request, jsonify
import sqlite3 as sql 
import re
from datetime import datetime, timedelta
from GenerateWorkout import GenerateWorkout 
import click

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
        level = data.get("level")

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
            query = f"INSERT INTO users (username, email, password, days, goal, level) VALUES ('{username}', '{email}', '{password}', '{days}', '{goal}', '{level}')"
            cursor.execute(query)
            conn.commit()
            print(username, email, password, cpass, days, goal)

            query = f"SELECT user_id, username FROM users where email='{email}' AND password='{password}'"
            cursor.execute(query)
            user = cursor.fetchone()
            id, username = user

            conn.close()
            generate_plan(id, days, goal, level)
            return jsonify({"success": True, "message": "User registered!", "user":{"id":id, "username":username, "days":days}})
        except sql.IntegrityError as e:
            error_msg = str(e)
            print(f"Database error: {error_msg}")
            conn.close()
            if "UNIQUE constraint failed: users.email" in error_msg:
                return jsonify({"success": False, "message": "Email already exists. Please use a different email."}), 400
            if "UNIQUE constraint failed: users.username" in error_msg:
                return jsonify({"success": False, "message": "Username already in use. Please try a different username."}), 400

def generate_plan(id, days, goal, level):
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
        print(days)
        
        plan = GenerateWorkout.generate_first_week_plan(days_per_week=days, goal=goal, level=level)
        for day, exercises in plan.items():
            # Inserting day type
            day_query = f"INSERT INTO workout_days (plan_id, day_type, completed) VALUES ('{plan_id}', '{day}', 0)"
            print(day_query)
            cursor.execute(day_query)
            conn.commit()
            day_id = cursor.lastrowid

            for ex in exercises:
                # Inserting exercises generated in the database
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
            start_of_week = start_of_week.strftime("%Y-%m-%d")
            
            # Check if user details are correct
            plan_query = f"SELECT plan_id FROM workout_plans WHERE start='{start_of_week}' AND user_id='{id}'"
            cursor.execute(plan_query)
            plan = cursor.fetchone()
            print(plan_query)
            print(plan, 123)

            if plan is None:
                #Get user preferences
                goal_query = f"SELECT goal, level FROM users WHERE user_id={id}"
                cursor.execute(goal_query)
                conn.commit()
                user = cursor.fetchone()
                goal, level = user
                print(user)

                prev_date_query = f"SELECT MAX(start) FROM workout_plans WHERE user_id={id}"
                cursor.execute(prev_date_query)
                conn.commit()
                prev = cursor.fetchone()[0]

                # Get the days of that week
                prev_plan_id = f"SELECT plan_id FROM workout_plans WHERE user_id={id} AND start='{prev}'"
                cursor.execute(prev_plan_id)
                plan = cursor.fetchone()
                print(plan)

                # Get the days of that week
                prev_days = f"SELECT day_id, day_type FROM workout_days WHERE plan_id={plan[0]}"
                cursor.execute(prev_days)
                p_days = cursor.fetchall()
                print(p_days)

                day_ids = []
                new_day_ids = []

                # Making new plans
                plan_query = f"INSERT INTO workout_plans (user_id, start) VALUES ({id}, '{start_of_week}')"
                print(plan_query)
                cursor.execute(plan_query)
                conn.commit()
                new_plan_id = cursor.lastrowid
                print(new_plan_id)
                
                for day in p_days:
                    i, t = day
                    day_ids.append(i)
                    insert_day_query = f"INSERT INTO workout_days (plan_id, day_type, completed) VALUES ('{new_plan_id}', '{t}', 0)"
                    cursor.execute(insert_day_query)
                    conn.commit()
                    last = cursor.lastrowid
                    new_day_ids.append(last)

                for idx, i in enumerate(day_ids):
                    get_prev_ex = f"SELECT exercise_title, rating FROM workout_exercises WHERE day_id={i}"
                    cursor.execute(get_prev_ex)
                    conn.commit()
                    prev_exs = cursor.fetchall()

                    for j in prev_exs:
                        ex_title, rating = j
                        workout = GenerateWorkout.generate_next_exercise(ex_title, rating, level, goal)

                        max_one_rm = f"SELECT MAX(we.one_rm) AS max_one_rm FROM users u JOIN workout_plans wp ON u.user_id = wp.user_id JOIN workout_days wd ON wp.plan_id = wd.plan_id JOIN workout_exercises we ON wd.day_id = we.day_id WHERE u.user_id = {id} AND we.exercise_title = '{workout["Exercise"]}'"
                        cursor.execute(max_one_rm)
                        res = cursor.fetchone()[0]

                        insert_workout_query = f"INSERT INTO workout_exercises (day_id, exercise_title, sets, reps_suggested, rest, one_rm) VALUES ({new_day_ids[idx]},'{workout['Exercise']}', '{workout['Sets']}', '{workout['Reps']}', '{workout['Rest']}', {res if res else 0})"
                        cursor.execute(insert_workout_query)
                        conn.commit()

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
            
            # Formatting exercises to send
            for ex in exercises:
                ex_id, title, sets, reps, rest = ex
                alt_ex = get_other_exs(title)
                one_rm = get_max_one_rm(user_id, title)
                print(one_rm)
                send_data[title] = {
                    "id": ex_id,
                    "sets": sets,
                    "reps": reps,
                    "rest": rest,
                    "one_rm": one_rm if one_rm != None else 0,
                    "alt_ex": alt_ex
                }
            
            return jsonify(send_data)
        except sql.IntegrityError:
            print("Something went wrong")
        finally:
            conn.close()

def get_other_exs(title):
    alt_ex = {title}
    while len(alt_ex) < 5:
        ex = GenerateWorkout.get_recommendations(title)["Title"]
        alt_ex.add(ex)

    return list(alt_ex)

def get_max_one_rm(user_id, exercise_name):
    conn = sql.connect("sql.db")
    cursor = conn.cursor()
    try:
        cursor = conn.cursor()
        
        # Get one_rm for a workout
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

@app.route("/update_ex", methods=["PUT"])
def update_day():
    data = request.get_json()

    if request.method == "PUT":
        user_id = data.get("user_id")
        title = data.get("title")
        ex_id = data.get("ex_id")

        conn = sql.connect("sql.db")
        cursor = conn.cursor()
        try:     
            one_rm = get_max_one_rm(user_id, title)      
            # Updates workout when changed
            query = f"UPDATE workout_exercises SET exercise_title='{title}', one_rm={0 if one_rm is None else one_rm} WHERE exercise_id={ex_id}"
            print(query)
            cursor.execute(query)
            conn.commit()

            return jsonify({"success": True})
            
        except sql.Error as e:
            print(f"Database error: {e}")
            return jsonify({"success": False})
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
            
            # Update the one rep max for an exercise
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
        
        description = GenerateWorkout.get_ex_desc(ex)
        print(description)
        
        return jsonify({
            "description": description
        })
    
@app.route("/rating/<int:id>", methods=["PUT"])
def put_rating(id):
    data = request.get_json()
    print(data)

    if request.method == "PUT":
        rating = data.get("rating")
        conn = sql.connect("sql.db")
        cursor = conn.cursor()
        try:
            cursor = conn.cursor()
            
            # Execute the query
            query = f"UPDATE workout_exercises SET rating={rating} WHERE exercise_id={id}"

            cursor.execute(query)
            conn.commit()

            return jsonify({"success": True})
            
        except sql.Error as e:
            print(f"Database error: {e}")
            return jsonify({"success": False})
        finally:
            if conn:
                conn.close()
    
@app.route("/completed", methods=["PUT"])
def completed():
    data = request.get_json()
    print(request.method, data)

    if request.method == "PUT":
        id = data.get("day_id")
        conn = sql.connect("sql.db")
        cursor = conn.cursor()
        try:
            cursor = conn.cursor()
            
            # Execute the query
            query = f"UPDATE workout_days SET completed=1 WHERE day_id={id}"

            cursor.execute(query)
            conn.commit()

            return jsonify({"success": True})
            
        except sql.Error as e:
            print(f"Database error: {e}")
            return jsonify({"success": False})
        finally:
            if conn:
                conn.close()

@app.route("/get_preferences", methods=["GET"])
def get_prefences():
    if request.method == "GET":
        print(request)
        user_id = request.args.get("user_id")
        print(user_id)

        conn = sql.connect("sql.db")
        cursor = conn.cursor()
        try:
            cursor = conn.cursor()
            
            # Execute the query
            query = f"SELECT goal, level FROM users WHERE user_id={user_id}"
            cursor.execute(query)
            conn.commit()
            goal, level = cursor.fetchone()

            return jsonify({"goal": goal, "level": level})
            
        except sql.Error as e:
            print(f"Database error: {e}")
            return jsonify({"success": False})
        finally:
            if conn:
                conn.close()

@app.route("/update_preferences", methods=["PUT"])
def update_preferences():
    data = request.get_json()

    if request.method == "PUT":
        user_id = data.get("user_id")
        goal = data.get("goal")
        level = data.get("level")

        conn = sql.connect("sql.db")
        cursor = conn.cursor()
        try:
            cursor = conn.cursor()
            
            # Execute the query
            query = f"UPDATE users SET goal='{goal}', level='{level}' WHERE user_id={user_id}"
            cursor.execute(query)
            conn.commit()

            return jsonify({"success": True})
            
        except sql.Error as e:
            print(f"Database error: {e}")
            return jsonify({"success": False})
        finally:
            if conn:
                conn.close()

if __name__ == "__main__":
    app.run(debug=True)