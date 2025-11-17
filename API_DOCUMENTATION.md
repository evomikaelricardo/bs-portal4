# Interview Evaluation System - REST API Documentation

## Overview
The Interview Evaluation System provides REST API endpoints for uploading CSV files containing candidate interview data and managing evaluation records.

## Base URL
All API endpoints are prefixed with `/api`

## Endpoints

### 1. Health Check
Check if the API is running.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "message": "Interview Evaluation API is running"
}
```

---

### 2. Upload CSV File
Upload a CSV file containing candidate interview evaluations.

**Endpoint:** `POST /api/upload-csv`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file` (required): CSV file containing candidate data

**CSV Format:**
The CSV file should have the following headers:
- Result, DateTime, PhoneNumber, ContactName, PreviousLocation, EmploymentPeriod
- WorkPerWeek, CanTravel, OneYearExperience, ValidDriverLicense, ReliableTransport
- PayRate, DementiaClient, BackgroundCheck, TBTestNegative, CPRCertificate
- Experience, ClientType, CaregiverQuality, ClientRefusal, FirstAction
- Phone2, EmailAddress

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/upload-csv \
  -F "file=@candidates.csv"
```

**Success Response (200):**
```json
{
  "sessionId": "uuid-string",
  "candidateCount": 3,
  "candidates": [
    {
      "result": "PASS",
      "dateTime": "10/31/2025, 1:47:12 AM",
      "phoneNumber": "6311301801",
      "contactName": "Frederick Alfredo",
      "previousLocation": "Jakarta",
      "employmentPeriod": "2005, for 8 months",
      "workPerWeek": "Yes",
      "canTravel": "Yes",
      "oneYearExperience": "Yes",
      "validDriverLicense": "No",
      "reliableTransport": "Yes",
      "emailAddress": "fred@gmail.com",
      ...
    }
  ],
  "errors": []
}
```

**Error Response (400):**
```json
{
  "error": "No file uploaded"
}
```

---

### 3. Generate PDF from JSON Data
Generate a PDF report directly from JSON candidate data.

**Endpoint:** `POST /api/generate-pdf-json`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "candidates": [
    {
      "guid": "optional-guid",
      "result": "PASS",
      "dateTime": "11/3/2025, 09:25:10",
      "phoneNumber": "6311201821",
      "contactName": "Michael Jordan",
      "previousLocation": "none",
      "employmentPeriod": "never",
      "workPerWeek": "yes",
      "canTravel": "yes",
      "oneYearExperience": "yes",
      "validDriverLicense": "yes",
      "reliableTransport": "yes",
      "payRate": "Yes",
      "emailAddress": "michael.jordan@nba.com",
      "experienceScore": "4",
      "compassionScore": "4",
      "safetyScore": "4",
      "professionalismScore": "4",
      "performanceSummary": "Michael has experience providing companionship.",
      "redFlags": "none",
      "followUpQuestions": "How do you help a client with dementia?",
      "questionsAsked": "What is your experience with elderly care?"
    }
  ]
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/generate-pdf-json \
  -H "Content-Type: application/json" \
  -d '{
    "candidates": [
      {
        "dateTime": "11/3/2025, 09:25:10",
        "phoneNumber": "6311201821",
        "contactName": "Michael Jordan",
        "result": "PASS",
        "emailAddress": "michael.jordan@nba.com",
        "experienceScore": "4",
        "compassionScore": "4",
        "safetyScore": "4",
        "professionalismScore": "4"
      }
    ]
  }' \
  --output report.pdf
```

