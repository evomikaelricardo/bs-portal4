# Bearer Authentication for PDF Generation APIs

## Overview

The following PDF generation endpoints use Bearer Token authentication instead of session-based authentication:

### Location-Agnostic Endpoints (Backward Compatible)
1. `POST /api/generate-pdf/staff-form-recruitment`
2. `POST /api/generate-pdf/customer-call-recruitment`
3. `POST /api/generate-pdf/staff-call-recruitment`

### Location-Specific Endpoints (Recommended)

**Baltimore:**
1. `POST /api/baltimore/generate-pdf/staff-form-recruitment`
2. `POST /api/baltimore/generate-pdf/customer-call-recruitment`
3. `POST /api/baltimore/generate-pdf/staff-call-recruitment`

**Pittsburgh:**
1. `POST /api/pittsburgh/generate-pdf/staff-form-recruitment`
2. `POST /api/pittsburgh/generate-pdf/customer-call-recruitment`
3. `POST /api/pittsburgh/generate-pdf/staff-call-recruitment`

**Note:** Location-specific endpoints generate PDFs with location names in the filename (e.g., `baltimore_staff_form_submissions_2025-11-18.pdf`)

## Security Implementation

**⚠️ Important Security Notice:** The bearer token is stored in a `config.json` file. This file is added to `.gitignore` to prevent accidental commits, but you must be extremely careful:

- ⚠️ **Never commit config.json to version control**
- ⚠️ **Never share config.json with anyone**
- ⚠️ **Keep backups of this file in a secure location**
- ⚠️ **Rotate the token regularly for better security**

## Setup Instructions

### 1. Configure the Bearer Token

The `config.json` file has been created in your project root with the following structure:

```json
{
  "apiBearerToken": "change-this-to-your-secure-token"
}
```

**Steps to set up:**

1. Open `config.json` in your project
2. Replace `"change-this-to-your-secure-token"` with your actual bearer token
3. Choose a strong, unique token (e.g., `"my-super-secret-token-xyz123"`)
4. Save the file

### 2. Restart the Server

After updating the token in `config.json`, restart your development server for the changes to take effect.

## API Usage Examples

### Example 1: Staff Form Recruitment PDF

**Important:** This endpoint uses the same format as the UI "PDF" button in the "Candidate Details" section.

**Primary Format (matches UI behavior):**
```bash
curl -X POST https://your-replit-url.repl.co/api/generate-pdf/staff-form-recruitment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-bearer-token-here" \
  -d '{
    "body": {
      "candidates": [
        {
          "row_number": 17,
          "GUID": "n6APsA",
          "result": "PROGRESSING",
          "location_id": "Baltimore,MD",
          "date_time": "11/17/2025 01:08:51",
          "phone_number": 7171234562,
          "contact_name": "long john2",
          "previous_location": "",
          "employment_period": "",
          "work_per_week": "Yes",
          "can_travel": "Yes",
          "one_year_experience": "Yes",
          "pay_rate": "Yes",
          "valid_driver_license": "",
          "reliable_transport": "Yes",
          "background_check": "Accept background check: Yes",
          "tb_test_negative": "Yes",
          "cpr_certificate": "Yes",
          "care_experience": "",
          "client_type": "",
          "experience_score": "",
          "compassion_score": "",
          "safety_score": "",
          "professionalism_score": "",
          "performance_summary": "",
          "red_flags": "",
          "follow_up_questions": "",
          "questions_asked": "",
          "email_address": "goodjohn@gsd.com",
          "callback_date": "",
          "consent_to_messages": true
        }
      ]
    }
  }' \
  --output staff_form_submissions.pdf
```

**Alternative formats (also supported):**
```bash
# Simple candidates wrapper
curl -X POST https://your-replit-url.repl.co/api/generate-pdf/staff-form-recruitment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-bearer-token-here" \
  -d '{"candidates": [{"GUID": "abc123", "date_time": "11/17/2025 01:08:51", ...}]}' \
  --output staff_form_submissions.pdf

# Direct array format
curl -X POST https://your-replit-url.repl.co/api/generate-pdf/staff-form-recruitment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-bearer-token-here" \
  -d '[{"GUID": "abc123", "date_time": "11/17/2025 01:08:51", ...}]' \
  --output staff_form_submissions.pdf
```

### Example 2: Customer Call Recruitment PDF

```bash
curl -X POST https://your-replit-url.repl.co/api/generate-pdf/customer-call-recruitment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-bearer-token-here" \
  -d '{
    "customers": [
      {
        "dateTime": "2024-01-15T14:30:00",
        "phoneNumber": "555-0200",
        "contactName": "Jane Smith",
        "zipCode": "12345",
        "serviceExperience": "positive"
      }
    ]
  }' \
  --output customer_call_recruitment.pdf
```

### Example 3: Staff Call Recruitment PDF

```bash
curl -X POST https://your-replit-url.repl.co/api/generate-pdf/staff-call-recruitment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-bearer-token-here" \
  -d '{
    "candidates": [
      {
        "dateTime": "2024-01-15T09:00:00",
        "phoneNumber": "555-0300",
        "contactName": "Bob Johnson",
        "result": "PASS",
        "oneYearExperience": "yes"
      }
    ]
  }' \
  --output staff_call_recruitment.pdf
```

### JavaScript/Node.js Example

