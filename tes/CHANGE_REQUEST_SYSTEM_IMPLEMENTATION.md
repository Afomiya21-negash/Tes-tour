# 🔄 CHANGE REQUEST SYSTEM - Complete Implementation

## 📅 **Date:** December 9, 2025
## 🎯 **Feature:** Tour Guide & Driver Change Request System

---

## **OVERVIEW**

This system allows customers to request changes to their assigned tour guide or driver during an in-progress tour. Admins can review these requests and assign new personnel within 24 hours.

---

## **FEATURES**

### **Customer Features:**
✅ Request to change tour guide, driver, or both
✅ Only available for in-progress tours
✅ Provide optional reason for change
✅ View request status (pending/completed/rejected)
✅ One pending request per booking

### **Admin Features:**
✅ View all change requests in dedicated tab
✅ See pending requests count (badge notification)
✅ Process requests (approve/reject)
✅ Assign new guide/driver from available personnel
✅ Automatically filtered by tour dates
✅ Track who processed each request

### **Previous Guide/Driver:**
✅ Can no longer track tour after being replaced
✅ See notification: "The customer has changed you"

---

## **DATABASE SCHEMA**

### **New Table: `change_requests`**

```sql
CREATE TABLE change_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  user_id INT NOT NULL,
  request_type ENUM('tour_guide', 'driver', 'both') NOT NULL,
  
  -- Current assignments
  current_tour_guide_id INT DEFAULT NULL,
  current_driver_id INT DEFAULT NULL,
  
  -- New assignments
  new_tour_guide_id INT DEFAULT NULL,
  new_driver_id INT DEFAULT NULL,
  
  -- Request details
  reason TEXT DEFAULT NULL,
  status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL DEFAULT NULL,
  processed_by INT DEFAULT NULL,
  
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  ...
);
```

**To create the table:**
```sql
SOURCE setup-change-requests.sql;
```

---

## **API ENDPOINTS**

### **1. GET /api/change-requests**

**Description:** Get change requests (filtered by user role)

**Auth:** Required (customer or admin)

**Customer Response:**
- Returns only their own requests

**Admin Response:**
- Returns all requests, sorted by status (pending first)

```json
[
  {
    "request_id": 1,
    "booking_id": 5,
    "tour_name": "Historical Addis Tour",
    "start_date": "2025-12-15",
    "end_date": "2025-12-18",
    "customer_first_name": "John",
    "customer_last_name": "Doe",
    "request_type": "both",
    "current_guide_first_name": "Mike",
    "current_guide_last_name": "Johnson",
    "current_driver_first_name": "Sarah",
    "current_driver_last_name": "Williams",
    "reason": "Tour guide was not knowledgeable",
    "status": "pending",
    "created_at": "2025-12-10T10:30:00Z"
  }
]
```

---

### **2. POST /api/change-requests**

**Description:** Create a new change request (customer only)

**Auth:** Required (customer)

**Request Body:**
```json
{
  "booking_id": 5,
  "request_type": "both",
  "reason": "Not satisfied with current service"
}
```

**Validation:**
- Booking must belong to customer
- Booking must be in-progress
- No pending request already exists
- request_type must be: 'tour_guide', 'driver', or 'both'

**Success Response (201):**
```json
{
  "success": true,
  "request_id": 1,
  "message": "Change request submitted. We will assign a new guide/driver within 24 hours."
}
```

**Error Responses:**
- 400: Invalid request_type, booking not in-progress, or duplicate request
- 404: Booking not found

---

### **3. PUT /api/change-requests/[id]**

**Description:** Process a change request (admin only)

**Auth:** Required (admin)

**Request Body:**
```json
{
  "status": "approved",
  "new_tour_guide_id": 14,
  "new_driver_id": 8
}
```

**For Approval:**
- `status`: "approved"
- `new_tour_guide_id`: Required if request_type is 'tour_guide' or 'both'
- `new_driver_id`: Required if request_type is 'driver' or 'both'

**For Rejection:**
- `status`: "rejected"

**Success Response:**
```json
{
  "success": true,
  "message": "Change request approved and assignments updated"
}
```

**What Happens on Approval:**
1. Updates `bookings` table with new guide/driver IDs
2. Sets request status to 'completed'
3. Records processed_by and processed_at
4. Stores new assignments in change_requests table

---

### **4. DELETE /api/change-requests/[id]**

**Description:** Cancel a pending change request (customer only)

**Auth:** Required (customer)

**Success Response:**
```json
{
  "success": true,
  "message": "Request cancelled"
}
```

---

## **USER INTERFACE**

### **Customer Dashboard**

**Button Location:**
- Appears in booking cards for in-progress tours
- Icon: 🔄 RefreshCcw
- Text: "Change Guide/Driver"
- Color: Orange (bg-orange-600)

