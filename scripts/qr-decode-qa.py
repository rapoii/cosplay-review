import json
from pathlib import Path

result = {"image": "/tmp/lilycosrent-qr-runtime.png"}
try:
    import cv2
    image_path = Path(result["image"])
    image = cv2.imread(str(image_path))
    detector = cv2.QRCodeDetector()
    decoded, points, _ = detector.detectAndDecode(image)
    result["decoded"] = decoded
    result["detected"] = points is not None
    result["imageSize"] = list(image.shape[:2]) if image is not None else None
    result["pass"] = bool(decoded) and "#tulis-ulasan" in decoded
except Exception as error:
    result["error"] = f"{type(error).__name__}: {error}"
    result["pass"] = False
print(json.dumps(result, indent=2))
