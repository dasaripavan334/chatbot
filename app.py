import json
import random
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# MongoDB connection
try:
    client = MongoClient("mongodb://localhost:27017/")
    db = client['chatbot']
    users_collection = db['nlpchatbot']
    profiles_collection = db['profiles']  # Collection for storing user profiles
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    exit(1)

# Corrected file path with raw string
json_file_path = r'C:\Users\DASARI PAVAN KUMAR\OneDrive\Desktop\nlpchatbot\Nlpchtbot\nlpchatbot\intents.json'

try:
    # Load dataset from JSON file
    with open(json_file_path, 'r') as file:
        dataset = json.load(file)
except FileNotFoundError:
    print(f"Error: File not found at {json_file_path}")
    exit(1)
except json.JSONDecodeError:
    print("Error: Failed to decode JSON file. Please check the file format.")
    exit(1)

intents = dataset['intents']

# Prepare data for TF-IDF matching
patterns = [pattern for intent in intents for pattern in intent['patterns']]
responses = [random.choice(intent['responses']) for intent in intents for _ in intent['patterns']]  # Randomly choose a response from responses
tags = [intent['tag'] for intent in intents for _ in intent['patterns']]
# Initialize TF-IDF Vectorizer
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(patterns)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"message": "Invalid request. Please provide 'username' and 'password' in the request body."}), 400
    
    username = data['username']
    password = data['password']
    
    # Check if user already exists
    if users_collection.find_one({"username": username}):
        return jsonify({"message": "Username already exists. Please choose a different username."}), 400
    
    # Hash the password
    hashed_password = generate_password_hash(password)
    
    # Insert user into database
    try:
        result = users_collection.insert_one({"username": username, "password": hashed_password})
        print(f"User inserted with ID: {result.inserted_id}")
    except Exception as e:
        print(f"Error inserting user: {e}")
        return jsonify({"message": "Failed to signup user."}), 500
    
    return jsonify({"message": "Signup successful!"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"message": "Invalid request. Please provide 'username' and 'password' in the request body."}), 400
    
    username = data['username']
    password = data['password']
    
    # Find user in database
    try:
        user = users_collection.find_one({"username": username})
    except Exception as e:
        print(f"Error finding user: {e}")
        return jsonify({"message": "Failed to login user."}), 500
    
    if not user or not check_password_hash(user['password'], password):
        return jsonify({"message": "Invalid username or password."}), 401
    
    return jsonify({"message": "Login successful!"}), 200

# New endpoint to save profile details
@app.route('/save_profile', methods=['POST'])
def save_profile():
    data = request.get_json()

    if not data or 'name' not in data or 'email' not in data or 'gender' not in data:
        return jsonify({"message": "Invalid request. Please provide 'name', 'email', and 'gender'."}), 400

    name = data['name']
    email = data['email']
    gender = data['gender']

    # Insert profile into MongoDB
    try:
        result = profiles_collection.insert_one({"name": name, "email": email, "gender": gender})
        print(f"Profile inserted with ID: {result.inserted_id}")
    except Exception as e:
        print(f"Error inserting profile: {e}")
        return jsonify({"message": "Failed to save profile."}), 500

    return jsonify({"message": "Profile saved successfully!"}), 201

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    
    if not data or 'message' not in data:
        return jsonify({"message": "Invalid request. Please provide a 'message' in the request body."}), 400
    
    message = data['message'].lower()
    
    # Try pattern-based response first
    response = pattern_based_response(message)
    
    if response:
        return jsonify({"message": response})
    
    # If no pattern-based response, try TF-IDF matching
    response = tfidf_based_response(message)
    
    return jsonify({"message": response})

def pattern_based_response(message):
    for intent in intents:
        for pattern in intent['patterns']:
            if message in pattern.lower():  # Changed equality check to containment check
                return random.choice(intent['responses'])
    return None

def tfidf_based_response(message):
    # Vectorize the input message
    message_vector = vectorizer.transform([message])
    
    # Compute cosine similarity between message and patterns
    similarities = cosine_similarity(message_vector, X).flatten()
    
    # Find the index of the most similar pattern
    max_similarity_index = similarities.argmax()
    
    # Determine the intent based on the most similar pattern
    intent = tags[max_similarity_index]
    
    # Find the corresponding response
    for intent_data in intents:
        if intent_data['tag'] == intent:
            return random.choice(intent_data['responses'])
    
    return "I'm sorry, I don't understand that."

if __name__ == '__main__':
    app.run(debug=True)