**Change Request Modal:**
```
┌─────────────────────────────────────┐
│ Request Change                      │
│ Request a new tour guide or driver  │
├─────────────────────────────────────┤
│ ⏱️ We will assign a new guide/driver│
│   within 24 hours of your request. │
│                                      │
│ Current Assignment:                 │
│ Tour Guide: John Smith              │
│ Driver: Jane Doe                    │
│                                      │
│ What would you like to change?      │
│ ○ Both Tour Guide & Driver          │
│ ○ Tour Guide Only                   │
│ ○ Driver Only                       │
│                                      │
│ Reason for change (optional):       │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                      │
│ [ Cancel ] [ Submit Request ]       │
└─────────────────────────────────────┘
```

---

### **Admin Dashboard**

**New Tab: "Change Requests"**
- Icon: 🔄 RefreshCcw
- Badge: Shows pending count (e.g., "3" in red circle)
- Position: After "Promotions" tab

**Requests Table:**

| Customer | Tour | Type | Current | Status | Date | Actions |
|----------|------|------|---------|--------|------|---------|
| John Doe | Historical Tour | Both | Guide: Mike<br>Driver: Sarah | 🟡 Pending | Dec 10 | [Process] |
| Jane Smith | Culture Tour | Tour Guide | Guide: Tom | ✅ Completed | Dec 9 | New Guide: Alex |

**Status Badges:**
- 🟡 **Pending:** Yellow (bg-yellow-100 text-yellow-800)
- ✅ **Completed:** Green (bg-green-100 text-green-800)
- ❌ **Rejected:** Red (bg-red-100 text-red-800)

**Process Request Modal:**
```
┌─────────────────────────────────────────┐
│ Process Change Request                  │
│ Assign new guide/driver for tour       │
├─────────────────────────────────────────┤
│ Request Details:                        │
│ Customer: John Doe                      │
│ Tour: Historical Addis Tour             │
│ Dates: Dec 15 - Dec 18                  │
│ Type: both                              │
│ Reason: Not satisfied with service     │
│                                          │
│ Select New Tour Guide *                 │
│ ┌─────────────────────────────────────┐ │
│ │ Alex Brown - ⭐ 4.8 (25 tours)      │ │
│ └─────────────────────────────────────┘ │
│ Only guides available for the tour      │
│ dates are shown                         │
│                                          │
│ Select New Driver *                     │
│ ┌─────────────────────────────────────┐ │
│ │ Chris Green - ⭐ 4.6 (40 trips)     │ │
│ └─────────────────────────────────────┘ │
│ Only drivers available for the tour     │
│ dates are shown                         │
│                                          │
│ [ Cancel ] [ ❌ Reject ] [ ✅ Approve ] │
└─────────────────────────────────────────┘
```

---

## **WORKFLOW DIAGRAM**

```
CUSTOMER                      SYSTEM                      ADMIN
   │                            │                           │
   │ 1. Tour In-Progress        │                           │
   │ Click "Change Guide/Driver"│                           │
   ├───────────────────────────>│                           │
   │                            │                           │
   │ 2. Fill Request Form       │                           │
   │ Select: Tour Guide         │                           │
   │ Reason: "Not knowledgeable"│                           │
   ├───────────────────────────>│                           │
   │                            │                           │
   │                            │ POST /api/change-requests │
   │                            │ Save to database          │
   │                            │ Status: pending           │
   │                            │                           │
   │ 3. Confirmation Message    │                           │
   │<───────────────────────────┤                           │
   │ "We will assign within 24h"│                           │
   │                            │                           │
   │                            │ 4. Admin Notified         │
   │                            ├──────────────────────────>│
   │                            │ Badge: 1 pending request  │
   │                            │                           │
   │                            │ 5. Admin Opens Request    │
   │                            │<──────────────────────────┤
   │                            │ GET /api/change-requests  │
   │                            │                           │
   │                            │ 6. Fetch Available Guides │
   │                            │<──────────────────────────┤
   │                            │ Filtered by tour dates    │
   │                            │                           │
   │                            │ 7. Admin Approves         │
   │                            │<──────────────────────────┤
   │                            │ Selects: New Guide (ID 14)│
   │                            │                           │
   │                            │ PUT /api/change-requests/1│
   │                            │ UPDATE bookings SET       │
   │                            │   tour_guide_id = 14      │
   │                            │ Status: completed         │
   │                            │                           │
   │ 8. See New Guide           │                           │
   │<───────────────────────────┤                           │
   │ Booking updated            │                           │
   │                            │                           │
   │                            │ 9. Old Guide Sees         │
   ┌──────────────────────────┐ │                           │
   │ OLD GUIDE                │ │                           │
   │ "The customer has        │ │                           │
   │  changed you"            │ │                           │
   └──────────────────────────┘ │                           │
```

