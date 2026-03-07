from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from routes.auth_routes import auth_bp
from routes.booking_routes import booking_bp
from routes.search_routes import search_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(booking_bp, url_prefix="/api")
    app.register_blueprint(search_bp, url_prefix="/api")

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "TravelGo API"}), 200

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=Config.DEBUG)