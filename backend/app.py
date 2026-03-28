import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from database import init_db
from routes import api


def create_app():
    app = Flask(__name__, static_folder=None)
    CORS(app, origins=["http://localhost:5173"])

    init_db(app)
    app.register_blueprint(api)

    # Serve frontend build in production
    frontend_dist = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')
    if os.path.isdir(frontend_dist):
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve_frontend(path):
            file_path = os.path.join(frontend_dist, path)
            if path and os.path.isfile(file_path):
                return send_from_directory(frontend_dist, path)
            return send_from_directory(frontend_dist, 'index.html')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
