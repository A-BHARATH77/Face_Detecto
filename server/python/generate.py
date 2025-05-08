from flask import Flask, request, jsonify
import os
from flask_cors import CORS
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnablePassthrough
import re
from pymongo import MongoClient
import ast
from langchain_google_genai import ChatGoogleGenerativeAI
import datetime

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/ask": {
        "origins": ["http://localhost:3000"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})
# Load Groq API key
os.environ["GOOGLE_API_KEY"] = "AIzaSyDhQqNr8-m8o6kD_JEIOIelmnIj7yyTuro"

def answer(user_query: str) -> str:
    try:
        llm_ge = ChatGoogleGenerativeAI(model="gemini-2.5-flash-preview-04-17")

        # Step 1: Generate MongoDB filter query
        template = '''
You are an agent specialized in MongoDB queries creation.
Create a MongoDB query for the user question based on the relational schema provided.

The relation schema is:
{{
  name: {{ type: String, unique: true }},
  embedding: {{ type: [Number], required: true }}, // Array of 128 numbers
  createdAt: {{ type: Date }},
  updatedAt: {{ type: Date }}
}}

Question: {question}

Your response must follow these strict rules:
1. Use single quotes for all keys and string values inside objects (e.g., {{"createdAt": -1}}).
2. Return only a single line mongosh query as plain text.
3. Do NOT use JavaScript-style object notation (e.g., {{createdAt: -1}} is invalid).
4. Do NOT include any code block, markdown formatting, or explanation. Just return the raw query string.
5. Output must start with db.collection only no need to specify the name of the collection.
'''
        prompt=ChatPromptTemplate.from_template(template)
# Run the chain without LLMChain
        chain = (
            {"question": RunnablePassthrough()}
            | prompt
            | llm_ge
        )
        print(user_query)
        response = chain.invoke(user_query)
        mongo_query_str = response.content
        print("Generated Mongo Query:", mongo_query_str)
        #mongo_client = MongoClient("mongodb://admin:1234@cluster0-shard-00-00.t6hfq.mongodb.net:27017,cluster0-shard-00-01.t6hfq.mongodb.net:27017,cluster0-shard-00-02.t6hfq.mongodb.net:27017/face_reg?ssl=true&replicaSet=atlas-xxxxxx-shard-0&authSource=admin&retryWrites=true&w=majority")
        mongo_client = MongoClient("mongodb://localhost:27017/")
        db = mongo_client["face_reg"]
        collection = db["users"]
        # step 3 mongo retrieval 
        try:
            # Connect to MongoDB
            def replace_date_patterns(query_str):
                """Replace JavaScript ISODate(...) and new Date(...) with Python datetime.fromisoformat(...)."""
                pattern = r'(ISODate|new Date)\s*[\'"]([^\'"]+)[\'"]\s*'

                def replacer(match):
                    label = match.group(1)
                    date_str = match.group(2)
                    dt_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                    return f"datetime.fromisoformat('{dt_obj.isoformat()}')"

                return re.sub(pattern, replacer, query_str)
            def execute_query(query: str):
                query = query.strip()
                print("normal query ",query)
                query = replace_date_patterns(query)
                print("processed query",query)
                try:
                     # find().sort({...}).limit(n)
                    if ".find()" in query and ".sort(" in query and ".limit(" in query:
                        sort_arg = ast.literal_eval(query.split("sort(")[1].split(")")[0])
                        limit_arg = int(query.split("limit(")[1].split(")")[0])
                        result = collection.find().sort(list(sort_arg.items())).limit(limit_arg)
                        return list(result)

                    # find({...}).sort({...}).limit(n)
                    elif ".find({" in query and ".sort(" in query and ".limit(" in query:
                        find_part = query.split("find(")[1].split(")")[0]
                        query_filter = eval(find_part)
                        sort_arg = ast.literal_eval(query.split("sort(")[1].split(")")[0])
                        limit_arg = int(query.split("limit(")[1].split(")")[0])
                        result = collection.find(query_filter).sort(list(sort_arg.items())).limit(limit_arg)
                        return list(result)

                    # findOne({...}) or findOne({...}, {...})
                    elif ".findOne(" in query:
                        args = query.split("findOne(")[1].split(")")[0]
                        parts = args.split("},")
                        filter_arg = eval(parts[0] + '}')
                        projection = eval(parts[1]) if len(parts) > 1 else None
                        return collection.find_one(filter_arg, projection)

                    # find({...}, {...})
                    elif "find({" in query and "}, {" in query:
                        parts = query.split("find(")[1].split(")")
                        filter_part = parts[0].split("},")
                        query_filter = eval(filter_part[0] + '}')
                        projection = eval(filter_part[1]) if len(filter_part) > 1 else None
                        result = collection.find(query_filter, projection)
                        return list(result)

                    # find({})
                    elif "find({})" in query:
                        return list(collection.find({}))

                    # countDocuments({...})
                    elif "countDocuments(" in query:
                        count_arg = eval(query.split("countDocuments(")[1].split(")")[0])
                        return collection.count_documents(count_arg)

                    # find({}).count()
                    elif "find({}).count()" in query:
                        return collection.count_documents({})

                    else:
                        return "Unsupported query format."

                except Exception as e:
                    return f"Exception Error: {str(e)}"
            results=execute_query(mongo_query_str)
            def process_mongo_result(result):
                if isinstance(result, list):
                    for i in result:
                        i["embedding"] = 0
                return result
            final_result=process_mongo_result(results)
            print(final_result)
        except Exception as e:
            print("Error in mongo retreival:", e)
            return "An error occurred while processing your request."
            
        # Step 4: Generate final answer
        template_generate = '''You are an agent specialized in answering questions based on data retrieved from MongoDB.

The data retrieved from MongoDB is:
{data}

Question: {question}

Answer the question using only the retrieved data it must be a output in naturala language not a single word output. Provide a clear and concise response based on the data only, if data is present then it means the data has teh answer for the query if there is no data present then alone give output" such that no data present for this query given in natural language by adding the query also "'''
        prompt_generate = ChatPromptTemplate.from_template(template_generate)
        final_prompt=prompt_generate.format_messages(data=final_result,question=user_query)
        print(final_prompt)
        answer = llm_ge.invoke(final_prompt)
        print(answer)
        return answer.content

    except Exception as e:
        print("Error in answer generation:", e)
        return "An error occurred while processing your request."

@app.route('/ask', methods=['POST', 'OPTIONS'])
def ask():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    try:
        if not request.json or 'query' not in request.json:
            return jsonify({'error': 'Invalid request format'}), 400

        user_query = request.json['query']
        reply = answer(user_query)
        response = jsonify({'reply': reply})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        return response

    except Exception as e:
        print("Error in /ask endpoint:", e)
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)
