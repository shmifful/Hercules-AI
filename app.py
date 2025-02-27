from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/")
def index():
    return "Hello world"

@app.route("/login", methods=["POST", "GET"])
def login():
    data = request.get_json()
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
    data = request.get_json()

    if request.method == "GET":
        pass

    if request.method == "POST":
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        cpass = data.get("confirmPassword")
        print(username, email, password, cpass)

        return jsonify({"success": True, "message": "Registration data received"})

if __name__ == "__main__":
    app.run(debug=True)