# app/__test__/test_api_routes.py


import unittest
import requests
import json

# The base URL for the running Next.js development server
BASE_URL = "http://localhost:3000/api"

class TestApiRoutes(unittest.TestCase):

    # =================================================================
    # Tests for /api/mentions
    # =================================================================

    def test_mentions_success(self):
        """
        Tests the GET /api/mentions endpoint for a successful response.
        This performs a LIVE API call to your endpoint, which in turn calls Reddit and OpenAI.
        """
        print("\nRunning test: GET /api/mentions (live call)...")
        # The mentions route uses a GET request with a query parameter[cite: 133].
        response = requests.get(f"{BASE_URL}/mentions", params={"brandQuery": "OpenAI"})
        
        self.assertEqual(response.status_code, 200, "Expected a 200 OK status code.")
        
        # The response should be a JSON list[cite: 144].
        data = response.json()
        self.assertIsInstance(data, list, "Expected the response body to be a JSON list.")
        
        # If mentions are found, check the structure of the first item.
        if data:
            mention = data[0]
            # The route adds several keys after analysis[cite: 142, 143].
            self.assertIn("id", mention)
            self.assertIn("text", mention)
            self.assertIn("sentiment", mention)
            self.assertIn("tone", mention)
            self.assertIn("riskScore", mention)
            self.assertIn("geminiRiskLevel", mention) # Corresponds to aiAnalysis.riskLevel [cite: 142]
            print(f"Successfully found {len(data)} mentions for 'OpenAI'.")

    def test_mentions_missing_query(self):
        """
        Tests the GET /api/mentions endpoint for the expected error when brandQuery is missing.
        """
        print("Running test: GET /api/mentions (missing query)...")
        response = requests.get(f"{BASE_URL}/mentions")
        
        # The route should return a 400 Bad Request if the query is missing[cite: 135].
        self.assertEqual(response.status_code, 400, "Expected a 400 status for a missing brand query.")
        
        error_data = response.json()
        self.assertIn("error", error_data, "Expected an 'error' key in the JSON response.")
        self.assertEqual(error_data["error"], "Brand query is required", "Incorrect error message.")
        print("Successfully received 400 error for missing query.")

    # =================================================================
    # Tests for /api/assist
    # =================================================================

    def test_assist_success(self):
        """
        Tests the POST /api/assist endpoint for a successful response.
        This performs a LIVE API call to OpenAI via your endpoint.
        """
        print("\nRunning test: POST /api/assist (live call)...")
        # The assist route expects a POST request with a JSON body[cite: 149].
        mock_mention_context = {
            "mentionId": "test-123",
            "mentionContext": {
                "text": "The customer service was incredibly helpful and solved my issue in minutes!",
                "source": "Reddit",
                "sentiment": "Positive",
                "tone": "Appreciative",
                "intent": "Compliment",
                "keyPhrases": ["customer service", "incredibly helpful", "solved my issue"],
                "geminiRiskLevel": "Low",
                "riskScore": 15
            }
        }
        
        response = requests.post(f"{BASE_URL}/assist", json=mock_mention_context)
        
        self.assertEqual(response.status_code, 200, "Expected a 200 OK status code.")
        
        data = response.json()
        # The route is expected to return a JSON object with 'suggestion' and 'strategy' keys[cite: 156, 175].
        self.assertIsInstance(data, dict, "Expected response to be a JSON object.")
        self.assertIn("suggestion", data, "Response JSON is missing the 'suggestion' key.")
        self.assertIn("strategy", data, "Response JSON is missing the 'strategy' key.")
        self.assertIsInstance(data["suggestion"], str, "'suggestion' should be a string.")
        self.assertIsInstance(data["strategy"], str, "'strategy' should be a string.")
        print("Successfully received AI assistance with suggestion and strategy.")

    def test_assist_missing_context(self):
        """
        Tests the POST /api/assist endpoint for the error when mentionContext is missing.
        """
        print("Running test: POST /api/assist (missing context)...")
        # Send a request with a missing 'mentionContext' payload.
        response = requests.post(f"{BASE_URL}/assist", json={"mentionId": "test-456"})
        
        # The route should return a 400 Bad Request if context is missing[cite: 150].
        self.assertEqual(response.status_code, 400, "Expected a 400 status for missing context.")
        
        error_data = response.json()
        self.assertIn("error", error_data)
        self.assertEqual(error_data["error"], "Mention context (including text) is required", "Incorrect error message.")
        print("Successfully received 400 error for missing context.")

if __name__ == '__main__':
    unittest.main(verbosity=2)