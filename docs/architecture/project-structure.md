# Project Structure

This document details the complete project structure of the EcoDev Configurator, explaining the organization, purpose, and relationships between different modules and files.

## Table of Contents

- [Overview](#overview)
- [Source Code Structure](#source-code-structure)
- [Directory Details](#directory-details)
- [File Organization Patterns](#file-organization-patterns)
- [Module Dependencies](#module-dependencies)
- [Naming Conventions](#naming-conventions)

## Overview

The EcoDev Configurator follows a **feature-based architecture** with clear separation of concerns. The project is organized to promote maintainability, scalability, and developer productivity.

### Architectural Principles

- **Domain Separation**: Features grouped by business domain
- **Component Reusability**: Shared components in dedicated directories
- **Single Responsibility**: Each file has a clear, focused purpose
- **Dependency Management**: Clear import/export patterns

## Source Code Structure

```
src/
├── api/                    # External API integration
│   ├── odooApiNext.js     # Main Odoo API client
│   ├── odooApiNextBackUp.js # Backup/alternative implementation
│   └── odooApiNextOld.js  # Legacy version (deprecated)
├── assets/                # Static assets
│   ├── ectrl-logo.png     # Application logo
│   └── ...                # Images, icons, fonts
├── components/            # Reusable Vue components
│   ├── Alert.vue          # Alert/notification component
│   ├── CategoryCard.vue   # Product category display
│   ├── ConfiguratorProgress.vue # Progress indicator
│   ├── LoadingOverlay.vue # Loading state overlay
│   ├── ModalOptionDetail.vue # Option detail modal
│   ├── NavBar.vue         # Navigation component
│   ├── OptionItem.vue     # Configuration option component
│   ├── QuoteTable.vue     # Quote display table
│   ├── SearchBar.vue      # Universal search component
│   └── UserCard.vue       # User information display
├── composables/           # Reusable business logic
│   ├── configuratorsPageComps/ # Configuration-specific logic
│   │   ├── useConstraintsManager.js # Constraint handling
│   │   ├── useNavigationWarnings.js # Navigation alerts
│   │   └── useStepNavigation.js # Step-by-step navigation
│   ├── summaryPageComps/  # Quote summary logic
│   │   ├── useSummaryAlertManager.js # Alert management
│   │   ├── useSummaryProductActions.js # Product actions
│   │   └── useSummarySoftware.js # Software licensing
│   ├── useDocDefinition.js # PDF document generation
│   ├── useGenId.js        # ID generation utility
│   └── usePdfMaker.js     # PDF creation and handling
├── data_structure/        # Static data definitions
│   ├── constraints.js     # Constraint definitions
│   ├── options.js         # Option configurations
│   ├── product_categories.js # Category definitions
│   └── steps.js           # Configuration step definitions
├── lib/                   # Utility libraries
│   ├── checkCode.js       # Code validation utilities
│   ├── htmlSummary.js     # HTML summary generation
│   └── htmlSummaryOld.js  # Legacy HTML generation
├── router/                # Vue Router configuration
│   └── index.js           # Route definitions and guards
├── services/              # External service integrations
│   └── axios.js           # HTTP client configuration
├── stores/                # Pinia state management
│   ├── auth.js            # Authentication state
│   ├── categoryStore.js   # Product categories
│   ├── configuratorStore.js # Configuration state
│   ├── partnerStore.js    # Customer/partner management
│   ├── ruleStore.js       # Business rules
│   ├── softwareStore.js   # Software licensing
│   └── summaryStore.js    # Quote/cart management
├── theme/                 # Styling and themes
│   ├── themes.css         # Theme definitions
│   └── variables.css      # CSS custom properties
├── utils/                 # General utilities
│   └── pinia-state.json   # State snapshots (development)
├── views/                 # Page-level components
│   ├── BatteryUnitConfigPage.vue # Battery configuration
│   ├── CategoriesPage.vue # Category selection
│   ├── ConfiguratorPage2.vue # Main configuration
│   ├── ConfirmationPage.vue # Quote confirmation
│   ├── DocumentationPage.vue # Product documentation
│   ├── HomePage.vue       # Application home
│   ├── LoginPage.vue      # User authentication
│   ├── SearchPage.vue     # Universal search
│   ├── SummaryPage.vue    # Quote summary/cart
│   ├── SuperCategoriesPage.vue # Supercategory selection
│   └── TestPage.vue       # Development testing
├── App.vue                # Root component
├── main.js                # Application entry point
└── vite-env.d.js          # Vite type definitions
```

## Directory Details

### `/api` - External Integration Layer

**Purpose**: Handles all external API communication, primarily with Odoo ERP.

**Key Files**:

- **`odooApiNext.js`**: Main API client with standardized error handling
- **`odooApiNextBackUp.js`**: Alternative implementation for fallback
- **`odooApiNextOld.js`**: Legacy version maintained for compatibility

**Patterns**:

```javascript
// Standardized API call pattern
export async function callOdooModel(model, method, args = [], kwargs = {}) {
  // Centralized request handling
}

// Feature-specific functions
export async function fetchCategories() {
  return callOdooModel('x_product_categories', 'search_read', ...);
}
```

### `/components` - Reusable UI Components

**Purpose**: Self-contained, reusable Vue components with clear interfaces.

**Organization Principles**:

- **Single Responsibility**: Each component has one clear purpose
- **Prop-Driven**: Configuration through props, not global state
- **Event-Based**: Communication through custom events
- **Slot Support**: Flexible content composition

**Component Categories**:

- **Display Components**: `CategoryCard`, `OptionItem`, `UserCard`
- **Layout Components**: `NavBar`, `LoadingOverlay`
- **Interactive Components**: `SearchBar`, `Alert`
- **Data Components**: `QuoteTable`, `ConfiguratorProgress`

### `/composables` - Business Logic Layer

**Purpose**: Reusable business logic following the Composition API pattern.

**Organization Strategy**:

- **Feature Grouping**: Related logic grouped in subdirectories
- **Single Concern**: Each composable handles one specific area
- **Reactive Returns**: Consistent reactive state exposure

**Subdirectories**:

- **`configuratorsPageComps/`**: Configuration flow logic
- **`summaryPageComps/`**: Quote management logic
- **Root level**: Shared utilities and cross-cutting concerns

### `/stores` - State Management

**Purpose**: Centralized application state using Pinia with persistence.

**Store Organization**:

```javascript
// Standard store pattern
export const useExampleStore = defineStore("example", {
  state: () => ({
    // Reactive state
  }),

  getters: {
    // Computed properties
  },

  actions: {
    // State mutations and async operations
  },

  persist: true, // Optional persistence
});
```

**Store Domains**:

- **`auth.js`**: User authentication and session
- **`configuratorStore.js`**: Product configuration state
- **`summaryStore.js`**: Shopping cart and quote management
- **`categoryStore.js`**: Product catalog navigation
- **`softwareStore.js`**: Software licensing logic
- **`partnerStore.js`**: Customer management
- **`ruleStore.js`**: Business rules and constraints

### `/views` - Page Components

**Purpose**: Top-level page components corresponding to application routes.

**Routing Structure**:

```javascript
// Route to component mapping
{
  path: '/',
  component: HomePage
},
{
  path: '/configurator/:categoryId',
  component: ConfiguratorPage2
},
{
  path: '/summary',
  component: SummaryPage
}
```

**Page Responsibilities**:

- **Layout Orchestration**: Arrange child components
- **Store Integration**: Connect multiple stores
- **Route Handling**: Manage route parameters and navigation
- **Error Boundaries**: Handle page-level errors

### `/composables` Structure Details

#### Configuration Logic (`configuratorsPageComps/`)

```javascript
// useConstraintsManager.js
export function useConstraintsManager() {
  // Handles option constraints and validation
  const constrainedOptions = ref([]);
  const applyConstraints = (selectedOptions) => {
    // Constraint application logic
  };
  return { constrainedOptions, applyConstraints };
}

// useStepNavigation.js
export function useStepNavigation() {
  // Manages step-by-step navigation
  const currentStep = ref(0);
  const canProceed = computed(() => /* validation */);
  return { currentStep, canProceed, nextStep, previousStep };
}
```

#### Summary Logic (`summaryPageComps/`)

```javascript
// useSummarySoftware.js
export function useSummarySoftware(products, formatEuro) {
  // Software licensing calculations
  const softwareTotal = computed(() => /* calculation */);
  const selectedTier = computed(() => /* tier logic */);
  return { softwareTotal, selectedTier };
}
```

## File Organization Patterns

### Naming Conventions

- **Vue Components**: PascalCase (e.g., `CategoryCard.vue`)
- **Composables**: camelCase with `use` prefix (e.g., `useConstraintsManager.js`)
- **Stores**: camelCase with descriptive suffix (e.g., `configuratorStore.js`)
- **Utilities**: camelCase descriptive names (e.g., `checkCode.js`)
- **Views**: PascalCase with `Page` suffix (e.g., `HomePage.vue`)

### Import/Export Patterns

```javascript
// Named exports for utilities
export function utilityFunction() {}
export const CONSTANT = "value";

// Default exports for components
export default {
  name: "ComponentName",
  // component definition
};

// Store exports
export const useStoreName = defineStore("storeName", {
  // store definition
});
```

### File Structure Standards

```javascript
// Standard Vue component structure
<template>
  <!-- Component template -->
</template>

<script setup>
// Imports
import { ref, computed } from 'vue';
import { useStore } from '@/stores/storeName';

// Reactive state
const localState = ref(null);

// Computed properties
const computedValue = computed(() => /* logic */);

// Methods
function handleAction() {
  // Method implementation
}
</script>

<style scoped>
/* Component-specific styles */
</style>
```

## Module Dependencies

### Dependency Flow

```
Views → Stores + Composables → API + Utils
  ↓         ↓           ↓        ↓      ↓
Components → Services → External APIs
```

### Import Guidelines

- **Absolute Imports**: Use `@/` alias for src directory references
- **Relative Imports**: Only for closely related files
- **Barrel Exports**: Group related exports in index files where appropriate

### Circular Dependency Prevention

- **Store Independence**: Stores don't directly import other stores
- **Composable Isolation**: Composables are self-contained
- **Component Hierarchy**: Clear parent-child relationships

## Configuration Files

### Build Configuration

- **`vite.config.js`**: Build tool configuration
- **`package.json`**: Dependencies and scripts
- **`.env`**: Environment variables

### Application Configuration

- **`src/main.js`**: Application bootstrap
- **`src/router/index.js`**: Route configuration
- **Ionic**: Framework configuration and plugins

This project structure promotes maintainable, scalable development while ensuring clear separation of concerns and consistent organization patterns.
