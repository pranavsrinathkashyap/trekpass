import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env if present
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    COGNODB_URI: str = os.getenv("COGNODB_URI", "")
    COGNODB_USER: str = os.getenv("COGNODB_USER", "cognodb")
    COGNODB_PASSWORD: str = os.getenv("COGNODB_PASSWORD", "")
    
    # App config
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    CORS_ORIGINS: list[str] = [
        origin.strip() for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:8000"
        ).split(",") if origin.strip()
    ]

settings = Settings()
