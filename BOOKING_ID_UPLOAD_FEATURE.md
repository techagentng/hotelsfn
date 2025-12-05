# Booking Form - ID Document Upload Feature

## ✅ Implementation Complete

Added ID document upload functionality to the new booking form with image preview and file validation.

---

## 🎯 Features Implemented

### 1. **File Upload**
- Upload guest ID documents (Passport, Driver's License, etc.)
- Drag-and-drop interface
- Click to browse files

### 2. **File Validation**
- **Supported Formats:** JPEG, JPG, PNG, WebP, PDF
- **Max File Size:** 5MB
- **Validation Messages:** Clear error feedback

### 3. **Image Preview**
- Live preview for image files (JPEG, PNG, WebP)
- Thumbnail display (96x96px)
- Click to view full size in new tab
- Hover effect with eye icon

### 4. **File Management**
- Display file name, size, and type
- Remove uploaded file button
- Re-upload capability

---

## 📍 Location

**File:** `/pages/bookings/new.tsx`  
**Section:** Guest Information form  
**Position:** Between "ID Number" and "Number of Guests" fields

---

## 🎨 UI Components

### Upload State (No File)
```
┌─────────────────────────────────────────────────┐
│ 📄 Upload ID Document (Optional)                │
│ Upload a copy of the guest's ID                 │
│                                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │  ⬆️  Click to upload or drag and drop       │ │
│ └─────────────────────────────────────────────┘ │
│ Supported formats: JPEG, PNG, WebP, PDF (Max 5MB)│
└─────────────────────────────────────────────────┘
```

### Preview State (Image Uploaded)
```
┌─────────────────────────────────────────────────┐
│ 📄 Upload ID Document (Optional)                │
│                                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ [Preview]  passport.jpg              [X]    │ │
│ │  96x96     245.67 KB                        │ │
│ │            image/jpeg                        │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Preview State (PDF Uploaded)
```
┌─────────────────────────────────────────────────┐
│ 📄 Upload ID Document (Optional)                │
│                                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ [📄 Icon]  id_document.pdf           [X]    │ │
│ │            512.34 KB                        │ │
│ │            application/pdf                   │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 💻 Code Implementation

### State Management

```typescript
// ID Document upload state
const [idDocument, setIdDocument] = useState<File | null>(null);
const [idDocumentPreview, setIdDocumentPreview] = useState<string | null>(null);
```

### File Upload Handler

```typescript
const handleIdDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    setError('Please upload a valid image (JPEG, PNG, WebP) or PDF file');
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    setError('File size must be less than 5MB');
    return;
  }

  setIdDocument(file);
  setError(null);

  // Create preview for images
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setIdDocumentPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  } else {
    // For PDFs, just show file info
    setIdDocumentPreview(null);
  }
};
```

### Remove Document Handler

```typescript
const handleRemoveDocument = () => {
  setIdDocument(null);
  setIdDocumentPreview(null);
};
```

---

## 📤 API Integration

### Updated Endpoint

```
POST /api/v1/reservations
Content-Type: multipart/form-data
```

### Request Payload (FormData)

```typescript
const formDataToSend = new FormData();
formDataToSend.append('guest_id', formData.guestId);
formDataToSend.append('room_id', formData.roomId);
formDataToSend.append('check_in_date', formData.checkIn);
formDataToSend.append('check_out_date', formData.checkOut);
formDataToSend.append('number_of_guests', formData.guestCount.toString());
formDataToSend.append('payment_method', 'credit_card');

if (formData.specialRequests) {
  formDataToSend.append('special_requests', formData.specialRequests);
}

// Add ID document if uploaded
if (idDocument) {
  formDataToSend.append('id_document', idDocument);
}
```

### Axios Request

```typescript
const response = await axios.post('/reservations', formDataToSend, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

---

## 🔧 Backend Requirements

### Expected Backend Endpoint

```
POST /api/v1/reservations
```

### Request Format

**Content-Type:** `multipart/form-data`

### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `guest_id` | string | Yes | Guest ID |
| `room_id` | string | Yes | Room ID |
| `check_in_date` | string | Yes | YYYY-MM-DD format |
| `check_out_date` | string | Yes | YYYY-MM-DD format |
| `number_of_guests` | string | Yes | Number of guests |
| `payment_method` | string | Yes | Payment method (default: 'credit_card') |
| `special_requests` | string | No | Special requests |
| `id_document` | File | No | ID document file (image or PDF) |

### File Field Details

**Field Name:** `id_document`  
**Type:** File (multipart/form-data)  
**Formats:** JPEG, JPG, PNG, WebP, PDF  
**Max Size:** 5MB  

### Sample Backend Handler (Go)

```go
func CreateReservation(c *gin.Context) {
    // Parse multipart form
    err := c.Request.ParseMultipartForm(10 << 20) // 10MB max
    if err != nil {
        c.JSON(400, gin.H{"error": "Failed to parse form"})
        return
    }

    // Get form values
    guestID := c.PostForm("guest_id")
    roomID := c.PostForm("room_id")
    checkIn := c.PostForm("check_in_date")
    checkOut := c.PostForm("check_out_date")
    numGuests := c.PostForm("number_of_guests")
    paymentMethod := c.PostForm("payment_method")
    specialRequests := c.PostForm("special_requests")

    // Get uploaded file (optional)
    file, header, err := c.Request.FormFile("id_document")
    var idDocumentPath string
    
    if err == nil {
        defer file.Close()
        
        // Validate file type
        contentType := header.Header.Get("Content-Type")
        validTypes := []string{"image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"}
        if !contains(validTypes, contentType) {
            c.JSON(400, gin.H{"error": "Invalid file type"})
            return
        }
        
        // Validate file size (5MB)
        if header.Size > 5*1024*1024 {
            c.JSON(400, gin.H{"error": "File too large"})
            return
        }
        
        // Save file
        filename := fmt.Sprintf("id_documents/%d_%s", time.Now().Unix(), header.Filename)
        idDocumentPath = filename
        
        // Save to disk or cloud storage
        // ... save logic here ...
    }

    // Create reservation with id_document_path
    reservation := Reservation{
        GuestID:        guestID,
        RoomID:         roomID,
        CheckInDate:    checkIn,
        CheckOutDate:   checkOut,
        NumberOfGuests: numGuests,
        PaymentMethod:  paymentMethod,
        SpecialRequests: specialRequests,
        IDDocumentPath: idDocumentPath, // Store file path
    }
    
    // Save to database
    // ... database logic ...
    
    c.JSON(200, gin.H{
        "message": "Reservation created successfully",
        "data": reservation,
    })
}
```

---

## 🎨 Styling Details

### Upload Button (Empty State)
```css
- Border: 2px dashed gray-300
- Hover: border-indigo-500, bg-indigo-50
- Icon: Upload icon, gray-400
- Text: gray-600
```

### Preview Container
```css
- Border: 1px solid gray-300
- Padding: 16px
- Border radius: 8px
```

### Image Preview
```css
- Size: 96x96px
- Object-fit: cover
- Border: 1px solid gray-200
- Border radius: 4px
- Hover overlay: black 50% opacity with eye icon
```

### File Info
```css
- Filename: text-sm, font-medium, gray-900
- Size: text-xs, gray-500
- Type: text-xs, gray-500
```

### Remove Button
```css
- Color: red-600
- Hover: red-700
- Icon: X icon, 20x20px
```

---

## ✨ User Experience

### Upload Flow
1. User clicks upload area or drags file
2. File is validated (type and size)
3. If valid:
   - Image: Preview generated and displayed
   - PDF: File icon displayed with info
4. User can click preview to view full size
5. User can remove and re-upload

### Validation Messages
- ❌ "Please upload a valid image (JPEG, PNG, WebP) or PDF file"
- ❌ "File size must be less than 5MB"
- ✅ File uploaded successfully (no message, shows preview)

---

## 🧪 Testing Checklist

### File Upload
- [ ] Upload JPEG image
- [ ] Upload PNG image
- [ ] Upload WebP image
- [ ] Upload PDF file
- [ ] Try uploading invalid file type (e.g., .txt)
- [ ] Try uploading file > 5MB
- [ ] Verify file size validation
- [ ] Verify file type validation

### Preview
- [ ] Image preview displays correctly
- [ ] Image preview is clickable
- [ ] Full image opens in new tab
- [ ] PDF shows file icon (no preview)
- [ ] File info displays correctly (name, size, type)

### Functionality
- [ ] Remove button works
- [ ] Can re-upload after removing
- [ ] Form submits with file
- [ ] Form submits without file (optional)
- [ ] File is included in FormData payload

### Edge Cases
- [ ] Upload file, then select existing guest (file persists)
- [ ] Clear guest selection (file persists)
- [ ] Submit form without file (should work)
- [ ] Upload very small file (< 1KB)
- [ ] Upload file with special characters in name

---

## 📊 File Size Display

Files are displayed in KB with 2 decimal places:
```typescript
{(idDocument.size / 1024).toFixed(2)} KB
```

Examples:
- 1024 bytes → "1.00 KB"
- 245678 bytes → "239.92 KB"
- 5242880 bytes → "5120.00 KB"

---

## 🔒 Security Considerations

### Frontend Validation
- ✅ File type validation
- ✅ File size validation (5MB limit)
- ✅ Preview only for images (not executable files)

### Backend Requirements
- ⚠️ Re-validate file type on server
- ⚠️ Re-validate file size on server
- ⚠️ Scan for malware
- ⚠️ Store in secure location
- ⚠️ Generate unique filenames
- ⚠️ Implement access controls

---

## 📝 Sample Payload

### With ID Document
```
POST /api/v1/reservations
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="guest_id"

123
------WebKitFormBoundary
Content-Disposition: form-data; name="room_id"

456
------WebKitFormBoundary
Content-Disposition: form-data; name="check_in_date"

2024-12-10
------WebKitFormBoundary
Content-Disposition: form-data; name="check_out_date"

2024-12-15
------WebKitFormBoundary
Content-Disposition: form-data; name="number_of_guests"

2
------WebKitFormBoundary
Content-Disposition: form-data; name="payment_method"

credit_card
------WebKitFormBoundary
Content-Disposition: form-data; name="id_document"; filename="passport.jpg"
Content-Type: image/jpeg

[binary data]
------WebKitFormBoundary--
```

---

## 🎯 Next Steps for Backend

1. **Update Endpoint:** Modify `/api/v1/reservations` to accept `multipart/form-data`
2. **Add File Handler:** Parse `id_document` field from form
3. **Validate File:** Check type, size, and content
4. **Store File:** Save to disk or cloud storage (S3, etc.)
5. **Save Path:** Store file path/URL in database
6. **Return Response:** Include file info in response (optional)

### Database Schema Update
```sql
ALTER TABLE reservations 
ADD COLUMN id_document_path VARCHAR(255);
```

---

## ✅ Implementation Status

**Status:** ✅ **COMPLETE - Ready for Backend Integration**

### Frontend Complete
- ✅ File upload UI
- ✅ Image preview
- ✅ File validation
- ✅ Remove functionality
- ✅ FormData payload
- ✅ Error handling

### Backend Needed
- ⏳ Accept multipart/form-data
- ⏳ Parse file from request
- ⏳ Validate and store file
- ⏳ Update database schema
- ⏳ Return file path in response

---

**Implementation Date:** December 5, 2025  
**Feature:** ID Document Upload with Preview  
**Status:** Ready for Backend Integration 🚀
