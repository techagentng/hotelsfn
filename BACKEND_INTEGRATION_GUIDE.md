# Backend Integration Guide - ID Document Upload

## 🎯 Quick Summary

The booking form now sends a **multipart/form-data** request with an optional ID document file.

---

## 📤 Frontend Payload

### Endpoint
```
POST /api/v1/reservations
Content-Type: multipart/form-data
```

### Form Fields

| Field Name | Type | Required | Example Value |
|------------|------|----------|---------------|
| `guest_id` | string | ✅ Yes | "123" |
| `room_id` | string | ✅ Yes | "456" |
| `check_in_date` | string | ✅ Yes | "2024-12-10" |
| `check_out_date` | string | ✅ Yes | "2024-12-15" |
| `number_of_guests` | string | ✅ Yes | "2" |
| `payment_method` | string | ✅ Yes | "credit_card" |
| `special_requests` | string | ❌ No | "High floor preferred" |
| `id_document` | File | ❌ No | passport.jpg (binary) |

---

## 📋 File Specifications

### `id_document` Field

**Type:** File (multipart/form-data)  
**Required:** No (optional)  
**Formats:** JPEG, JPG, PNG, WebP, PDF  
**Max Size:** 5MB  
**Validation:** Done on frontend, **must re-validate on backend**

---

## 🔧 Backend Implementation

### Option 1: Go (Gin Framework)

```go
package routes

import (
    "fmt"
    "io"
    "os"
    "path/filepath"
    "time"
    "github.com/gin-gonic/gin"
)

func CreateReservation(c *gin.Context) {
    // Parse multipart form (10MB max)
    if err := c.Request.ParseMultipartForm(10 << 20); err != nil {
        c.JSON(400, gin.H{"error": "Failed to parse form"})
        return
    }

    // Extract form values
    guestID := c.PostForm("guest_id")
    roomID := c.PostForm("room_id")
    checkIn := c.PostForm("check_in_date")
    checkOut := c.PostForm("check_out_date")
    numGuests := c.PostForm("number_of_guests")
    paymentMethod := c.PostForm("payment_method")
    specialRequests := c.PostForm("special_requests")

    // Handle file upload (optional)
    var idDocumentPath string
    file, header, err := c.Request.FormFile("id_document")
    
    if err == nil {
        defer file.Close()
        
        // Validate file type
        contentType := header.Header.Get("Content-Type")
        validTypes := []string{
            "image/jpeg",
            "image/jpg", 
            "image/png",
            "image/webp",
            "application/pdf",
        }
        
        isValid := false
        for _, t := range validTypes {
            if contentType == t {
                isValid = true
                break
            }
        }
        
        if !isValid {
            c.JSON(400, gin.H{"error": "Invalid file type"})
            return
        }
        
        // Validate file size (5MB)
        if header.Size > 5*1024*1024 {
            c.JSON(400, gin.H{"error": "File size exceeds 5MB"})
            return
        }
        
        // Generate unique filename
        ext := filepath.Ext(header.Filename)
        filename := fmt.Sprintf("%d_%s%s", time.Now().Unix(), guestID, ext)
        uploadPath := filepath.Join("uploads", "id_documents", filename)
        
        // Create directory if not exists
        os.MkdirAll(filepath.Dir(uploadPath), 0755)
        
        // Save file
        dst, err := os.Create(uploadPath)
        if err != nil {
            c.JSON(500, gin.H{"error": "Failed to save file"})
            return
        }
        defer dst.Close()
        
        if _, err := io.Copy(dst, file); err != nil {
            c.JSON(500, gin.H{"error": "Failed to save file"})
            return
        }
        
        idDocumentPath = uploadPath
    }

    // Create reservation
    reservation := Reservation{
        GuestID:         guestID,
        RoomID:          roomID,
        CheckInDate:     checkIn,
        CheckOutDate:    checkOut,
        NumberOfGuests:  numGuests,
        PaymentMethod:   paymentMethod,
        SpecialRequests: specialRequests,
        IDDocumentPath:  idDocumentPath,
    }
    
    // Save to database
    if err := db.Create(&reservation).Error; err != nil {
        c.JSON(500, gin.H{"error": "Failed to create reservation"})
        return
    }
    
    c.JSON(200, gin.H{
        "message": "Reservation created successfully",
        "data":    reservation,
    })
}
```

