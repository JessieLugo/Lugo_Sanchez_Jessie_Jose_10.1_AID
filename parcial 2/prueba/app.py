from flask import Flask
from flask_socketio import SocketIO
from routes import register_routes

def create_app():
    app = Flask(__name__)
    socketio = SocketIO(app, async_mode='eventlet')
    register_routes(app, socketio)
    return app, socketio

app, socketio = create_app()

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)

