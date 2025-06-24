# Application Architecture Overview

Welcome to the **EcoDev Configurator** architecture documentation. This section provides a comprehensive overview of the application's technical architecture, design patterns, and structural organization.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technical Stack](#technical-stack)
- [Application Layers](#application-layers)
- [Core Patterns](#core-patterns)
- [Data Flow](#data-flow)
- [Module Organization](#module-organization)
- [Integration Points](#integration-points)

## Architecture Overview

The EcoDev Configurator follows a **modern Vue.js 3 architecture** with a clear separation of concerns, reactive state management, and modular design principles.

### Architectural Principles

- **Component-Based Architecture**: Reusable Vue components with clear responsibilities
- **Reactive State Management**: Centralized state with Pinia stores
- **API-First Design**: Clean separation between frontend and Odoo backend
- **Mobile-First Approach**: Responsive design with Ionic Framework
- **Composition API Pattern**: Modern Vue.js patterns for better code organization

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Views    │  │ Components  │  │ Composables │         │
│  │             │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                   State Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Pinia Store │  │ Local State │  │ Persistence │         │
│  │             │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                  Integration Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ API Client  │  │ Utils/Libs  │  │ Services    │         │
│  │             │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                   Backend Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Odoo ERP    │  │ JSON-RPC    │  │ PostgreSQL  │         │
│  │             │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Technical Stack

### Frontend Technologies

- **Vue.js 3**: Progressive JavaScript framework with Composition API
- **Ionic Vue 7**: Cross-platform UI components and mobile capabilities
- **Pinia**: State management with TypeScript support and devtools
- **Vue Router 4**: Client-side routing with guards and lazy loading
- **Vite**: Fast build tool with hot module replacement

### Supporting Libraries

- **pdfMake**: Client-side PDF generation with custom layouts
- **Capacitor**: Native mobile functionality bridge
- **Lodash**: Utility functions for data manipulation
- **Axios**: HTTP client for API communication

### Backend Integration

- **Odoo 16+**: ERP system with custom models
- **JSON-RPC 2.0**: API communication protocol
- **PostgreSQL**: Database (managed by Odoo)

## Application Layers

### 1. Presentation Layer (`/views` + `/components`)

**Purpose**: User interface and user experience

**Key Components**:

- **Views**: Page-level components (HomePage, ConfiguratorPage2, SummaryPage)
- **Components**: Reusable UI elements (CategoryCard, OptionItem, SearchBar)
- **Routing**: Navigation and route protection

**Responsibilities**:

- User interface rendering
- User interaction handling
- Navigation management
- Input validation and feedback

### 2. Business Logic Layer (`/composables` + `/stores`)

**Purpose**: Application state and business rules

**Key Elements**:

- **Composables**: Reusable logic functions (useConstraintsManager, usePdfMaker)
- **Stores**: Centralized state management (configuratorStore, summaryStore)
- **Computed Properties**: Reactive derived state

**Responsibilities**:

- State management and persistence
- Business rule enforcement
- Data transformation and validation
- Cross-component communication

### 3. Data Access Layer (`/api` + `/services`)

**Purpose**: External system integration

**Key Components**:

- **API Client**: Odoo integration (odooApiNext.js)
- **Services**: Utility services (axios configuration)
- **Data Models**: Type definitions and interfaces

**Responsibilities**:

- API communication
- Data serialization/deserialization
- Error handling and retry logic
- Session management

## Core Patterns

### 1. Composition API Pattern

```javascript
// Example from useConstraintsManager.js
export function useConstraintsManager() {
  const constrainedOptions = ref([]);
  const loading = ref(false);

  const applyConstraints = (selectedOptions) => {
    // Constraint logic
  };

  return {
    constrainedOptions: readonly(constrainedOptions),
    loading: readonly(loading),
    applyConstraints,
  };
}
```

### 2. Store Pattern (Pinia)

```javascript
// Example from configuratorStore.js
export const useConfiguratorStore = defineStore("configurator", {
  state: () => ({
    steps: [],
    selectedOptions: {},
    currentStep: 0,
  }),

  actions: {
    async loadSteps(categoryId) {
      // Action implementation
    },
  },

  persist: true, // Automatic persistence
});
```

### 3. Repository Pattern (API Layer)

```javascript
// Example from odooApiNext.js
export async function callOdooModel(model, method, args = [], kwargs = {}) {
  const payload = {
    jsonrpc: "2.0",
    method: "call",
    params: { model, method, args, kwargs },
  };

  const response = await apiClient.post("/web/dataset/call_kw", payload);
  return response.data.result;
}
```

## Data Flow

### Configuration Flow

```
User Input → Component → Store Action → API Call → Odoo Backend
    ↓           ↓          ↓            ↓           ↓
UI Update ← Reactive ← State Update ← Response ← Database
```

### State Management Flow

1. **User Interaction**: Component receives user input
2. **Action Dispatch**: Component calls store action
3. **State Update**: Store updates reactive state
4. **UI Reactivity**: Components automatically re-render
5. **Persistence**: State automatically saved to localStorage

### API Communication Flow

1. **Request Formation**: Standardized JSON-RPC payload
2. **HTTP Transport**: Axios with session cookies
3. **Response Processing**: Error handling and data extraction
4. **State Integration**: Results merged into reactive state

## Module Organization

### Feature-Based Organization

```
src/
├── views/              # Page components
│   ├── HomePage.vue
│   ├── ConfiguratorPage2.vue
│   └── SummaryPage.vue
├── components/         # Reusable components
│   ├── CategoryCard.vue
│   ├── OptionItem.vue
│   └── SearchBar.vue
├── composables/        # Business logic
│   ├── configuratorsPageComps/
│   ├── summaryPageComps/
│   └── shared/
└── stores/            # State management
    ├── auth.js
    ├── configuratorStore.js
    └── summaryStore.js
```

### Domain-Driven Structure

- **Authentication Domain**: `auth.js`, `LoginPage.vue`
- **Configuration Domain**: `configuratorStore.js`, `ConfiguratorPage2.vue`, `useConstraintsManager.js`
- **Quote Management Domain**: `summaryStore.js`, `SummaryPage.vue`, `usePdfMaker.js`
- **Product Catalog Domain**: `categoryStore.js`, `SearchPage.vue`

## Integration Points

### 1. Odoo ERP Integration

**Connection Method**: JSON-RPC 2.0 over HTTPS
**Authentication**: Session-based with cookies
**Data Models**: Custom Odoo models (x_product_categories, x_steps, x_options)

**Key Integration Features**:

- Real-time product configuration
- Quote creation and management
- Customer data synchronization
- Constraint validation

### 2. PDF Generation

**Library**: pdfMake (client-side)
**Pattern**: Document definition builder
**Output**: Professional PDF quotes

### 3. Mobile Platform Integration

**Framework**: Capacitor
**Capabilities**:

- File system access
- Native PDF viewing
- Email sharing
- Platform detection

### 4. State Persistence

**Method**: localStorage with pinia-plugin-persistedstate
**Scope**: User sessions, configuration progress, cart data
**Benefits**: Seamless user experience across browser sessions

## Performance Considerations

### 1. Lazy Loading

- **Route-based**: Pages loaded on demand
- **Component-based**: Heavy components loaded when needed
- **API-based**: Data fetched progressively

### 2. State Optimization

- **Selective Persistence**: Only critical data persisted
- **Computed Caching**: Expensive calculations cached
- **Reactive Efficiency**: Minimal reactive surface area

### 3. API Efficiency

- **Batch Operations**: Multiple related operations combined
- **Field Selection**: Only required fields fetched
- **Caching Strategy**: Appropriate data caching

## Security Architecture

### 1. Authentication

- **Session Management**: Odoo-managed sessions
- **Route Protection**: Vue Router guards
- **Token Handling**: Automatic cookie management

### 2. Data Validation

- **Input Sanitization**: Client and server-side validation
- **Type Safety**: Progressive TypeScript adoption
- **Constraint Enforcement**: Business rule validation

### 3. Communication Security

- **HTTPS Only**: Encrypted communication
- **CORS Handling**: Proper cross-origin configuration
- **Error Handling**: Secure error messages

This architecture enables scalable, maintainable, and performant development while providing a solid foundation for future enhancements and integrations.