---

## **FILES CREATED/MODIFIED**

### **New Files:**

1. **`setup-change-requests.sql`**
   - Database table creation
   - Foreign key constraints
   - Indexes

2. **`app/api/change-requests/route.ts`**
   - GET: Fetch change requests
   - POST: Create change request

3. **`app/api/change-requests/[id]/route.ts`**
   - PUT: Process request (approve/reject)
   - DELETE: Cancel request

### **Modified Files:**

4. **`app/dashboard/page.tsx`** (Customer Dashboard)
   - Added change request button for in-progress tours
   - Added change request modal
   - Added state management
   - Added handler functions

5. **`app/admin/page.tsx`** (Admin Dashboard)
   - Added "Change Requests" tab
   - Added requests table
   - Added process request modal
   - Added state management
   - Added handler functions

---

## **BUSINESS LOGIC**

### **Request Creation Rules:**

1. ✅ **Tour must be in-progress**
   - Status = 'in-progress'
   - Cannot change for pending, confirmed, completed, or cancelled tours

2. ✅ **No duplicate requests**
   - Only one pending request per booking
   - Customer must wait for processing

3. ✅ **Valid request type**
   - 'tour_guide': Change guide only
   - 'driver': Change driver only
   - 'both': Change both

4. ✅ **Ownership verification**
   - Booking must belong to requesting customer

---

### **Request Processing Rules:**

1. ✅ **Admin only**
   - Only admins can approve/reject

2. ✅ **Availability check**
   - New guide/driver must be available for tour dates
   - System auto-filters unavailable personnel

3. ✅ **Atomic updates**
   - Uses database transactions
   - All or nothing (booking + request)

4. ✅ **Audit trail**
   - Records who processed (processed_by)
   - Records when processed (processed_at)
   - Keeps old assignments for history

---

## **24-HOUR SLA**

The system promises assignment within 24 hours:

**Customer sees:**
> "⏱️ We will assign a new guide/driver within **24 hours** of your request."

**Admin monitoring:**
- Requests sorted by status (pending first)
- Badge shows pending count
- Clear "Process" button

**No automatic assignment:**
- Admin must manually review and assign
- Allows quality control
- Prevents automated errors

---

## **TESTING GUIDE**

### **Test 1: Customer Creates Request**

1. **Login as customer**
2. **Find in-progress tour**
3. **Click "Change Guide/Driver"**
4. **Select request type:** Both
5. **Enter reason:** "Not satisfied"
6. **Click "Submit Request"**
7. **Expected:**
   - ✅ Success message appears
   - ✅ Request saved to database
   - ✅ Status: pending

---

### **Test 2: Duplicate Request Prevention**

1. **Create a request** (as above)
2. **Try to create another** for same booking
3. **Expected:**
   - ❌ Error: "You already have a pending change request for this booking"

---

### **Test 3: Admin Approves Request**

1. **Login as admin**
2. **Go to "Change Requests" tab**
3. **See pending request** (badge shows count)
4. **Click "Process"**
5. **Select new guide/driver** from dropdowns
6. **Click "Approve & Assign"**
7. **Expected:**
   - ✅ Booking updated with new assignments
   - ✅ Request status: completed
   - ✅ Customer sees new guide/driver
   - ✅ processed_by and processed_at recorded

---

### **Test 4: Admin Rejects Request**

1. **Process a request**
2. **Click "Reject"** instead of approve
3. **Expected:**
   - ✅ Request status: rejected
   - ✅ Booking unchanged
   - ✅ Customer sees rejection

---

### **Test 5: Availability Filtering**

1. **Create request** for tour dates Dec 15-18
2. **Guide A:** Booked Dec 16-17 (overlaps)
3. **Guide B:** Free on Dec 15-18
4. **Admin processes request**
5. **Expected:**
   - ✅ Only Guide B appears in dropdown
   - ❌ Guide A not shown (unavailable)

---

### **Test 6: Request for In-Progress Only**

1. **Try to request change** for pending booking
2. **Expected:**
   - ❌ Button not visible
   - Only appears for in-progress tours

---

## **SECURITY CONSIDERATIONS**

### **Authentication:**
- ✅ All endpoints require auth token
- ✅ Cookie-based authentication

### **Authorization:**
- ✅ Customers can only see their own requests
- ✅ Customers can only create requests for their bookings
- ✅ Only admins can process requests
- ✅ Only admins can see all requests

### **Validation:**
- ✅ Request type enum validation
- ✅ Booking ownership verification
- ✅ Duplicate request prevention
- ✅ Status transition validation

### **Data Integrity:**
- ✅ Foreign key constraints
- ✅ Transaction-based updates
- ✅ ON DELETE CASCADE for cleanup

