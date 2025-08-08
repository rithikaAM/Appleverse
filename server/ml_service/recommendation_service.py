import os
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS 
from pymongo import MongoClient

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Input

#######################
# 1) Flask App Setup  #
#######################
app = Flask(__name__)
CORS(app)

##############################
# 2) Connect to MongoDB      #
##############################
MONGO_URI = "mongodb://localhost:27017"
client = MongoClient(MONGO_URI)
db = client["appleverse"]           # The same DB your Node.js uses
collection = db["apples"]           # "apples" collection

##############################
# 3) Load Data from MongoDB  #
##############################
apple_docs = list(collection.find(
    {}, 
    {
        "_id": 1,
        "acno": 1,
        "accession": 1,
        "cultivar_name": 1,
        "images": 1,
        "e origin country": 1,
        "e origin province": 1,
        "e origin city": 1,
        "e pedigree": 1,
        "e genus": 1,
        "e species": 1,
    }
))

# Convert list of dicts to DataFrame
df = pd.DataFrame(apple_docs)
df.fillna("", inplace=True)
df["_id"] = df["_id"].astype(str)

##############################
# 4) Build Combined Features #
##############################
df["combined_features"] = (
    df["_id"] + " " +
    df["cultivar_name"] + " " +
    df["accession"] + " " +
    df["e origin country"] + " " +
    df["e origin province"] + " " +
    df["e origin city"] + " " +
    df["e pedigree"] + " " +
    df["e genus"] + " " +
    df["e species"]
)

##############################
# 5) TF-IDF Vectorization    #
##############################
vectorizer = TfidfVectorizer(stop_words="english")
tfidf_matrix = vectorizer.fit_transform(df["combined_features"])
tfidf_array = tfidf_matrix.toarray()
print("TF-IDF Matrix Shape:", tfidf_array.shape)

##############################
# 6) Dummy TensorFlow Model  #
##############################
# A simple model for demonstration (not used in the recommendation logic)
model = Sequential([
    Input(shape=(tfidf_array.shape[1],)),
    Dense(128, activation='relu'),
    Dense(64, activation='relu'),
    Dense(32, activation='relu'),
    Dense(1, activation='linear')
])
model.compile(optimizer='adam', loss='mean_squared_error')
model.summary()

# Generate random dummy labels (for training demonstration)
y_dummy = np.random.rand(df.shape[0])
model.fit(tfidf_array, y_dummy, epochs=10, batch_size=16, verbose=1)

##############################
# 7) KNN for Similarity      #
##############################
# Use a slightly larger number of neighbors to help catch an exact match
knn = NearestNeighbors(n_neighbors=8, metric="cosine")
knn.fit(tfidf_matrix)

##############################
# 8) search_apples_knn Func  #
##############################
def search_apples_knn(query, top_n=5):
    """
    Given a text query, returns the top_n similar apple varieties.
    If an exact match (by cultivar_name) is found, that result is prioritized as the Main Result.
    """
    query_vector = vectorizer.transform([query])
    # Retrieve extra results to help capture an exact match if not in the top_n
    distances, indices = knn.kneighbors(query_vector, n_neighbors=top_n+3)
    
    results = df.iloc[indices[0]].copy()
    results["Similarity Score"] = (1 - distances[0]).round(3)
    results_list = results.to_dict(orient="records")
    
    # Check for an exact match in "cultivar_name" (ignoring case and whitespace)
    exact_matches = [
        r for r in results_list 
        if r.get("cultivar_name", "").strip().lower() == query.strip().lower()
    ]
    
    if exact_matches:
        # Use the first exact match as the main result
        main_result = exact_matches[0]
        # Exclude the main result from the rest
        remaining = [r for r in results_list if r["_id"] != main_result["_id"]]
        # Sort the remaining by similarity score (descending)
        remaining = sorted(remaining, key=lambda r: r["Similarity Score"], reverse=True)
        similar_results = remaining[:top_n-1]
    else:
        # No exact match: use the first result as main, and next top_n-1 as similar
        main_result = results_list[0]
        similar_results = results_list[1:top_n]
    
    return {
        "Main Result": main_result,
        "Similar Results": similar_results
    }

##############################
# 9) Flask Endpoint          #
##############################
@app.route("/recommend", methods=["GET"])
def recommend():
    """
    Example usage:
      GET /recommend?query=king
    Returns a JSON with Main Result + Similar Results.
    """
    query = request.args.get("query", "").strip()
    if not query:
        return jsonify({"error": "No query provided"}), 400

    recommendations = search_apples_knn(query)
    return jsonify(recommendations)

##############################
# 10) Run the Flask Service  #
##############################
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
