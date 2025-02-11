from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)


#  MONGO DB CONNECTION

app.config["MONGO_URI"] = "mongodb://localhost:27017/Jsonfile"
mongo = PyMongo(app)
data_collection = mongo.db.data  # Collection in MongoDB

#  LOAD JSON DATA INTO MONGODB

def load_data():

    if data_collection.count_documents({}) == 0:
        try:
            with open("jsondata.json", "r", encoding="utf-8") as f:
                data = json.load(f)
                # Insert the data into the MongoDB collection
                data_collection.insert_many(data)
            print("✅ Data inserted into MongoDB!")
        except UnicodeDecodeError as e:
            print(f"❌ Error reading the file due to encoding: {e}")
        except Exception as e:
            print(f"❌ Error inserting data into MongoDB: {e}")
    else:
        print("✅ Data already exists in MongoDB!")



#  API ROUTES

@app.route("/data", methods=["GET"])
def get_data():
    """Fetch all records or filter by query parameters"""
    filters = {key: request.args.get(key) for key in ["country", "topic", "sector", "region", "end_year"]}
    filters = {k: v for k, v in filters.items() if v}  # Remove empty filters

    results = list(data_collection.find(filters, {"_id": 0}))  # Fetch from MongoDB, exclude _id
    return jsonify(results)

@app.route("/stats", methods=["GET"])
def get_statistics():
    """Return aggregated statistics (Average intensity per sector)"""
    stats = data_collection.aggregate([
        {"$group": {"_id": "$sector", "avg_intensity": {"$avg": "$intensity"}}}
    ])
    return jsonify(list(stats))

@app.route("/data/<string:topic>", methods=["GET"])
def get_by_topic(topic):
    """Fetch records by topic"""
    results = list(data_collection.find({"topic": topic}, {"_id": 0}))
    return jsonify(results)


# START APP

if __name__ == "__main__":
    load_data()  # Load data on startup
    app.run(debug=True)