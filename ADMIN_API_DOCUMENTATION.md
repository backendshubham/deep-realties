# Admin API Documentation

## Base URL
All admin APIs are prefixed with `/api/admin` and require authentication with admin role.

## Authentication
All endpoints require:
- Header: `Authorization: Bearer <token>`
- User must have `admin` role

---

## 1. Users Management APIs

### GET `/api/admin/users`
Get list of all users with pagination and filters.

**Query Parameters:**
- `role` (optional): Filter by role (`buyer`, `seller`, `admin`)
- `is_active` (optional): Filter by status (`true`, `false`)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 50): Items per page

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "phone": "1234567890",
      "role": "buyer",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

### GET `/api/admin/users/:id`
Get a specific user by ID.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "1234567890",
    "role": "buyer",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT `/api/admin/users/:id/toggle`
Toggle user active status (activate/deactivate).

**Response:**
```json
{
  "message": "User activated",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "is_active": true
  }
}
```

### PUT `/api/admin/users/:id`
Update user details.

**Body:**
```json
{
  "role": "seller",
  "is_active": true,
  "full_name": "John Doe",
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "message": "User updated successfully",
  "user": { ... }
}
```

### DELETE `/api/admin/users/:id`
Deactivate a user (soft delete - sets is_active to false).

**Note:** Cannot delete admin users.

**Response:**
```json
{
  "message": "User deactivated successfully"
}
```

---

## 2. Properties Management APIs

### GET `/api/admin/properties`
Get list of all properties with pagination and filters.

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `approved`, `rejected`)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 50): Items per page

**Response:**
```json
{
  "properties": [
    {
      "id": "uuid",
      "title": "Beautiful House",
      "property_type": "House",
      "price": 5000000,
      "status": "pending",
      "is_active": false,
      "locality": "Downtown",
      "city": "Mumbai",
      "state": "Maharashtra",
      "area_sqft": 2000,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

### GET `/api/admin/properties/:id`
Get a specific property by ID.

**Response:**
```json
{
  "property": { ... }
}
```

### POST `/api/admin/properties/:id/approve`
Approve a property (sets status to 'approved' and is_active to true).

**Response:**
```json
{
  "message": "Property approved successfully",
  "property": { ... }
}
```

### POST `/api/admin/properties/:id/reject`
Reject a property (sets status to 'rejected' and is_active to false).

**Response:**
```json
{
  "message": "Property rejected successfully",
  "property": { ... }
}
```

### PUT `/api/admin/properties/:id/status`
Update property status and active state.

**Body:**
```json
{
  "status": "approved",
  "is_active": true
}
```

**Response:**
```json
{
  "message": "Property status updated successfully",
  "property": { ... }
}
```

### DELETE `/api/admin/properties/:id`
Permanently delete a property.

**Response:**
```json
{
  "message": "Property deleted successfully"
}
```

---

## 3. Contact Submissions Management APIs

### GET `/api/admin/contact-submissions`
Get list of all contact form submissions with pagination and filters.

**Query Parameters:**
- `is_read` (optional): Filter by read status (`true`, `false`)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 50): Items per page

**Response:**
```json
{
  "submissions": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "subject": "Inquiry",
      "message": "I would like to know more...",
      "is_read": false,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

### GET `/api/admin/contact-submissions/:id`
Get a specific contact submission by ID.

**Response:**
```json
{
  "submission": { ... }
}
```

### DELETE `/api/admin/contact-submissions/:id`
Delete a contact submission.

**Response:**
```json
{
  "message": "Contact submission deleted successfully"
}
```

**Note:** To mark as read, use the contact API: `PUT /api/contact/submissions/:id/read`

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Frontend Routes

The following frontend routes render the admin pages:
- `GET /admin/dashboard` - Admin Dashboard
- `GET /admin/users` - Manage Users page
- `GET /admin/properties` - Manage Properties page
- `GET /admin/contact` - Contact Submissions page

These pages use the APIs listed above to fetch and manage data.

