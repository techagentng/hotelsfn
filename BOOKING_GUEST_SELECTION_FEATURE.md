# Guest Selection Feature for New Booking Page

## Overview
Added a searchable guest selection dropdown to the "New Booking" page that allows staff to select existing guests or create new ones.

---

## What Was Added

### 1. **Guest Search & Selection Field**
Located at the top of the Guest Information section in `/pages/bookings/new.tsx`

**Features:**
- 🔍 **Search functionality** - Search guests by name or email
- 📋 **Dropdown list** - Shows matching guests with name, email, and phone
- ✅ **Auto-fill** - Automatically fills guest details when selected
- ❌ **Clear button** - Remove selection and start fresh
- 🔒 **Field locking** - Disables name, email, phone fields when guest is selected
- 💚 **Visual feedback** - Shows "Guest selected (ID: X)" confirmation

### 2. **Form Data Structure**
Added `guestId` field to the booking form:

```typescript
const [formData, setFormData] = useState({
  guestId: '',        // NEW - Stores selected guest ID
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  roomType: '',
  roomId: '',
  checkIn: getDateString(new Date()),
  checkOut: getDateString(tomorrow),
  guestCount: 1,
  specialRequests: '',
});
```

### 3. **Guest Management Functions**

**handleGuestSelect(guest)**
- Sets guest ID
- Auto-fills name, email, phone
- Closes dropdown
- Locks guest info fields

**handleClearGuest()**
- Clears guest ID
- Clears all guest fields
- Unlocks fields for manual entry

**Click-outside handler**
- Automatically closes dropdown when clicking elsewhere

---

## How It Works

### User Flow

#### Option 1: Select Existing Guest
1. User starts typing in "Select Existing Guest" search box
2. Dropdown appears with matching guests
3. User clicks on a guest
4. Guest details auto-fill (name, email, phone become read-only)
5. User continues with room selection and booking details
6. On submit, `guestId` is sent to backend

#### Option 2: Create New Guest
1. User leaves search box empty or clicks clear (X) button
2. Manually enters guest name, email, phone
3. User continues with room selection and booking details
4. On submit, new guest is created (no `guestId` sent)

---

## UI Components

### Search Input
```tsx
<input
  type="text"
  id="guestSearch"
  placeholder="Search by name or email..."
  value={guestSearch}
  onChange={(e) => {
    setGuestSearch(e.target.value);
    setShowGuestDropdown(true);
  }}
  onFocus={() => setShowGuestDropdown(true)}
/>
```

### Dropdown List
- Shows up to 10 matching guests
- Displays: Name (bold), Email, Phone (if available)
- Hover effect for better UX
- Scrollable if more than 5 results

### Clear Button
- Appears when a guest is selected
- X icon in the search input
- Resets all guest fields

### Locked Fields
When guest is selected:
- Name field: disabled, gray background
- Email field: disabled, gray background
- Phone field: disabled, gray background
- Shows green confirmation message with guest ID

---

## Integration with Backend

### When Submitting Booking

**If guest is selected:**
```json
{
  "guestId": "123",
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "guestPhone": "+1234567890",
  "roomId": "456",
  "checkIn": "2024-12-05",
  "checkOut": "2024-12-08",
  "guestCount": 2
}
```

**If new guest:**
```json
{
  "guestId": "",
  "guestName": "Jane Smith",
  "guestEmail": "jane@example.com",
  "guestPhone": "+1234567891",
  "roomId": "456",
  "checkIn": "2024-12-05",
  "checkOut": "2024-12-08",
  "guestCount": 2
}
```

### Backend Handling
Your backend should:
1. Check if `guestId` is provided
2. If yes: Use existing guest, create reservation
3. If no: Create new guest first, then create reservation

---

## Dependencies

### Hooks Used
- `useGetGuests({ search, page_size })` - From `/hooks/useGuests.ts`
- Fetches guests from API with search filter
- Returns paginated results

### Icons Added
- `Search` - For search input icon
- `X` - For clear button
- `User` - For confirmation message

---

## Styling

### States
- **Normal**: White background, gray border
- **Focused**: Indigo ring, indigo border
- **Disabled**: Gray background, cursor not allowed
- **Hover (dropdown)**: Indigo background

### Responsive
- Full width on mobile
- 2-column grid on desktop (md:col-span-2 for search)

---

## Testing Checklist

### ✅ Guest Selection
- [ ] Search shows matching guests
- [ ] Clicking guest auto-fills details
- [ ] Guest ID is stored in formData
- [ ] Confirmation message appears
- [ ] Fields become disabled

### ✅ Clear Functionality
- [ ] Clear button appears when guest selected
- [ ] Clicking clear resets all fields
- [ ] Fields become editable again

### ✅ Dropdown Behavior
- [ ] Opens on focus
- [ ] Opens on typing
- [ ] Closes on selection
- [ ] Closes on click outside
- [ ] Shows "no results" when appropriate

### ✅ Form Submission
- [ ] guestId included when guest selected
- [ ] guestId empty when manual entry
- [ ] All validation still works
- [ ] Backend receives correct data

---

## Benefits

1. **Faster Booking** - No need to re-enter existing guest details
2. **Data Consistency** - Uses existing guest records
3. **Flexibility** - Can still create new guests on the fly
4. **Better UX** - Search and select is faster than manual entry
5. **Reduced Errors** - Auto-fill prevents typos
6. **Guest History** - Links reservations to existing guest profiles

---

## Future Enhancements

1. **Recent Guests** - Show recently booked guests at the top
2. **Guest Preview** - Show guest history/preferences on hover
3. **Quick Create** - "Create new guest" button in dropdown
4. **Keyboard Navigation** - Arrow keys to navigate dropdown
5. **Guest Verification** - Show ID verification status
6. **Loyalty Status** - Display guest tier/points in dropdown

---

## Code Location

**File:** `/pages/bookings/new.tsx`

**Key Sections:**
- Lines 1-5: Imports (added `Search` icon and `useGetGuests` hook)
- Lines 30-41: Form state (added `guestId`)
- Lines 43-45: Guest search state
- Lines 49-72: Guest selection handlers
- Lines 74-85: Click-outside handler
- Lines 243-300: Guest selection UI
- Lines 302-324: Name field (disabled when guest selected)
- Lines 325-346: Email field (disabled when guest selected)
- Lines 347-362: Phone field (disabled when guest selected)

---

## Summary

The guest selection feature is now fully integrated into the new booking page. Staff can quickly search and select existing guests, or manually enter new guest information. The form intelligently handles both scenarios and sends the appropriate data to the backend.
