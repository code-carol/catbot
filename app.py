from flask import Flask, request, jsonify, render_template
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

chat = ChatOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.3
)

mood_prompt = ChatPromptTemplate.from_template(
    "Analyze if the following message indicates sadness or negative emotions."
    "Respond with only 'true' if they sound sad or negative, or 'false' if they don't: {message}"
)

chat_prompt = ChatPromptTemplate.from_template("""
You are a friendly and empathetic chatbot. Respond to the user's message in a natural, 
conversational way. 

User's message: {message}

Provide a helpful and engaging response.""")

mood_chain = mood_prompt | chat | StrOutputParser()
chat_chain = chat_prompt | chat | StrOutputParser()

def get_cat_image():
    """Fetch a random cat image from TheCatAPI"""
    headers = {
        'x-api-key': os.getenv('CAT_API_KEY')
    }
    response = requests.get('https://api.thecatapi.com/v1/images/search', headers=headers)
    return response.json()[0]['url']

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    data = request.json
    user_message = data.get('message', '')

    is_sad = mood_chain.invoke({"message": user_message}).strip().lower() == 'true'

    bot_response = chat_chain.invoke({
        "message": user_message,
    })

    response = {
        'message': bot_response,
        'is_sad': is_sad,
    }
    
    if is_sad:
        response['cat_image'] = get_cat_image()
        response['message'] += "\n\nHere's a cat picture to cheer you up! 🐱"
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)



