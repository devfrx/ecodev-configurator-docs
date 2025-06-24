# API Integration Architecture

This document details the API integration architecture of the EcoDev Configurator, focusing on the communication patterns, data handling, and integration strategies with the Odoo ERP backend.

## Table of Contents

- [Overview](#overview)
- [Integration Architecture](#integration-architecture)
- [API Client Design](#api-client-design)
- [Communication Patterns](#communication-patterns)
- [Data Models Integration](#data-models-integration)
- [Error Handling Strategy](#error-handling-strategy)
- [Performance Optimization](#performance-optimization)
- [Security Implementation](#security-implementation)

## Overview

The EcoDev Configurator integrates with **Odoo ERP** using JSON-RPC 2.0 protocol, providing seamless access to product catalogs, configuration options, customer management, and quote generation capabilities.

### Integration Principles

- **Centralized API Client**: Single point of communication with Odoo
- **Standardized Requests**: Consistent request/response patterns
- **Error Resilience**: Robust error handling and recovery
- **Session Management**: Automatic authentication and session handling
- **Rate Limiting**: Client-side request throttling

### Technology Stack

- **Protocol**: JSON-RPC 2.0 over HTTPS
- **HTTP Client**: Axios with interceptors
- **Authentication**: Session-based with cookies
- **Error Handling**: Centralized error processing
- **Caching**: Strategic response caching

## Integration Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  Frontend Application                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Vue Views  │  │   Stores    │  │ Composables │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                   API Integration Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ API Client  │  │ Error Mgmt  │  │ Rate Limit  │         │
│  │(odooApiNext)│  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                  Network Transport                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Axios    │  │   HTTPS     │  │ JSON-RPC    │         │
│  │             │  │             │  │    2.0      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    Odoo Backend                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Custom      │  │   Core      │  │ PostgreSQL  │         │
│  │ Models      │  │  Models     │  │ Database    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Pattern

```
Frontend Request → API Client → JSON-RPC → Odoo → Database
     ↓                ↓           ↓         ↓        ↓
Response Handler ← Error Mgmt ← Response ← Logic ← Query Result
```

## API Client Design

### Core API Client Structure

```javascript
// /src/api/odooApiNext.js
import apiClient from "@/services/axios";

/**
 * Centralized Odoo API communication
 * @param {string} model - Odoo model name
 * @param {string} method - Method to call
 * @param {Array} args - Positional arguments
 * @param {Object} kwargs - Keyword arguments
 * @returns {Promise} API response data
 */
export async function callOdooModel(model, method, args = [], kwargs = {}) {
  const payload = {
    jsonrpc: "2.0",
    method: "call",
    params: {
      model,
      method,
      args,
      kwargs,
    },
    id: Date.now(),
  };

  try {
    const response = await apiClient.post("/web/dataset/call_kw", payload);

    if (response.data.error) {
      throw new Error(JSON.stringify(response.data.error));
    }

    return response.data.result;
  } catch (error) {
    console.error(`API Error - ${model}.${method}:`, error);
    throw error;
  }
}
```

### Specialized API Functions

#### Product Configuration APIs

```javascript
// Category management
export async function fetchCategories() {
  return callOdooModel("x_product_categories", "search_read", [], {
    fields: [
      "id",
      "x_name",
      "x_description",
      "x_supercategory_id",
      "x_img",
      "x_battery",
    ],
  });
}

export async function fetchSuperCategories() {
  return callOdooModel("x_supercategories", "search_read", [], {
    fields: ["id", "x_name", "x_description", "x_img"],
  });
}

// Configuration steps and options
export async function fetchSteps(categoryId) {
  return callOdooModel(
    "x_steps",
    "search_read",
    [[["x_product_category_id.id", "=", categoryId]]],
    {
      fields: [
        "id",
        "x_name",
        "x_title",
        "x_position",
        "x_choice_type",
        "x_product_category_id",
      ],
      order: "x_position asc",
    }
  );
}

export async function fetchOptions(stepIds = null) {
  const domain = stepIds ? [["x_step_id", "in", stepIds]] : [];
  return callOdooModel("x_options", "search_read", [domain], {
    fields: [
      "id",
      "x_name",
      "x_description",
      "x_price",
      "x_step_id",
      "x_default",
      "bound",
    ],
  });
}
```

#### Quote Management APIs

```javascript
// Quote creation with error handling
export async function createQuote(quoteData) {
  try {
    // Create sales order
    const orderId = await callOdooModel("sale.order", "create", [quoteData]);

    // Process order lines with product creation
    for (const line of quoteData.order_line) {
      if (line.display_type === "line_section") {
        await addSectionLine(orderId, line.name);
      } else {
        await createOrderLine(orderId, line);
      }
    }

    return orderId;
  } catch (error) {
    // Rollback on error
    if (orderId) {
      await callOdooModel("sale.order", "unlink", [[orderId]]);
    }
    throw error;
  }
}

// Section separator creation
export async function addSectionLine(
  orderId,
  sectionName = "Marcatore Batteria"
) {
  return callOdooModel("sale.order.line", "create", [
    {
      order_id: orderId,
      name: sectionName,
      display_type: "line_section",
    },
  ]);
}
```

#### Search and Discovery APIs

```javascript
// Universal search across multiple models
export async function searchAllEntities(keyword) {
  const searchDomain = [
    "|",
    ["x_name", "ilike", keyword],
    ["x_description", "ilike", keyword],
  ];

  // Parallel search across models
  const [categories, superCategories, steps, options] = await Promise.all([
    callOdooModel("x_product_categories", "search_read", [searchDomain]),
    callOdooModel("x_supercategories", "search_read", [searchDomain]),
    callOdooModel("x_steps", "search_read", [searchDomain]),
    callOdooModel("x_options", "search_read", [searchDomain]),
  ]);

  // Process and relate results
  return {
    superCategories: formatSearchResults(superCategories, "supercategory"),
    categories: formatSearchResults(categories, "category"),
    steps: formatSearchResults(steps, "step"),
    options: formatSearchResults(options, "option"),
  };
}
```

## Communication Patterns

### Request/Response Standardization

#### Standard Request Pattern

```javascript
// JSON-RPC 2.0 request structure
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "model": "x_product_categories",
    "method": "search_read",
    "args": [[["active", "=", true]]],
    "kwargs": {
      "fields": ["id", "x_name", "x_description"],
      "limit": 50,
      "offset": 0,
      "order": "x_name asc"
    }
  },
  "id": 1635789123456
}
```

#### Standard Response Handling

```javascript
// Success response
{
  "jsonrpc": "2.0",
  "id": 1635789123456,
  "result": [
    {
      "id": 1,
      "x_name": "Category Name",
      "x_description": "Description"
    }
  ]
}

// Error response
{
  "jsonrpc": "2.0",
  "id": 1635789123456,
  "error": {
    "code": 200,
    "message": "Odoo Server Error",
    "data": {
      "name": "odoo.exceptions.ValidationError",
      "message": "Validation failed",
      "debug": "Traceback..."
    }
  }
}
```

### Batch Operations

```javascript
// Batch multiple related operations
export async function createCompleteQuote(quoteData, products) {
  const operations = [];

  // Prepare batch operations
  operations.push(["sale.order", "create", [quoteData]]);

  for (const product of products) {
    operations.push(["sale.order.line", "create", [product]]);
  }

  // Execute as batch (if Odoo supports it) or sequentially
  return executeOperations(operations);
}
```

### Retry and Circuit Breaker Patterns

```javascript
// Retry mechanism with exponential backoff
async function apiCallWithRetry(operation, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries && isRetryableError(error)) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      break;
    }
  }

  throw lastError;
}
```

## Data Models Integration

### Custom Odoo Models

#### Product Configuration Models

```javascript
// x_product_categories model mapping
const ProductCategory = {
  id: Number,
  x_name: String,
  x_description: String,
  x_supercategory_id: [Number, String], // Many2one relationship
  x_img: String, // Base64 image data
  x_battery: Boolean, // Special battery category flag
};

// x_steps model mapping
const ConfigurationStep = {
  id: Number,
  x_name: String,
  x_title: String,
  x_position: Number,
  x_choice_type: String, // 'single_choice', 'multiple_choice'
  x_product_category_id: [Number, String],
  x_required_choice: Boolean,
  x_quantity_control: Boolean,
};

// x_options model mapping
const ConfigurationOption = {
  id: Number,
  x_name: String,
  x_name_readable: String,
  x_description: String,
  x_price: String, // Decimal as string
  x_step_id: [Number, String],
  x_default: Boolean,
  x_has_quantity: Boolean,
  x_qta_min: Number,
  x_qta_max: Number,
  bound: Array, // Related constraint IDs
};
```

#### Sales and Quote Models

```javascript
// sale.order integration
const SalesOrder = {
  id: Number,
  name: String, // Auto-generated quote number
  partner_id: [Number, String], // Customer reference
  user_id: [Number, String], // Salesperson
  state: String, // 'draft', 'sent', 'sale', 'done', 'cancel'
  amount_total: Number,
  order_line: Array, // Related order lines
};

// sale.order.line integration
const SalesOrderLine = {
  id: Number,
  order_id: [Number, String],
  name: String, // Product code/reference
  x_note_interne: String, // Configuration description
  product_uom_qty: Number, // Quantity
  price_unit: Number, // Unit price
  display_type: String, // 'line_section' for separators
};
```

### Data Transformation Patterns

```javascript
// Transform API data for frontend use
export function transformCategory(odooCategory) {
  return {
    id: odooCategory.id,
    name: odooCategory.x_name,
    description: odooCategory.x_description,
    supercategoryId: odooCategory.x_supercategory_id?.[0],
    supercategoryName: odooCategory.x_supercategory_id?.[1],
    imageData: odooCategory.x_img,
    hasBattery: odooCategory.x_battery,
    type: "category",
  };
}

// Transform frontend data for API
export function transformQuoteForAPI(frontendQuote) {
  return {
    partner_id: frontendQuote.customerId,
    order_line: frontendQuote.products.map((product) => ({
      name: product.code,
      x_note_interne: product.description,
      product_uom_qty: parseFloat(product.quantity),
      price_unit: parseFloat(product.price),
    })),
  };
}
```

## Error Handling Strategy

### Error Classification

```javascript
// Error type classification
const ErrorTypes = {
  NETWORK: "NETWORK_ERROR",
  AUTHENTICATION: "AUTH_ERROR",
  VALIDATION: "VALIDATION_ERROR",
  BUSINESS_LOGIC: "BUSINESS_ERROR",
  SERVER: "SERVER_ERROR",
};

export function classifyError(error) {
  if (!navigator.onLine) return ErrorTypes.NETWORK;
  if (error.response?.status === 401) return ErrorTypes.AUTHENTICATION;
  if (error.response?.status === 400) return ErrorTypes.VALIDATION;
  if (error.response?.status >= 500) return ErrorTypes.SERVER;

  return ErrorTypes.BUSINESS_LOGIC;
}
```

### Centralized Error Handling

```javascript
// Global error handler
export function handleAPIError(error, context = {}) {
  const errorType = classifyError(error);

  switch (errorType) {
    case ErrorTypes.AUTHENTICATION:
      // Redirect to login
      router.push("/login");
      break;

    case ErrorTypes.NETWORK:
      // Show network error message
      showNetworkErrorDialog();
      break;

    case ErrorTypes.VALIDATION:
      // Show validation errors
      showValidationErrors(error.response.data);
      break;

    default:
      // Log and show generic error
      console.error("API Error:", error, context);
      showGenericError();
  }
}
```

### Recovery Strategies

```javascript
// Automatic recovery for specific errors
export async function executeWithRecovery(operation, context) {
  try {
    return await operation();
  } catch (error) {
    const errorType = classifyError(error);

    if (errorType === ErrorTypes.AUTHENTICATION) {
      // Try to refresh session
      await refreshSession();
      return await operation(); // Retry once
    }

    if (errorType === ErrorTypes.NETWORK) {
      // Queue for retry when online
      queueForRetry(operation, context);
      throw error;
    }

    throw error;
  }
}
```

## Performance Optimization

### Request Optimization

```javascript
// Field selection optimization
export async function fetchCategoriesOptimized() {
  return callOdooModel("x_product_categories", "search_read", [], {
    fields: ["id", "x_name", "x_img"], // Only required fields
    limit: 20, // Pagination
  });
}

// Batch loading for related data
export async function loadCategoryWithSteps(categoryId) {
  const [category, steps, options] = await Promise.all([
    callOdooModel("x_product_categories", "read", [[categoryId]]),
    fetchSteps(categoryId),
    fetchOptions(), // Load all options once
  ]);

  return { category: category[0], steps, options };
}
```

### Caching Strategy

```javascript
// Simple cache implementation
const apiCache = new Map();

export async function cachedApiCall(cacheKey, apiFunction, ttl = 300000) {
  const cached = apiCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const data = await apiFunction();
  apiCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });

  return data;
}
```

### Rate Limiting

```javascript
// Client-side rate limiting
class RateLimiter {
  constructor(maxConcurrent = 10, delayBetween = 1000) {
    this.maxConcurrent = maxConcurrent;
    this.delayBetween = delayBetween;
    this.activeRequests = 0;
    this.lastRequestTime = 0;
    this.queue = [];
  }

  async execute(operation) {
    return new Promise((resolve, reject) => {
      this.queue.push({ operation, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.delayBetween) {
      setTimeout(
        () => this.processQueue(),
        this.delayBetween - timeSinceLastRequest
      );
      return;
    }

    const { operation, resolve, reject } = this.queue.shift();
    this.activeRequests++;
    this.lastRequestTime = Date.now();

    try {
      const result = await operation();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.activeRequests--;
      setTimeout(() => this.processQueue(), this.delayBetween);
    }
  }
}

export const rateLimiter = new RateLimiter();
```

## Security Implementation

### Authentication Management

```javascript
// Session handling
export async function authenticate(credentials) {
  const response = await apiClient.post("/web/session/authenticate", {
    jsonrpc: "2.0",
    method: "call",
    params: {
      db: process.env.VITE_DATABASE,
      login: credentials.username,
      password: credentials.password,
    },
  });

  if (response.data.result?.uid) {
    // Session cookie automatically handled by browser
    return response.data.result;
  }

  throw new Error("Authentication failed");
}

// Session validation
export async function validateSession() {
  try {
    const sessionInfo = await apiClient.post("/web/session/get_session_info");
    return sessionInfo.data.result?.uid ? true : false;
  } catch {
    return false;
  }
}
```

### Input Validation

```javascript
// API input sanitization
export function sanitizeSearchKeyword(keyword) {
  return keyword
    .trim()
    .replace(/[<>\"']/g, "") // Remove dangerous characters
    .substring(0, 100); // Limit length
}

// Domain filter validation
export function validateDomain(domain) {
  // Ensure domain follows Odoo format
  if (!Array.isArray(domain)) return false;

  // Additional validation logic
  return true;
}
```
