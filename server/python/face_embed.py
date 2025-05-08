import sys
import base64
import json
import numpy as np
import face_recognition
from PIL import Image
import io

def get_embedding(image_base64):
    try:
        image_data = base64.b64decode(image_base64.split(',')[1])
        image = Image.open(io.BytesIO(image_data))
        image_np = np.array(image)
        face_encodings = face_recognition.face_encodings(image_np)
        if not face_encodings:
            return json.dumps({'error': 'No face found'})
        return json.dumps({'embedding': face_encodings[0].tolist()})
    except Exception as e:
        return json.dumps({'error': str(e)})

if __name__ == "__main__":
    image_base64 = sys.stdin.read()
    result = get_embedding(image_base64)
    print(result)
