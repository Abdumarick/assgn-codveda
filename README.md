# Simple REST API with Node.js and Express

This is a simple REST API that demonstrates CRUD operations for a User resource.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   node server.js
   ```

## API Endpoints

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a single user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

## Example Requests

### Create a new user
```
POST /api/users
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com"
}
```

### Update a user
```
PUT /api/users/1
Content-Type: application/json

{
    "name": "John Smith",
    "email": "john.smith@example.com"
}
```

## Testing

You can test the API using Postman or Thunder Client (VS Code extension).

## Dependencies

- Express
- Body-parser
