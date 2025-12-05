# ID Type and ID Number Fields Added to Booking Form

## Summary
Added ID Type and ID Number fields to the booking form's Guest Information section to match the guest creation flow.

---

## Changes Made

### 1. **Form State Updated**
Added two new fields to `formData`:

```typescript
const [formData, setFormData] = useState({
  guestId: '',
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  guestIdType: 'Passport',      // NEW - Default to Passport
  guestIdNumber: '',             // NEW - ID number field
  roomType: '',
  roomId: '',
  checkIn: getDateString(new Date()),
  checkOut: getDateString(tomorrow),
  guestCount: 1,
  specialRequests: '',
});
```

### 2. **Guest Selection Handler Updated**
When selecting an existing guest, ID fields are now auto-filled:

```typescript
const handleGuestSelect = (guest: any) => {
  setFormData(prev => ({
    ...prev,
    guestId: guest.id.toString(),
    guestName: guest.name,
    guestEmail: guest.email,
    guestPhone: guest.phone || '',
    guestIdType: guest.id_type || 'Passport',    // NEW
    guestIdNumber: guest.id_number || '',        // NEW
  }));
  // ...
};
```

### 3. **Clear Guest Handler Updated**
Resets ID fields when clearing guest selection:

```typescript
const handleClearGuest = () => {
  setFormData(prev => ({
    ...prev,
    guestId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestIdType: 'Passport',    // Reset to default
    guestIdNumber: '',          // Clear ID number
  }));
  // ...
};
```

### 4. **UI Fields Added**
Two new form fields added after Phone Number:

#### **ID Type (Select Dropdown)**
- **Label:** "ID Type *" (required)
- **Options:**
  - Passport (default)
  - Driver's License
  - National ID
  - Other
- **Behavior:** Disabled when guest is selected
- **Styling:** Matches other form fields

#### **ID Number (Text Input)**
- **Label:** "ID Number *" (required)
- **Placeholder:** "Enter ID number"
- **Behavior:** Disabled when guest is selected
- **Styling:** Matches other form fields

---

## Field Layout

The Guest Information section now has this layout:

```
┌─────────────────────────────────────────────────────┐
│  Select Existing Guest (Optional)                   │
│  [Search box with dropdown]                         │
└─────────────────────────────────────────────────────┘

┌──────────────────────────┬──────────────────────────┐
│  Full Name *             │  Email *                 │
│  [text input]            │  [email input]           │
└──────────────────────────┴──────────────────────────┘

┌──────────────────────────┬──────────────────────────┐
│  Phone Number            │  ID Type *               │
│  [tel input]             │  [select dropdown]       │
└──────────────────────────┴──────────────────────────┘

┌──────────────────────────┬──────────────────────────┐
│  ID Number *             │  Number of Guests *      │
│  [text input]            │  [number input]          │
└──────────────────────────┴──────────────────────────┘
```

---

## Validation

Both fields are **required** (marked with red asterisk):
- ID Type must be selected
- ID Number must be filled in

When a guest is selected from the dropdown:
- Both fields are auto-filled from guest data
- Both fields become disabled (read-only)
- Background turns gray to indicate locked state

---

## Backend Integration

When submitting the booking form, the data now includes:

```json
{
  "guestId": "123",              // If existing guest selected
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "guestPhone": "+1234567890",
  "guestIdType": "Passport",     // NEW
  "guestIdNumber": "US123456",   // NEW
  "roomId": "456",
  "checkIn": "2024-12-05",
  "checkOut": "2024-12-08",
  "guestCount": 2,
  "specialRequests": ""
}
```

### Backend Handling
Your backend should:
1. If `guestId` exists: Use existing guest (ID fields already in database)
2. If `guestId` is empty: Create new guest with all fields including `id_type` and `id_number`

---

## Styling Features

✅ **Consistent Design**
- Matches all other form fields
- Same border, padding, focus states

✅ **Text Visibility**
- `text-gray-900` for active fields
- `text-gray-600` for disabled fields
- Proper contrast for readability

✅ **Disabled State**
- Gray background (`bg-gray-50`)
- Not-allowed cursor
- Lighter text color
- Locked when guest is selected

✅ **Responsive**
- 2-column grid on desktop
- Stacks on mobile
- Proper spacing and alignment

---

## Testing Checklist

### ✅ New Guest Entry
- [ ] ID Type defaults to "Passport"
- [ ] Can select different ID types
- [ ] ID Number field is editable
- [ ] Both fields are required
- [ ] Form validates before submission

### ✅ Existing Guest Selection
- [ ] ID Type auto-fills from guest data
- [ ] ID Number auto-fills from guest data
- [ ] Both fields become disabled
- [ ] Fields show gray background
- [ ] Cannot edit locked fields

### ✅ Clear Guest
- [ ] ID Type resets to "Passport"
- [ ] ID Number clears
- [ ] Both fields become editable again
- [ ] Can enter new values

### ✅ Form Submission
- [ ] ID fields included in form data
- [ ] Backend receives correct values
- [ ] Guest creation includes ID info
- [ ] Booking links to guest properly

---

## Benefits

1. **Complete Guest Information** - Captures all required guest details
2. **Regulatory Compliance** - ID verification for hotel bookings
3. **Consistency** - Matches guest creation flow
4. **Auto-Fill** - Existing guests don't re-enter ID info
5. **Validation** - Required fields ensure data completeness

---

## File Modified

**Location:** `/pages/bookings/new.tsx`

**Lines Changed:**
- Lines 30-43: Form state (added `guestIdType`, `guestIdNumber`)
- Lines 52-64: Guest selection handler (auto-fill ID fields)
- Lines 67-78: Clear guest handler (reset ID fields)
- Lines 383-424: UI fields (ID Type select, ID Number input)

---

## Summary

The booking form now captures complete guest identification information, matching the guest creation flow. Staff can either:
- Select an existing guest (ID fields auto-fill and lock)
- Enter new guest details (all fields including ID info)

This ensures all bookings have proper guest identification for compliance and record-keeping.
