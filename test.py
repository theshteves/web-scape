from subprocess import call
from pymongo import MongoClient

from flask import Flask, render_template
from webqueue import checkSite 
from flask.ext.cors import CORS
from flask_socketio import SocketIO, emit

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@socketio.on('connect')
def test_connect():
    emit('my response', {'data': 'Connected'})

@socketio.on("res")
def getres(res):
    client = MongoClient()
    db = client.websites
    emit("done", {})
    collection = db.websites
    emit("results", checkSite(res["url"], emit))

@app.route('/')
def hello_world():
    return render_template('hello.html')

app.debug = True

if __name__ == '__main__':
    socketio.run(app)
