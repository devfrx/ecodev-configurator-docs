# State Management Architecture

This document provides a comprehensive overview of the state management architecture in the EcoDev Configurator, implemented using Pinia stores with persistence and reactive patterns.

## Table of Contents

- [Overview](#overview)
- [Store Architecture](#store-architecture)
- [Core Stores](#core-stores)
- [State Patterns](#state-patterns)
- [Data Flow](#data-flow)
- [Persistence Strategy](#persistence-strategy)
- [Best Practices](#best-practices)

## Overview

The EcoDev Configurator uses **Pinia** as its state management solution, providing a modern, TypeScript-friendly approach to centralized state management with automatic persistence and devtools integration.

### Key Benefits

- **Type Safety**: Full TypeScript support with automatic inference
- **Devtools Integration**: Vue DevTools support for debugging
- **Automatic Persistence**: Seamless localStorage integration
- **Modular Design**: Feature-based store organization
- **Reactive**: Deep integration with Vue's reactivity system

### Architecture Principles

- **Domain-Driven Stores**: Each store represents a business domain
- **Single Source of Truth**: Centralized state for each domain
- **Immutable Updates**: State changes through actions only
- **Computed Derived State**: Use getters for calculated values

## Store Architecture

### Store Structure Pattern

```javascript
export const useExampleStore = defineStore("storeName", {
  state: () => ({
    // Raw reactive state
    data: [],
    loading: false,
    error: null,
  }),

  getters: {
    // Computed properties
    filteredData: (state) => state.data.filter(/* criteria */),
    isReady: (state) => !state.loading && !state.error,
  },

  actions: {
    // Async operations and state mutations
    async loadData() {
      this.loading = true;
      try {
        this.data = await fetchData();
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
  },

  persist: true, // Enable automatic persistence
});
```

### Global Store Configuration

```javascript
// main.js
import { createPinia } from "pinia";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";

const pinia = createPinia();
pinia.use(piniaPluginPersistedState);
```

## Core Stores

### 1. Authentication Store (`auth.js`)

**Purpose**: Manages user authentication and session state.

```javascript
export const useAuthStore = defineStore("auth", {
  state: () => ({
    user_id: null,
    username: null,
    isAuthenticated: false,
    session_id: null,
    login_timestamp: null,
  }),

  getters: {
    currentUser: (state) => ({
      id: state.user_id,
      username: state.username,
    }),
    sessionDuration: (state) =>
      state.login_timestamp ? Date.now() - state.login_timestamp : 0,
  },

  actions: {
    async login(credentials) {
      // Authentication logic with Odoo
    },

    logout() {
      this.$reset(); // Clear all state
    },

    updateSession(sessionData) {
      // Update session information
    },
  },

  persist: {
    key: "ecodev-auth",
    storage: localStorage,
    paths: ["user_id", "username", "isAuthenticated"],
  },
});
```

**Key Features**:

- Session management with Odoo integration
- Automatic session persistence
- User information caching
- Login state tracking

### 2. Configurator Store (`configuratorStore.js`)

**Purpose**: Manages the active product configuration state.

```javascript
export const useConfiguratorStore = defineStore("configurator", {
  state: () => ({
    configuratorTree: [], // Available configuration steps
    selectedOptions: {}, // User selections by step
    constrainedOptions: [], // Options disabled by constraints
    currentCategoryId: null, // Active category
    steps: [], // Category steps
    loading: false,
    error: null,
  }),

  getters: {
    currentStep: (state) => (stepPosition) =>
      state.steps.find((step) => step.x_position === stepPosition),

    isStepComplete: (state) => (stepPosition) =>
      state.selectedOptions[stepPosition] !== undefined,

    totalSelectedPrice: (state) => {
      // Calculate total price from selected options
      return Object.values(state.selectedOptions)
        .flat()
        .reduce((sum, option) => sum + parseFloat(option.x_price || 0), 0);
    },
  },

  actions: {
    async loadSteps(categoryId) {
      this.loading = true;
      try {
        this.steps = await fetchSteps(categoryId);
        this.currentCategoryId = categoryId;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    selectOption(stepPosition, option) {
      // Handle option selection with constraint validation
      this.selectedOptions[stepPosition] = option;
      this.applyConstraints();
    },

    applyConstraints() {
      // Apply constraint logic
      this.constrainedOptions = this.calculateConstraints();
    },

    resetConfiguration() {
      this.selectedOptions = {};
      this.constrainedOptions = [];
    },
  },

  persist: {
    key: "ecodev-configurator",
    storage: localStorage,
    paths: ["selectedOptions", "currentCategoryId"],
  },
});
```

**Key Features**:

- Step-by-step configuration management
- Constraint handling and validation
- Option selection persistence
- Price calculation

### 3. Summary Store (`summaryStore.js`)

**Purpose**: Manages the shopping cart and quote summary.

```javascript
export const useSummaryStore = defineStore("summary", {
  state: () => ({
    createdProducts: [], // Products in cart
    software: null, // Software configuration
    generalDiscount: 0, // Overall discount
    delivery: null, // Delivery options
    assembly: null, // Assembly options
    quoteNumber: null, // Generated quote number
    totalProducts: 0, // Product count
    totalProductsWithDiscount: 0, // Price after discounts
    grandTotalWithExtraDiscount: 0, // Final total
  }),

  getters: {
    productCount: (state) => state.createdProducts.length,

    subtotal: (state) =>
      state.createdProducts.reduce(
        (sum, product) => sum + product.x_price * product.desiredQuantity,
        0
      ),

    hasProducts: (state) => state.createdProducts.length > 0,

    softwareTotal: (state) =>
      state.software ? parseFloat(state.software.x_total || 0) : 0,
  },

  actions: {
    addProduct(product) {
      const existingIndex = this.createdProducts.findIndex(
        (p) => p.uniqueId === product.uniqueId
      );

      if (existingIndex >= 0) {
        this.createdProducts[existingIndex] = product;
      } else {
        this.createdProducts.push(product);
      }

      this.recalculateTotals();
    },

    removeProduct(uniqueId) {
      this.createdProducts = this.createdProducts.filter(
        (p) => p.uniqueId !== uniqueId
      );
      this.recalculateTotals();
    },

    duplicateProduct(uniqueId) {
      const product = this.createdProducts.find((p) => p.uniqueId === uniqueId);
      if (product) {
        const duplicate = {
          ...product,
          uniqueId: generateUniqueId(),
        };
        this.createdProducts.push(duplicate);
        this.recalculateTotals();
      }
    },

    setSoftware(softwareData) {
      this.software = softwareData;
      this.recalculateTotals();
    },

    recalculateTotals() {
      // Complex calculation logic for totals
      this.totalProducts = this.subtotal;
      this.totalProductsWithDiscount = this.calculateWithDiscount();
      this.grandTotalWithExtraDiscount = this.calculateGrandTotal();
    },

    clearCart() {
      this.createdProducts = [];
      this.software = null;
      this.recalculateTotals();
    },
  },

  persist: {
    key: "ecodev-summary",
    storage: localStorage,
    // Persist everything except temporary calculations
    paths: [
      "createdProducts",
      "software",
      "generalDiscount",
      "delivery",
      "assembly",
    ],
  },
});
```

**Key Features**:

- Shopping cart functionality
- Product manipulation (add, remove, duplicate)
- Total calculations with discounts
- Software licensing integration
- Quote number generation

### 4. Category Store (`categoryStore.js`)

**Purpose**: Manages product categories and navigation.

```javascript
export const useCategoryStore = defineStore("category", {
  state: () => ({
    superCategories: [],
    categories: [],
    selectedSuperCategory: null,
    selectedCategory: null,
    loading: false,
    error: null,
  }),

  getters: {
    categoriesBySuper: (state) => (superCategoryId) =>
      state.categories.filter(
        (cat) => cat.x_supercategory_id?.[0] === superCategoryId
      ),

    hasBattery: (state) => (categoryId) => {
      const category = state.categories.find((cat) => cat.id === categoryId);
      return category?.x_battery === true;
    },
  },

  actions: {
    async loadSuperCategories() {
      this.loading = true;
      try {
        this.superCategories = await fetchSuperCategories();
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async loadCategories() {
      this.loading = true;
      try {
        this.categories = await fetchCategories();
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    selectSuperCategory(superCategory) {
      this.selectedSuperCategory = superCategory;
      this.selectedCategory = null; // Reset category selection
    },

    selectCategory(category) {
      this.selectedCategory = category;
    },
  },

  persist: true,
});
```

### 5. Software Store (`softwareStore.js`)

**Purpose**: Manages software licensing options and calculations.

```javascript
export const useSoftwareStore = defineStore("software", {
  state: () => ({
    options: [], // Available software options
    loading: false,
    error: null,
  }),

  getters: {
    gsmOption: (state) => state.options.find((opt) => opt.x_code === "GSM01"),

    softwareByCode: (state) => (code) =>
      state.options.find((opt) => opt.x_code === code),

    softwareTiers: (state) =>
      state.options.filter((opt) =>
        ["SOFT1", "SOFT2", "SOFT3"].includes(opt.x_code)
      ),
  },

  actions: {
    async loadSoftwareOptions() {
      if (this.options.length > 0) return; // Already loaded

      this.loading = true;
      try {
        this.options = await fetchOptionsByCategoryId(SOFTWARE_CATEGORY_ID);
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
  },

  persist: true,
});
```

### 6. Partner Store (`partnerStore.js`)

**Purpose**: Manages customer/partner information.

```javascript
export const usePartnerStore = defineStore("partner", {
  state: () => ({
    partners: [],
    selectedClient: null,
    loading: false,
    error: null,
  }),

  getters: {
    clientById: (state) => (id) =>
      state.partners.find((partner) => partner.id === id),

    hasSelectedClient: (state) => state.selectedClient !== null,
  },

  actions: {
    async loadPartners(userIds = null) {
      this.loading = true;
      try {
        this.partners = await fetchPartners(userIds);
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async createPartner(partnerData) {
      this.loading = true;
      try {
        const partnerId = await createPartner(partnerData);
        await this.loadPartners(); // Refresh list
        return partnerId;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    selectClient(client) {
      this.selectedClient = client;
    },

    clearSelection() {
      this.selectedClient = null;
    },
  },

  persist: {
    key: "ecodev-partners",
    storage: localStorage,
    paths: ["selectedClient"], // Only persist selection
  },
});
```

## State Patterns

### 1. Loading States

```javascript
// Standard loading pattern
state: () => ({
  data: [],
  loading: false,
  error: null
}),

actions: {
  async loadData() {
    this.loading = true;
    this.error = null;
    try {
      this.data = await apiCall();
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }
}
```

### 2. Error Handling

```javascript
// Centralized error management
actions: {
  async performAction() {
    try {
      // Action logic
    } catch (error) {
      this.error = {
        message: error.message,
        code: error.code,
        timestamp: Date.now()
      };
      // Optionally re-throw for component handling
      throw error;
    }
  }
}
```

### 3. Optimistic Updates

```javascript
// Optimistic update pattern
actions: {
  async updateItem(id, data) {
    // Optimistically update UI
    const originalItem = this.items.find(item => item.id === id);
    const index = this.items.findIndex(item => item.id === id);
    this.items[index] = { ...originalItem, ...data };

    try {
      await updateItemAPI(id, data);
    } catch (error) {
      // Revert on failure
      this.items[index] = originalItem;
      throw error;
    }
  }
}
```

## Data Flow

### Store Communication Patterns

```javascript
// Cross-store communication via composables
export function useCartManager() {
  const summary = useSummaryStore();
  const configurator = useConfiguratorStore();

  const addConfiguredProduct = () => {
    const product = buildProductFromConfiguration(configurator.selectedOptions);
    summary.addProduct(product);
    configurator.resetConfiguration();
  };

  return { addConfiguredProduct };
}
```

### Component Integration

```javascript
// Component usage pattern
<script setup>
import { useConfiguratorStore } from '@/stores/configuratorStore';
import { computed } from 'vue';

const configuratorStore = useConfiguratorStore();

// Reactive computed properties
const isReady = computed(() => !configuratorStore.loading);
const totalPrice = computed(() => configuratorStore.totalSelectedPrice);

// Actions
const selectOption = (stepPosition, option) => {
  configuratorStore.selectOption(stepPosition, option);
};
</script>
```

## Persistence Strategy

### Selective Persistence

```javascript
persist: {
  key: 'unique-store-key',
  storage: localStorage,
  paths: ['criticalData', 'userPreferences'], // Only persist specific paths
  beforeRestore: (context) => {
    // Validation before restoring
  },
  afterRestore: (context) => {
    // Post-restore logic
  }
}
```

### Security Considerations

- **Sensitive Data**: Authentication tokens excluded from persistence
- **Data Validation**: Restored data validated before use
- **Version Control**: Store schema versioning for migrations

## Best Practices

### 1. Store Design

- **Single Responsibility**: Each store manages one domain
- **Minimal State**: Only store what's necessary
- **Normalized Data**: Avoid nested object updates
- **Computed Getters**: Use getters for derived state

### 2. Action Design

- **Async/Await**: Consistent async pattern
- **Error Boundaries**: Proper error handling
- **Loading States**: Always manage loading indicators
- **Side Effects**: Keep actions pure when possible

### 3. Performance

- **Lazy Loading**: Load stores on demand
- **Selective Watching**: Watch specific store properties
- **Batch Updates**: Group related state changes
- **Memory Management**: Clean up when appropriate

### 4. Testing

- **Store Isolation**: Test stores independently
- **Action Testing**: Test async actions with mock APIs
- **State Assertions**: Verify state changes
- **Integration Testing**: Test store interactions

This state management architecture provides a robust, scalable foundation for the EcoDev Configurator's complex data management needs while maintaining performance and developer experience.