---

## **LIMITATIONS & FUTURE ENHANCEMENTS**

### **Current Limitations:**

1. ⚠️ **No notification system**
   - Customer doesn't get notified when processed
   - Consider email/SMS notifications

2. ⚠️ **No change limit**
   - Customer can request unlimited changes
   - Consider limiting to N changes per booking

3. ⚠️ **No partial changes**
   - If changing "both", must assign both
   - Cannot approve guide only from "both" request

4. ⚠️ **24-hour SLA not enforced**
   - No automatic escalation
   - No SLA tracking

### **Future Enhancements:**

1. 📧 **Notification System**
   - Email customer when request processed
   - SMS notification option
   - In-app notifications

2. ⏰ **SLA Tracking**
   - Auto-escalate if > 24 hours
   - Dashboard metrics
   - Performance reports

3. 🔔 **Real-time Updates**
   - WebSocket for live status
   - No page refresh needed

4. 📊 **Analytics**
   - Track most common reasons
   - Identify problematic guides/drivers
   - Trend analysis

5. 💬 **Communication**
   - In-app chat with admin
   - Follow-up questions
   - Resolution feedback

6. 🚫 **Change Limits**
   - Max 2 changes per booking
   - Prevent abuse

7. ⭐ **Auto-rating Reduction**
   - If changed, original guide gets lower rating
   - Incentivizes good service

---

## **DATABASE QUERIES**

### **Get Pending Requests (Admin):**
```sql
SELECT 
  cr.*,
  CONCAT(c.first_name, ' ', c.last_name) as customer_name,
  b.tour_name,
  b.start_date,
  b.end_date
FROM change_requests cr
JOIN bookings b ON cr.booking_id = b.booking_id
JOIN users c ON cr.user_id = c.user_id
WHERE cr.status = 'pending'
ORDER BY cr.created_at ASC;
```

### **Get Customer's Request History:**
```sql
SELECT 
  cr.*,
  b.tour_name,
  CONCAT(tg.first_name, ' ', tg.last_name) as current_guide_name,
  CONCAT(d.first_name, ' ', d.last_name) as current_driver_name
FROM change_requests cr
JOIN bookings b ON cr.booking_id = b.booking_id
LEFT JOIN users tg ON cr.current_tour_guide_id = tg.user_id
LEFT JOIN users d ON cr.current_driver_id = d.user_id
WHERE cr.user_id = ?
ORDER BY cr.created_at DESC;
```

### **Update Booking with New Assignments:**
```sql
UPDATE bookings
SET 
  tour_guide_id = ?,
  driver_id = ?
WHERE booking_id = ?;
```

### **Mark Request as Completed:**
```sql
UPDATE change_requests
SET 
  status = 'completed',
  new_tour_guide_id = ?,
  new_driver_id = ?,
  processed_at = NOW(),
  processed_by = ?
WHERE request_id = ?;
```

---

## **TROUBLESHOOTING**

### **Problem: "Booking not found"**
**Cause:** Booking doesn't belong to customer or doesn't exist
**Solution:** Verify booking_id and ownership

### **Problem: "You already have a pending request"**
**Cause:** Duplicate request for same booking
**Solution:** Wait for admin to process existing request, or cancel it first

### **Problem: "Can only request changes for in-progress tours"**
**Cause:** Booking status is not 'in-progress'
**Solution:** Only in-progress tours can be changed

### **Problem: "Please select a new tour guide"**
**Cause:** Admin didn't select guide when approving
**Solution:** Select guide from dropdown before approving

### **Problem: No guides/drivers in dropdown**
**Cause:** All are booked during tour dates
**Solution:** Manually override or find alternative dates

---

## **DEPLOYMENT CHECKLIST**

- [ ] Run `setup-change-requests.sql` on production database
- [ ] Verify foreign key constraints created
- [ ] Test API endpoints with Postman
- [ ] Test customer change request flow
- [ ] Test admin processing flow
- [ ] Verify availability filtering works
- [ ] Check permission/auth for all endpoints
- [ ] Test duplicate request prevention
- [ ] Restart Next.js server
- [ ] Clear browser cache
- [ ] Monitor error logs
- [ ] Set up backup for new table

---

## **SUPPORT & MAINTENANCE**

### **Monitoring:**
- Check pending request count daily
- Ensure all processed within 24 hours
- Monitor rejection rate

### **Common Admin Tasks:**
1. Process pending requests
2. Handle edge cases (no available personnel)
3. Investigate duplicate complaints about same guide/driver

### **Database Maintenance:**
- Archive old requests (> 6 months)
- Analyze change patterns
- Identify frequently changed personnel

---

**Change Request System fully implemented and ready for use!** 🎉
