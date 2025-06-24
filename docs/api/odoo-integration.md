# Odoo Integration Documentation

This document provides a comprehensive overview of how the EcoDev Configurator application integrates with the Odoo ERP system for product configuration, quote management, and data operations.

## Overview

The application uses Odoo as its backend system through JSON-RPC API calls, implementing a modern web-based product configurator that interacts with custom Odoo models for managing product categories, configuration steps, options, and sales quotes.

## Architecture

### API Client Structure

The integration is built around a centralized API client that handles all communication with Odoo:

```javascript
// Primary API file
src/api/odooApiNext.js

// Helper files
src/services/axios.js        // HTTP client configuration
src/stores/                  // Pinia stores for state management
```

### Core Helper Function

All Odoo operations use a generic helper function that standardizes API calls:

```javascript
export async function callOdooModel(model, method, args = [], kwargs = {}) {
  const payload = {
    jsonrpc: "2.0",
    method: "call",
    params: { model, method, args, kwargs },
    id: Date.now(),
  };

  const response = await apiClient.post("/web/dataset/call_kw", payload);
  const { data } = response;

  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result;
}
```

**Key Benefits:**

- Uses `/web/dataset/call_kw` endpoint for better session cookie compatibility
- Standardized error handling across all API calls
- Simplified parameter passing without manual JSON-RPC formatting

## Custom Odoo Models

The application works with several custom Odoo models designed for product configuration:

### Product Categories (`x_product_categories`)

- **Purpose**: Organize products into hierarchical categories
- **Key Fields**: `x_name`, `x_description`, `x_supercategories_id`, `x_img`, `x_battery`
- **Usage**: Main navigation structure for the configurator

### Configuration Steps (`x_steps`)

- **Purpose**: Define sequential configuration steps within categories
- **Key Fields**: `x_name`, `x_position`, `x_choice_type`, `x_product_category_id`
- **Usage**: Control the configuration flow and user interface behavior

### Configuration Options (`x_options`)

- **Purpose**: Available choices within each configuration step
- **Key Fields**: `x_name`, `x_description`, `x_price`, `x_step_id`, `x_default`
- **Usage**: User selections that affect pricing and product specifications

### Constraints (`x_constraints`)

- **Purpose**: Define incompatible option combinations
- **Key Fields**: `x_option_id`, `x_restricted_option_id`, `x_description`
- **Usage**: Validation rules to prevent invalid configurations

### Rules (`x_rules`)

- **Purpose**: Calculation and validation logic
- **Key Fields**: `x_name`, `x_rule_type`, `x_parameter`, `x_category_id`
- **Usage**: Dynamic pricing and configuration validation

## Core Operations

### Search Functionality

The application implements a comprehensive search across multiple models:

```javascript
export async function searchAllEntities(keyword) {
  // Searches across categories, supercategories, steps, and options
  // Returns structured results with relationship mapping
}
```

**Search Features:**

- Case-insensitive matching on names and descriptions
- Cross-model relationship resolution
- Categorized result presentation

### Configuration Flow

The typical configuration process follows this pattern:

1. **Category Selection**: User selects a product category
2. **Step Retrieval**: System loads configuration steps for the category
3. **Option Loading**: Options are fetched for each step
4. **Constraint Validation**: System applies constraint rules
5. **Quote Generation**: Final configuration creates a sales order

### Quote Management

Quote creation is a multi-step process that handles product creation and order line management:

```javascript
export async function createQuote(quoteData) {
  // 1. Create sales order header
  // 2. Process each order line
  // 3. Create products if they don't exist
  // 4. Add order lines with proper relationships
  // 5. Handle rollback on errors
}
```

**Key Features:**

- Automatic product creation for new configurations
- Support for section separators (`line_section`)
- Comprehensive error handling with rollback
- Integration with Odoo's sales workflow

## State Management

The application uses Pinia stores to manage Odoo data:

### Software Store Example

```javascript
// stores/softwareStore.js
export const useSoftwareStore = defineStore("software", {
  state: () => ({
    options: [],
    loading: false,
    error: null,
  }),

  actions: {
    async loadSoftwareOptions() {
      const options = await fetchOptionsByCategoryId(SOFTWARE_CATEGORY_ID);
      this.options = options;
    },
  },
});
```

## Authentication & Session Management

### Session-Based Authentication

- Uses Odoo's built-in session management
- Automatic cookie handling for authenticated requests
- Session validation on protected routes

### Authentication Flow

1. User credentials sent to `/web/session/authenticate`
2. Session cookie automatically managed by browser
3. Subsequent API calls include session information
4. Logout destroys session via `/web/session/destroy`

## Error Handling

### Standardized Error Response

All API errors follow the JSON-RPC 2.0 standard:

```json
{
  "jsonrpc": "2.0",
  "id": null,
  "error": {
    "code": 200,
    "message": "Odoo Server Error",
    "data": {
      "name": "odoo.exceptions.ValidationError",
      "message": "Error details"
    }
  }
}
```

### Error Recovery Strategies

- Automatic retry mechanisms for transient failures
- Rollback operations for incomplete transactions
- User-friendly error messages with technical details in console

## Performance Optimizations

### Data Fetching Strategies

- Lazy loading of configuration options
- Filtered queries to reduce payload size
- Caching of frequently accessed data

### Rate Limiting

- Client-side request throttling
- Batched operations where possible
- Optimized query structures

## Integration Patterns

### Domain-Driven Queries

Odoo uses domain filters for complex queries:

```javascript
// Example: Find options for specific steps
const domain = [["x_step_id", "in", stepIds]];
const options = await callOdooModel("x_options", "search_read", [domain]);
```

### Relationship Handling

- Many2one relationships returned as `[id, 'display_name']` tuples
- One2many relationships as arrays of IDs
- Proper field selection to minimize data transfer

### Batch Operations

- Multiple order lines created in a single transaction
- Bulk constraint checking
- Efficient product lookups and creation

## Development Environment

### API Configuration

```javascript
// Environment variables
VITE_API_BASE_URL=https://your-odoo-instance.com
VITE_DATABASE=your_database_name
```

### Testing & Debugging

- Debug functions for model inspection (`getRequiredFields`)
- Console logging for operation tracking
- Comprehensive error reporting

## Security Considerations

### Data Protection

- HTTPS-only communication in production
- Session-based authentication
- Input validation on both client and server sides

### Access Control

- Odoo's built-in permission system
- Model-level access restrictions
- Field-level security where appropriate

## Best Practices

### API Usage

- Always use the centralized `callOdooModel` function
- Implement proper error handling for all operations
- Use domain filters instead of client-side filtering
- Cache results when appropriate

### Performance

- Limit field selection to required data only
- Use pagination for large datasets
- Implement progressive loading for complex configurations

### Maintainability

- Keep API functions focused and single-purpose
- Document custom model relationships
- Use consistent naming conventions
- Implement comprehensive logging for debugging

This integration provides a robust foundation for the product configurator while maintaining flexibility for future enhancements