```javascript
const fetch = require('node-fetch');
const fs = require('fs');

async function generatePDF() {
  // Using the same format as the UI "PDF" button
  const requestData = {
    body: {
      candidates: [
        {
          row_number: 17,
          GUID: "n6APsA",
          result: "PROGRESSING",
          location_id: "Baltimore,MD",
          date_time: "11/17/2025 01:08:51",
          phone_number: 7171234562,
          contact_name: "long john2",
          previous_location: "",
          employment_period: "",
          work_per_week: "Yes",
          can_travel: "Yes",
          one_year_experience: "Yes",
          pay_rate: "Yes",
          valid_driver_license: "",
          reliable_transport: "Yes",
          background_check: "Accept background check: Yes",
          tb_test_negative: "Yes",
          cpr_certificate: "Yes",
          care_experience: "",
          client_type: "",
          experience_score: "",
          compassion_score: "",
          safety_score: "",
          professionalism_score: "",
          performance_summary: "",
          red_flags: "",
          follow_up_questions: "",
          questions_asked: "",
          email_address: "goodjohn@gsd.com",
          callback_date: "",
          consent_to_messages: true
        }
      ]
    }
  };

  const response = await fetch('https://your-replit-url.repl.co/api/generate-pdf/staff-form-recruitment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-secret-bearer-token-here'
    },
    body: JSON.stringify(requestData)
  });

  if (response.ok) {
    const buffer = await response.buffer();
    fs.writeFileSync('output.pdf', buffer);
    console.log('PDF generated successfully!');
  } else {
    const error = await response.json();
    console.error('Error:', error);
  }
}

generatePDF();
```

### Python Example

```python
import requests

url = 'https://your-replit-url.repl.co/api/generate-pdf/staff-form-recruitment'
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-secret-bearer-token-here'
}

# Using the same format as the UI "PDF" button
data = {
    'body': {
        'candidates': [
            {
                'row_number': 17,
                'GUID': 'n6APsA',
                'result': 'PROGRESSING',
                'location_id': 'Baltimore,MD',
                'date_time': '11/17/2025 01:08:51',
                'phone_number': 7171234562,
                'contact_name': 'long john2',
                'previous_location': '',
                'employment_period': '',
                'work_per_week': 'Yes',
                'can_travel': 'Yes',
                'one_year_experience': 'Yes',
                'pay_rate': 'Yes',
                'valid_driver_license': '',
                'reliable_transport': 'Yes',
                'background_check': 'Accept background check: Yes',
                'tb_test_negative': 'Yes',
                'cpr_certificate': 'Yes',
                'care_experience': '',
                'client_type': '',
                'experience_score': '',
                'compassion_score': '',
                'safety_score': '',
                'professionalism_score': '',
                'performance_summary': '',
                'red_flags': '',
                'follow_up_questions': '',
                'questions_asked': '',
                'email_address': 'goodjohn@gsd.com',
                'callback_date': '',
                'consent_to_messages': True
            }
        ]
    }
}

response = requests.post(url, json=data, headers=headers)

if response.status_code == 200:
    with open('output.pdf', 'wb') as f:
        f.write(response.content)
    print('PDF generated successfully!')
else:
    print('Error:', response.json())
```

## Location-Specific API Examples

### Baltimore Staff Form Recruitment PDF

```bash
curl -X POST https://your-replit-url.repl.co/api/baltimore/generate-pdf/staff-form-recruitment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-bearer-token-here" \
  -d '{
    "body": {
      "candidates": [
        {
          "row_number": 17,
          "GUID": "n6APsA",
          "result": "PROGRESSING",
          "location_id": "Baltimore,MD",
          "date_time": "11/17/2025 01:08:51",
          "phone_number": 7171234562,
          "contact_name": "John Doe",
          "one_year_experience": "Yes",
          "work_per_week": "Yes",
          "email_address": "john@example.com"
        }
      ]
    }
  }' \
  --output baltimore_staff_form_submissions.pdf
```

### Pittsburgh Customer Call Recruitment PDF

```bash
curl -X POST https://your-replit-url.repl.co/api/pittsburgh/generate-pdf/customer-call-recruitment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-bearer-token-here" \
  -d '{
    "customers": [
      {
        "dateTime": "2024-01-15T14:30:00",
        "phoneNumber": "555-0200",
        "contactName": "Jane Smith",
        "zipCode": "15201",
        "serviceExperience": "positive"
      }
    ]
  }' \
  --output pittsburgh_customer_call_recruitment.pdf
```

### Baltimore Staff Call Recruitment PDF

```bash
curl -X POST https://your-replit-url.repl.co/api/baltimore/generate-pdf/staff-call-recruitment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-bearer-token-here" \
  -d '{
    "candidates": [
      {
        "dateTime": "2024-01-15T09:00:00",
        "phoneNumber": "555-0300",
        "contactName": "Bob Johnson",
        "result": "PASS",
        "oneYearExperience": "yes"
      }
    ]
  }' \
  --output baltimore_staff_call_recruitment.pdf
```

## Error Responses

### 401 Unauthorized - Missing Token
```json
{
  "error": "Unauthorized - Bearer token required"
}
```

### 401 Unauthorized - Invalid Token
```json
{
  "error": "Unauthorized - Invalid bearer token"
}
```

### 500 Server Error - Token Not Configured
```json
{
  "error": "Server configuration error"
}
```

## Security Best Practices

1. **Use a Strong Token:** Generate a random, complex string for your bearer token. You can use tools like:
   - Online UUID generators
   - Command line: `openssl rand -hex 32`
   - Node.js: `require('crypto').randomBytes(32).toString('hex')`

2. **Keep config.json Safe:**
   - The file is already in `.gitignore` to prevent git commits
   - Don't share it via email, Slack, or other channels
   - If you need to share access, generate a new token for each user/service

3. **Rotate Tokens Regularly:**
   - Change your token periodically (e.g., every 90 days)
   - Change immediately if you suspect it's been compromised
   - Simply update the value in `config.json` and restart the server

4. **Monitor Usage:**
   - Check your server logs for unauthorized access attempts
   - Failed authentication attempts will show as 401 errors in the logs
