import requests
import time
from flask import Flask, request, jsonify
from flask_cors import CORS

class BudgetChatbot:
    def __init__(self, api_key):
        self.api_url = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1"
        self.headers = {"Authorization": f"Bearer {api_key}"}
        self.currency = "DZD"
    
    def ask(self, question):
        prompt = f"""As an  algerian expert  financial advisor, provide:
        1. 3 specific actions
        2. Cost estimates in {self.currency}
        3. a detailed explanation of each action but in concise way 
        4. 3 recommendations if needed
        
        for {question}
    
        
        """
        
        for _ in range(3):  # Retry up to 3 times
            try:
                response = requests.post(
                    self.api_url,
                    headers=self.headers,
                    json={"inputs": prompt},
                    timeout=30
                )
                
                if response.status_code == 200:
                    return response.json()[0]['generated_text']
                elif response.status_code == 503:
                    wait_time = 30  # Model loading time
                    print(f"Model is loading, waiting {wait_time} seconds...")
                    time.sleep(wait_time)
                    continue
                else:
                    raise Exception(f"API Error {response.status_code}: {response.text}")
            
            except requests.exceptions.RequestException as e:
                raise Exception(f"Connection failed. Please check:\n1. Internet connection\n2. API key validity\n3. Service status at huggingface.co/status\nError: {str(e)}")
        
        raise Exception("Max retries reached. Please try again later.")

# --- Flask API ---
app = Flask(__name__)
CORS(app)  # Allow requests from frontend
API_KEY = "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"  # You may want to load this from env in production
chatbot = BudgetChatbot(API_KEY)

@app.route('/ask_chatbot', methods=['POST'])
def ask_chatbot():
    data = request.get_json()
    message = data.get('message', '')
    if not message:
        return jsonify({'error': 'No message provided'}), 400
    try:
        response = chatbot.ask(message)
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- CLI remains unchanged ---
def main():
    API_KEY = "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"  # Get from huggingface.co/settings/tokens
    try:
        chatbot = BudgetChatbot(API_KEY)
        print("=== Algerian Financial Advisor ===")
        print("Ask money-related questions (type 'quit' to exit)\n")
        while True:
            user_input = input("You: ").strip()
            if user_input.lower() in ['quit', 'exit']:
                break
            try:
                print("\nAI:", chatbot.ask(user_input), "\n")
            except Exception as e:
                print(f"\n⚠️ {str(e)}\n")
    except KeyboardInterrupt:
        print("\nExiting...")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == 'api':
        app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        main()