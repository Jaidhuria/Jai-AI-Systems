"""Health chatbot logic (NLTK) — shared by Flask app and Node worker."""
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

nltk.download("punkt", quiet=True)
nltk.download("punkt_tab", quiet=True)
nltk.download("stopwords", quiet=True)
nltk.download("wordnet", quiet=True)

INTENTS = {
    "greeting": ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
    "diabetes": ["diabetes", "glucose", "blood sugar", "insulin", "diabetic"],
    "flu": ["flu", "influenza", "fever", "cough", "sore throat"],
    "cold": ["cold", "runny nose", "sneezing", "congestion"],
    "general_health": ["health", "wellness", "exercise", "diet", "nutrition"],
    "goodbye": ["bye", "goodbye", "see you", "farewell"],
}

RESPONSES = {
    "greeting": "Hello! I'm your health assistant. How can I help you today?",
    "diabetes": "For diabetes management: Monitor your blood glucose regularly, follow your prescribed treatment plan, maintain a healthy diet, and exercise regularly. Always consult your healthcare provider for personalized advice.",
    "flu": "For flu symptoms: Rest, stay hydrated, use over-the-counter medications for symptom relief, and monitor your temperature. Seek medical attention if symptoms worsen or if you're in a high-risk group.",
    "cold": "For a common cold: Get plenty of rest, drink fluids, use saline nasal sprays, and consider over-the-counter cold medications. Most colds resolve within 7-10 days.",
    "general_health": "For general health: Eat a balanced diet, exercise regularly, get enough sleep, manage stress, and schedule regular check-ups with your healthcare provider.",
    "goodbye": "Take care of yourself! Remember to consult healthcare professionals for medical advice.",
    "default": "I'm here to help with health-related questions. For medical advice, please consult a qualified healthcare professional.",
}

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words("english"))


def preprocess_text(text):
    tokens = word_tokenize(text.lower())
    tokens = [
        lemmatizer.lemmatize(word)
        for word in tokens
        if word.isalnum() and word not in stop_words
    ]
    return tokens


def classify_intent(message):
    tokens = preprocess_text(message)
    for intent, keywords in INTENTS.items():
        if any(keyword in tokens for keyword in keywords):
            return intent
    return "default"


def get_chat_response(message):
    intent = classify_intent(message)
    return RESPONSES.get(intent, RESPONSES["default"])
