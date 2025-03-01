from flask import Flask, request, jsonify
import sqlite3 as sql 
import re

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
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        print(username, email, password)

        # DB connection
        conn = sql.connect("sql.db")
        cursor = conn.cursor()
        print("DB init...")
        try:
            # Check if user details are correct
            query = f"SELECT username, email FROM users WHERE username='{username}' AND email='{email}' AND password='{password}'"
            cursor.execute(query)
            out = cursor.fetchall()
            for row in out:
                print(row)
            conn.commit()
        except sql.IntegrityError:
            print("Something went wrong")
        finally:
            conn.close()


        return jsonify({"success": True, "message": "Login data received"})

@app.route("/register", methods=["POST", "GET"])
def register():
    data = request.get_json() # Deconstruct the data received by the user

    if request.method == "GET":
        pass

    if request.method == "POST":
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        cpass = data.get("confirmPassword")

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
            query = f"INSERT INTO users (username, email, password) VALUES ('{username}', '{email}', '{password}')"
            cursor.execute(query)
            conn.commit()
            print(username, email, password, cpass)
            return jsonify({"success": True, "message": "User registered!"})
        except sql.IntegrityError as e:
            error_msg = str(e)
            print(f"Database error: {error_msg}")
            if "UNIQUE constraint failed: users.email" in error_msg:
                return jsonify({"success": False, "message": "Email already exists. Please use a different email."}), 400
            if "UNIQUE constraint failed: users.username" in error_msg:
                return jsonify({"success": False, "message": "Username already in use. Please try a different username."}), 400
        finally:
            conn.close()

if __name__ == "__main__":
    app.run(debug=True)