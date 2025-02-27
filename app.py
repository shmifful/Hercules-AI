from flask import Flask, request, jsonify
import sqlite3 as sql 

app = Flask(__name__)

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

        # DB connection
        conn = sql.connect("sql.db")
        cursor = conn.cursor()
        print("DB init...")

        # Inserting user data and closing the connection
        query = f"INSERT INTO users (username, email, password) VALUES ('{username}', '{email}', '{password}')"
        cursor.execute(query)
        conn.commit()
        conn.close()

        print(username, email, password, cpass)

        return jsonify({"success": True, "message": "Registration data received"})

if __name__ == "__main__":
    app.run(debug=True)