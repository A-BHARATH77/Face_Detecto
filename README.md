🧠 Real-Time Face Recognition & RAG Chat Platform
A full-stack, browser-based platform enabling real-time face registration, multi-face recognition, and a chat interface powered by a Retrieval-Augmented Generation (RAG) system.

Built with:
React · Node.js · Express · MongoDB · Python · LangChain · FAISS · OpenAI / Gemini LLM

🚀 Features
📸 Face Registration
Access your laptop or external webcam.

Detect faces using Python-based face recognition libraries (e.g., face_recognition or dlib).

Assign custom names to detected faces (same face can have multiple unique names).

Validate name uniqueness in real time.

Store:

Face encodings

Metadata (name, registration time)

In MongoDB

🎥 Live Face Recognition
Stream webcam feed.

Detect and identify multiple faces in real time.

Draw bounding boxes and labels using cosine similarity with stored encodings.

Face embeddings are stored and indexed using FAISS for fast vector similarity search.

💬 RAG Chat Interface
Embedded chatbox in the frontend.

WebSocket-based communication between:

React (frontend)

Node.js (backend)

Python (RAG engine)

Ask natural language queries like:

"Who was the last person registered?"

"At what time was Karthik registered?"

"How many people are currently registered?"

Behind the scenes:

Your query is passed to a Python RAG engine.

The LLM (Gemini/OpenAI) interprets the question and generates a MongoDB query.

Query is executed via aggregation pipeline.

Result is returned as a user-friendly response.

🛠️ Tech Stack
Layer	            Technology
Frontend	        React.js, WebSocket, HTML5 Video
Backend	          Node.js, Express
Database	        MongoDB (for storage), FAISS (for vector indexing)
Face Recognition	Python (face_recognition, OpenCV)
RAG Engine	      Python, LangChain, FAISS, Gemini/OpenAI LLM

🔧 Setup Instructions
1. Clone the Repository
   git clone https://github.com/A-BHARATH77/Face-Detecto
   cd Face-Detecto
2. Setup Environment
   npm install
   pip install
3. Start Application 
   npm start