### Option 2: Node.js (Express + Multer)

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/id_documents/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${req.body.guest_id}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Route
router.post('/reservations', upload.single('id_document'), async (req, res) => {
  try {
    const {
      guest_id,
      room_id,
      check_in_date,
      check_out_date,
      number_of_guests,
      payment_method,
      special_requests
    } = req.body;
    
    const idDocumentPath = req.file ? req.file.path : null;
    
    const reservation = await Reservation.create({
      guest_id,
      room_id,
      check_in_date,
      check_out_date,
      number_of_guests,
      payment_method,
      special_requests,
      id_document_path: idDocumentPath
    });
    
    res.json({
      message: 'Reservation created successfully',
      data: reservation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Option 3: Python (Flask)

```python
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import time

UPLOAD_FOLDER = 'uploads/id_documents'
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp', 'pdf'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/v1/reservations', methods=['POST'])
def create_reservation():
    # Get form data
    guest_id = request.form.get('guest_id')
    room_id = request.form.get('room_id')
    check_in_date = request.form.get('check_in_date')
    check_out_date = request.form.get('check_out_date')
    number_of_guests = request.form.get('number_of_guests')
    payment_method = request.form.get('payment_method')
    special_requests = request.form.get('special_requests')
    
    # Handle file upload
    id_document_path = None
    if 'id_document' in request.files:
        file = request.files['id_document']
        
        if file and allowed_file(file.filename):
            # Check file size
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)
            
            if file_size > MAX_FILE_SIZE:
                return jsonify({'error': 'File size exceeds 5MB'}), 400
            
            # Save file
            filename = secure_filename(f"{int(time.time())}_{guest_id}_{file.filename}")
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            file.save(filepath)
            id_document_path = filepath
    
    # Create reservation
    reservation = Reservation(
        guest_id=guest_id,
        room_id=room_id,
        check_in_date=check_in_date,
        check_out_date=check_out_date,
        number_of_guests=number_of_guests,
        payment_method=payment_method,
        special_requests=special_requests,
        id_document_path=id_document_path
    )
    
    db.session.add(reservation)
    db.session.commit()
    
    return jsonify({
        'message': 'Reservation created successfully',
        'data': reservation.to_dict()
    }), 200
```

---

## 🗄️ Database Schema

### Update Reservations Table

```sql
-- Add column for ID document path
ALTER TABLE reservations 
ADD COLUMN id_document_path VARCHAR(500);

-- Or in migration
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    guest_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INTEGER NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    special_requests TEXT,
    id_document_path VARCHAR(500),  -- NEW FIELD
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📁 File Storage

### Recommended Directory Structure

```
project_root/
├── uploads/
│   └── id_documents/
│       ├── 1733400000_123_passport.jpg
│       ├── 1733400100_456_license.pdf
│       └── 1733400200_789_id_card.png
```

### Filename Format

```
{timestamp}_{guest_id}_{original_filename}
```

Example: `1733400000_123_passport.jpg`

---

## 🔒 Security Checklist

### Must Implement

- [ ] **Re-validate file type** on server (don't trust client)
- [ ] **Re-validate file size** on server (5MB max)
- [ ] **Scan for malware** (use antivirus library)
- [ ] **Generate unique filenames** (prevent overwrites)
- [ ] **Store outside web root** (prevent direct access)
- [ ] **Implement access controls** (only authorized users)
- [ ] **Use secure file permissions** (chmod 644 or 600)
- [ ] **Log file uploads** (audit trail)

### Recommended

- [ ] Encrypt files at rest
- [ ] Use cloud storage (S3, Azure Blob, etc.)
- [ ] Implement file retention policy
- [ ] Add watermarks to images
- [ ] Generate thumbnails for images

---

## 🧪 Testing

### Test Cases

1. **Upload JPEG image** → Should save successfully
2. **Upload PNG image** → Should save successfully
3. **Upload PDF file** → Should save successfully
4. **Upload without file** → Should create reservation without file
5. **Upload invalid type** → Should return 400 error
6. **Upload > 5MB** → Should return 400 error
7. **Upload with special chars** → Should sanitize filename

### Sample cURL Commands

```bash
# With ID document
curl -X POST http://localhost:8080/api/v1/reservations \
  -F "guest_id=123" \
  -F "room_id=456" \
  -F "check_in_date=2024-12-10" \
  -F "check_out_date=2024-12-15" \
  -F "number_of_guests=2" \
  -F "payment_method=credit_card" \
  -F "special_requests=High floor" \
  -F "id_document=@/path/to/passport.jpg"

# Without ID document
curl -X POST http://localhost:8080/api/v1/reservations \
  -F "guest_id=123" \
  -F "room_id=456" \
  -F "check_in_date=2024-12-10" \
  -F "check_out_date=2024-12-15" \
  -F "number_of_guests=2" \
  -F "payment_method=credit_card"
```

---

## 📊 Response Format

### Success Response

```json
{
  "message": "Reservation created successfully",
  "data": {
    "id": 789,
    "guest_id": 123,
    "room_id": 456,
    "check_in_date": "2024-12-10",
    "check_out_date": "2024-12-15",
    "number_of_guests": 2,
    "payment_method": "credit_card",
    "special_requests": "High floor preferred",
    "id_document_path": "uploads/id_documents/1733400000_123_passport.jpg",
    "created_at": "2024-12-05T12:00:00Z"
  }
}
```

### Error Responses

```json
// Invalid file type
{
  "error": "Invalid file type. Allowed: JPEG, PNG, WebP, PDF"
}

// File too large
{
  "error": "File size exceeds 5MB"
}

// Missing required fields
{
  "error": "Missing required field: guest_id"
}
```

---

## 🚀 Quick Start

### 1. Update Endpoint
Change from JSON to multipart/form-data

### 2. Add File Handler
Parse `id_document` from request

### 3. Validate File
Check type, size, content

### 4. Save File
Store to disk or cloud

### 5. Update Database
Add `id_document_path` column

### 6. Test
Use cURL or Postman

---

## 📞 Support

If you need help integrating this feature, refer to:
- **Full Documentation:** `BOOKING_ID_UPLOAD_FEATURE.md`
- **Frontend Code:** `/pages/bookings/new.tsx` (lines 203-235)

---

**Status:** ⏳ Awaiting Backend Implementation  
**Priority:** Medium  
**Estimated Time:** 2-4 hours
