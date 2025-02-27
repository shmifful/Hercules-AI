from flask import Flask, request

app = Flask(__name__)

@app.route("/")
def index():
    return "Hello world"

@app.route("/login", methods=["GET"])
def login():
    if request.method == "GET":
        pass

@app.route("/register", methods=["POST", "GET"])
def register():
    if request.method == "GET":
        pass

    if request.method == "POST":
        pass

if __name__ == "__main__":
    app.run(debug=True)