from flask import Flask, request, jsonify
import numpy as np
import faiss
import base64
import cv2
import face_recognition
from pymongo import MongoClient

app = Flask(__name__)

# Connect to MongoDB
mongo_client = MongoClient("mongodb+srv://admin:1234@cluster0.t6hfq.mongodb.net/face_reg?retryWrites=true&w=majority&appName=Cluster0")
db = mongo_client["face_reg"]
collection = db["users"]

# Load embeddings and names from MongoDB
names = []
embeddings = []

for user in collection.find():
    names.append(user["name"])
    embeddings.append(user["embedding"])

# Convert to numpy array and normalize
embedding_matrix = np.array(embeddings).astype("float32")
faiss.normalize_L2(embedding_matrix)

# Create FAISS index
index = faiss.IndexFlatIP(embedding_matrix.shape[1])  # Cosine similarity
index.add(embedding_matrix)

@app.route("/recognize", methods=["POST"])
def recognize():
    print("Received image for recognition")
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        image_file = request.files["image"]
        img_bytes = image_file.read()

        img_np = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

        face_locations = face_recognition.face_locations(img)
        if not face_locations:
            return jsonify({"results": []})

        face_encodings = face_recognition.face_encodings(img, face_locations)
        results = []

        for i, face_embedding in enumerate(face_encodings):
            face_vector = np.array(face_embedding, dtype="float32").reshape(1, -1)
            faiss.normalize_L2(face_vector)

            D, I = index.search(face_vector, 1)
            similarity = D[0][0]
            matched_name = names[I[0][0]] if similarity > 0.5 else "Unknown"

            top, right, bottom, left = face_locations[i]
            box = [left, top, right - left, bottom - top]

            results.append({
                "name": matched_name,
                "box": box
            })

        return jsonify({"results": results})
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=8000, debug=True)
