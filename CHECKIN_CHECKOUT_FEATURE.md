# Check-In Page Checkout Feature

## Summary
Added checkout functionality to the Check-In page modal, allowing staff to process guest checkouts directly from the check-in/checkout management interface.

## Changes Made

### 1. Import Added
```typescript
import { useGetReservations, useCheckoutReservation } from '../hooks/useReservations';
```
- Added `useCheckoutReservation` hook import

### 2. State Management
Added new state variables for checkout functionality:
```typescript
// Checkout states
const [showCheckoutModal, setShowCheckoutModal] = useState(false);
const [additionalCharges, setAdditionalCharges] = useState('');
const [checkoutNotes, setCheckoutNotes] = useState('');

// Checkout mutation
const checkoutMutation = useCheckoutReservation();
```

### 3. Checkout Handler
```typescript
const handleCheckout = async () => {
  if (!selectedGuest?.bookingId) return;

  try {
    await checkoutMutation.mutateAsync({
      id: parseInt(selectedGuest.bookingId),
      additional_charges: additionalCharges ? parseFloat(additionalCharges) : undefined,
      notes: checkoutNotes || undefined,
    });

    toast.success('Check-out successful!');
    setShowCheckoutModal(false);
    closeModal();
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to process checkout');
  }
};
```

### 4. Updated Close Modal Handler
Enhanced to reset checkout-related state:
```typescript
const closeModal = () => {
  setSelectedGuest(null);
  setShowCheckoutModal(false);
  setAdditionalCharges('');
  setCheckoutNotes('');
};
```

### 5. Checkout Button in Guest Details Modal
Added conditional button for checked-in guests:
```typescript
{selectedGuest.status === 'checked-in' && (
  <button
    type="button"
    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
    onClick={() => setShowCheckoutModal(true)}
  >
    Checkout Guest
  </button>
)}
```

### 6. Checkout Modal Component
Added a complete checkout modal with:
- Guest information display (name, room, total amount, booking ID)
- Additional charges input field
- Notes textarea
- Cancel and Confirm buttons
- Loading state handling

## Features

### Checkout Modal Includes:
1. **Guest Summary**
   - Guest name
   - Room number
   - Total amount
   - Booking ID

2. **Additional Charges**
   - Optional numeric input
   - Dollar sign icon
   - Helper text for mini-bar, room service, etc.

3. **Notes Field**
   - Optional textarea
   - For feedback or special notes

4. **Actions**
   - Cancel button (closes modal)
   - Confirm Checkout button (processes checkout)
   - Loading state with "Processing..." text

## User Flow

1. **View Guest Details**
   - Staff clicks on a guest in the check-in list
   - Guest details modal opens

2. **Initiate Checkout** (only for checked-in guests)
   - "Checkout Guest" button appears for guests with status "checked-in"
   - Click button to open checkout modal

3. **Enter Checkout Details**
   - Optionally add additional charges
   - Optionally add notes
   - Review guest information

4. **Confirm Checkout**
   - Click "Confirm Checkout"
   - System processes the checkout
   - Success toast notification appears
   - Both modals close automatically

## API Integration

Uses the `useCheckoutReservation` hook which calls:
```
PUT /api/v1/reservations/:id/checkout
```

Request body:
```json
{
  "additional_charges": 50.00,  // optional
  "notes": "Guest feedback..."   // optional
}
```

## UI/UX Enhancements

- **Conditional Display**: Checkout button only shows for checked-in guests
- **Modern Design**: Gradient backgrounds, rounded corners, smooth transitions
- **Loading States**: Disabled button with loading text during processing
- **Error Handling**: Toast notifications for success/failure
- **Clean State Management**: All checkout state resets on modal close

## Status-Based Actions

The guest details modal now shows different actions based on guest status:

| Status | Available Actions |
|--------|------------------|
| `pending` | Mark No Show, Complete Check-In |
| `checked-in` | **Checkout Guest** (new) |
| `completed` | View only (Close button) |
| `no-show` | View only (Close button) |

## Styling

- **Checkout Button**: Green gradient (`bg-green-600 hover:bg-green-700`)
- **Modal**: Modern design matching the inroomtablet page
- **Responsive**: Works on all screen sizes
- **Accessible**: Proper focus states and disabled states

## Testing Checklist

- [ ] Checkout button appears only for checked-in guests
- [ ] Checkout modal opens when button is clicked
- [ ] Additional charges field accepts numeric input
- [ ] Notes field accepts text input
- [ ] Cancel button closes modal without processing
- [ ] Confirm button processes checkout
- [ ] Success toast appears on successful checkout
- [ ] Error toast appears on failed checkout
- [ ] Both modals close after successful checkout
- [ ] State resets properly when modals close

## Files Modified
- `/pages/checkin.tsx` - Added checkout functionality and modal

## Related Features
- In-room tablet checkout (similar implementation)
- Reservation management
- Guest check-in flow
