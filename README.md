# BFHL API

## Description
This is a REST API with `POST /bfhl` and `GET /health` endpoints built using Node.js and Express.

## Setup

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory (copy from `.env.example` if available) and configure your details:
    ```env
    PORT=3000
    EMAIL=your-email@chitkara.edu.in
    GEMINI_API_KEY=your_gemini_api_key_here
    ```
4.  Start the server:
    ```bash
    npm start
    ```

## API Endpoints

### POST /bfhl
Accepts exactly one of the following keys in the JSON body: `fibonacci`, `prime`, `lcm`, `hcf`, `AI`.

**Example:**
Request:
```json
{
  "fibonacci": 7
}
```
Response:
```json
{
  "is_success": true,
  "official_email": "your-email@chitkara.edu.in",
  "data": [0, 1, 1, 2, 3, 5, 8]
}
```

### GET /health
Returns health status.

**Response:**
```json
{
  "is_success": true,
  "official_email": "your-email@chitkara.edu.in"
}
```
