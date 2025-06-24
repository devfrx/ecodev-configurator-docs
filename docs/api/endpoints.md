# API Endpoints Documentation

This document describes all the API endpoints used in the EcoDev Configurator application for interacting with the Odoo backend system.

## Table of Contents

- [Authentication](#authentication)
- [Search Operations](#search-operations)
- [Product Configuration](#product-configuration)
- [Quote Management](#quote-management)
- [User & Partner Management](#user--partner-management)
- [Software Configuration](#software-configuration)
- [File Operations](#file-operations)
- [Data Models](#data-models)

## Base Configuration

All API calls are made through the Odoo JSON-RPC interface with the following base configuration:

```javascript
const API_BASE_URL =
  process.env.VITE_API_BASE_URL || "https://your-odoo-instance.com";
const DATABASE = process.env.VITE_DATABASE || "your_database";
```

## Authentication

### Login

Authenticates a user and establishes a session.

**Endpoint:** `POST /web/session/authenticate`

**Request Body:**

```json
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "db": "database_name",
    "login": "username",
    "password": "password"
  }
}
```

**Response:**

```json
{
  "result": {
    "uid": 123,
    "username": "user@example.com",
    "session_id": "session_token"
  }
}
```

### Get Session

Retrieves current session information.

**Endpoint:** `POST /web/session/get_session_info`

### Logout

Destroys the current session.

**Endpoint:** `POST /web/session/destroy`

## Search Operations

### Universal Search

Searches across multiple entities (categories, steps, options, supercategories).

**Function:** `searchAllEntities(keyword)`

**Models Searched:**

- `x_product_categories`
- `x_supercategories`
- `x_steps`
- `x_options`

**Search Domain:**

```javascript
["|", ["x_name", "ilike", keyword], ["x_description", "ilike", keyword]];
```

## Product Configuration

### Fetch Categories

Retrieves product categories with hierarchical structure.

**Model:** `x_product_categories`

**Fields:** `['id', 'x_name', 'x_description', 'x_supercategory_id', 'x_img', 'x_battery']`

**Function:** `fetchCategories()`

### Fetch Supercategories

Retrieves supercategories for organization.

**Model:** `x_supercategories`

**Fields:** `['id', 'x_name', 'x_description', 'x_img']`

**Function:** `fetchSuperCategories()`

### Fetch Configuration Steps

Retrieves configuration steps for a specific category.

**Model:** `x_steps`

**Domain:** `[['x_product_category_id.id', '=', categoryId]]`

**Order:** `'x_position asc'`

**Function:** `fetchSteps(categoryId)`

### Fetch Configuration Options

Retrieves options for configuration steps.

**Model:** `x_options`

**Domain:** `[['x_step_id', 'in', stepIds]]` (when filtered)

**Function:** `fetchOptions(stepIds = null)`

### Fetch Constraints

Retrieves constraint rules between options.

**Model:** `x_constraints`

**Domain:** `[['x_option_id', 'in', optionIds]]` (when filtered)

**Function:** `fetchConstraints(optionIds = null)`

### Fetch Rules

Retrieves validation and calculation rules.

**Model:** `x_rules`

**Function:** `fetchRules(domain = [], fields = null)`

## Quote Management

### Create Quote

Creates a new sales order (quote) in Odoo.

**Model:** `sale.order`

**Method:** `create`

**Required Fields:**

```json
{
  "partner_id": 123,
  "order_line": [
    {
      "name": "PRODUCT-CODE-1",
      "x_note_interne": "Configuration description",
      "product_uom_qty": 1.0,
      "price_unit": 100.0
    }
  ]
}
```

**Function:** `createQuote(quoteData)`

### Fetch Quotes

Retrieves quotes for a specific user.

**Model:** `sale.order`

**Domain:** `[['user_id.id', '=', userId]]`

**Order:** `'id desc'`

**Function:** `fetchQuotes(userId)`

### Add Section Line

Adds a section separator to a quote.

**Model:** `sale.order.line`

**Method:** `create`

**Data:**

```json
{
  "order_id": orderId,
  "name": "Section Name",
  "display_type": "line_section"
}
```

**Function:** `addSectionLine(orderId)`

### Create Order Line

Adds a product line to an existing quote.

**Model:** `sale.order.line`

**Method:** `create`

**Function:** `createLine(lineData)`

## User & Partner Management

### Fetch Users

Retrieves user information.

**Model:** `res.users`

**Function:** `fetchUsers(userIds = null)`

### Fetch Partners

Retrieves partner (customer) information.

**Model:** `res.partner`

**Function:** `fetchPartners(userIds = null)`

### Create Partner

Creates a new customer/partner record.

**Model:** `res.partner`

**Method:** `create`

**Required Fields:**

```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+39 123 456789",
  "street": "Customer Address",
  "city": "City",
  "zip": "12345"
}
```

**Function:** `createPartner(partnerData)`

## Software Configuration

### Fetch Software Options

Retrieves software configuration options.

**Model:** `x_options`

**Domain:** `[['x_step_id.x_product_category_id.id', '=', SOFTWARE_CATEGORY_ID]]`

**Function:** `fetchOptionsByCategoryId(categoryId)`

**Special Codes:**

- `GSM01`: GSM connectivity option
- `SOFTFR`: French software clause
- `SOFT4`: Advanced software clause
- `SOFT1`, `SOFT2`, `SOFT3`: Software tiers based on device count

## File Operations

### Upload File

Uploads files to Odoo's file storage system.

**Endpoint:** `POST /web/binary/upload_attachment`

**Content-Type:** `multipart/form-data`

**Parameters:**

- `model`: Target model name
- `id`: Record ID
- `field`: Field name for attachment

## Data Models

### Product Category (`x_product_categories`)

```json
{
  "id": 1,
  "x_name": "Category Name",
  "x_description": "Category Description",
  "x_supercategory_id": [1, "Supercategory Name"],
  "x_img": "base64_image_data",
  "x_battery": true
}
```

### Configuration Step (`x_steps`)

```json
{
  "id": 1,
  "x_name": "Step Name",
  "x_title": "Step Title",
  "x_position": 1,
  "x_choice_type": "single_choice",
  "x_product_category_id": [1, "Category Name"],
  "options": []
}
```

### Configuration Option (`x_options`)

```json
{
  "id": 1,
  "x_name": "Option Name",
  "x_name_readable": "Human Readable Name",
  "x_description": "Option Description",
  "x_price": 100.0,
  "x_default": false,
  "x_step_id": [1, "Step Name"],
  "bound": []
}
```

### Constraint (`x_constraints`)

```json
{
  "id": 1,
  "x_option_id": [1, "Source Option"],
  "x_restricted_option_id": [2, "Target Option"],
  "x_description": "Constraint Description"
}
```

### Sales Order (`sale.order`)

```json
{
  "id": 1,
  "name": "SO001",
  "partner_id": [123, "Customer Name"],
  "user_id": [1, "Salesperson"],
  "state": "draft",
  "amount_total": 1000.0,
  "order_line": []
}
```

### Sales Order Line (`sale.order.line`)

```json
{
  "id": 1,
  "order_id": [1, "SO001"],
  "name": "Product Code",
  "x_note_interne": "Configuration Notes",
  "product_uom_qty": 1.0,
  "price_unit": 100.0,
  "display_type": "line_section"
}
```

## Error Handling

All API responses follow the JSON-RPC 2.0 standard. Errors are returned in the following format:

```json
{
  "jsonrpc": "2.0",
  "id": null,
  "error": {
    "code": 200,
    "message": "Odoo Server Error",
    "data": {
      "name": "odoo.exceptions.ValidationError",
      "debug": "Traceback...",
      "message": "Error details",
      "arguments": ["Error message"],
      "context": {}
    }
  }
}
```

## Rate Limiting

The application implements client-side rate limiting to prevent overwhelming the Odoo server:

- Maximum 10 concurrent requests
- 1 second delay between consecutive requests to the same endpoint
- Automatic retry mechanism with exponential backoff

## Authentication Flow

1. User provides credentials via login form
2. Application calls `/web/session/authenticate`
3. Session cookie is automatically managed by the browser
4. Subsequent requests include session information
5. Session validation occurs on protected routes
6. Logout destroys the session via `/web/session/destroy`

## Security Considerations

- All API calls are made over HTTPS in production
- Session cookies are marked as `HttpOnly` and `Secure`
- CSRF protection is implemented via Odoo's built-in mechanisms
- Input validation occurs both client-side and server-side
- SQL injection protection through Odoo's ORM domain system