**Success Response (200):**
Returns a PDF file (binary) with headers:
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="candidates_evaluation_YYYY-MM-DD_XXXXXXXX.pdf"`

**Error Response (400):**
```json
{
  "error": "Invalid JSON data",
  "details": [
    {
      "path": ["candidates", 0, "phoneNumber"],
      "message": "Required"
    }
  ]
}
```

**Required Fields:**
- `dateTime` (string) - Interview date and time
- `phoneNumber` (string) - Candidate's phone number
- `contactName` (string) - Candidate's full name

**Optional Fields:**
- `guid`, `result`, `previousLocation`, `employmentPeriod`, `workPerWeek`, `canTravel`
- `oneYearExperience`, `validDriverLicense`, `reliableTransport`, `payRate`
- `dementiaClient`, `backgroundCheck`, `tbTestNegative`, `cprCertificate`
- `experience`, `clientType`, `caregiverQuality`, `clientRefusal`, `firstAction`
- `phone2`, `emailAddress`
- `experienceScore`, `compassionScore`, `safetyScore`, `professionalismScore`
- `performanceSummary`, `redFlags`, `followUpQuestions`, `questionsAsked`, `callbackDate`

**Note:** All field values should be strings, matching the CSV format

---

### 4. Get Candidates by Session
Retrieve all candidates for a specific session.

**Endpoint:** `GET /api/candidates/:sessionId`

**Parameters:**
- `sessionId` (required): Session ID returned from the upload endpoint

**Example Request:**
```bash
curl http://localhost:5000/api/candidates/uuid-string
```

**Success Response (200):**
```json
{
  "candidates": [
    {
      "result": "PASS",
      "dateTime": "10/31/2025, 1:47:12 AM",
      "phoneNumber": "6311301801",
      "contactName": "Frederick Alfredo",
      ...
    }
  ]
}
```

**Error Response (404):**
```json
{
  "error": "No candidates found for this session"
}
```

---

### 5. Clear Candidates
Delete all candidates for a specific session.

**Endpoint:** `DELETE /api/candidates/:sessionId`

**Parameters:**
- `sessionId` (required): Session ID to clear

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/candidates/uuid-string
```

**Success Response (200):**
```json
{
  "message": "Candidates cleared successfully"
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid input)
- `404`: Not Found
- `500`: Internal Server Error

Error responses include a descriptive error message:
```json
{
  "error": "Error description"
}
```

## File Upload Constraints
- Maximum file size: 10MB
- Accepted formats: CSV (.csv)
- File must contain valid CSV headers and at least one data row

## Integration Example

### JavaScript/TypeScript
```typescript
// Upload CSV file
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/upload-csv', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(`Uploaded ${data.candidateCount} candidates`);
console.log(`Session ID: ${data.sessionId}`);

// Retrieve candidates
const candidatesResponse = await fetch(`/api/candidates/${data.sessionId}`);
const candidatesData = await candidatesResponse.json();
console.log(candidatesData.candidates);
```

### Python
```python
import requests

# Upload CSV file
with open('candidates.csv', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:5000/api/upload-csv', files=files)
    data = response.json()
    print(f"Uploaded {data['candidateCount']} candidates")
    session_id = data['sessionId']

# Retrieve candidates
response = requests.get(f'http://localhost:5000/api/candidates/{session_id}')
candidates = response.json()['candidates']
print(candidates)
```

### cURL
```bash
# Upload CSV
curl -X POST http://localhost:5000/api/upload-csv \
  -F "file=@candidates.csv"

# Get candidates (replace {sessionId} with actual session ID)
curl http://localhost:5000/api/candidates/{sessionId}

# Delete candidates
curl -X DELETE http://localhost:5000/api/candidates/{sessionId}
```

## Notes
- Session data is stored in-memory and will be lost when the server restarts
- For production use, consider implementing persistent storage (database)
- PDF generation can be done in two ways:
  - **CSV Upload** (`/api/upload-csv`): Returns PDF directly from uploaded CSV file
  - **JSON API** (`/api/generate-pdf-json`): Returns PDF from JSON data for integration with other systems
- Client-side PDF generation is also available for individual candidate reports
- The API does not require authentication (add authentication for production use)
- All JSON field names use camelCase format (e.g., `phoneNumber`, `contactName`)
