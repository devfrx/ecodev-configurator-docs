# Integrazione Odoo - EcoDev Configurator

Questa guida documenta l'integrazione tra l'applicazione EcoDev Configurator e il sistema backend Odoo, incluse le configurazioni, i modelli dati personalizzati e l'architettura API.

## Indice

- [Panoramica Architettura](#panoramica-architettura)
- [Configurazione Backend](#configurazione-backend)
- [Modelli Dati Personalizzati](#modelli-dati-personalizzati)
- [API Client](#api-client)
- [Autenticazione e Sessioni](#autenticazione-e-sessioni)
- [Strutture Dati](#strutture-dati)
- [Operazioni CRUD](#operazioni-crud)
- [Gestione Errori](#gestione-errori)
- [Rate Limiting](#rate-limiting)
- [Sicurezza](#sicurezza)
- [Configurazione Ambiente](#configurazione-ambiente)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Panoramica Architettura

L'applicazione EcoDev Configurator si integra con Odoo 16+ utilizzando il protocollo JSON-RPC 2.0 per tutte le operazioni di backend.

### Stack Tecnologico

- **Backend**: Odoo 16+ (ERP/CRM)
- **Database**: PostgreSQL (gestito da Odoo)
- **Protocollo**: JSON-RPC 2.0
- **Endpoint**: `/web/dataset/call_kw`
- **Autenticazione**: Session-based con cookie

### Architettura di Comunicazione

```
Vue.js App ←→ Axios Client ←→ Odoo JSON-RPC ←→ PostgreSQL
    ↓              ↓              ↓           ↓
 Frontend      API Layer     Backend     Database
```

## Configurazione Backend

### Requisiti Sistema

- Odoo 16+ installato e configurato
- Database PostgreSQL
- Moduli personalizzati installati
- Permessi utente configurati

### Variabili Ambiente

```bash
# .env
VITE_API_BASE_URL=https://your-odoo-instance.com
VITE_DATABASE=your_database_name
```

### URL Endpoint Principali

```javascript
// Configurazione base
const API_BASE_URL = process.env.VITE_API_BASE_URL;
const DATABASE = process.env.VITE_DATABASE;

// Endpoint utilizzati
POST / web / session / authenticate; // Login
POST / web / session / get_session_info; // Info sessione
POST / web / session / destroy; // Logout
POST / web / dataset / call_kw; // Operazioni CRUD
POST / web / binary / upload_attachment; // Upload file
```

## Modelli Dati Personalizzati

L'applicazione utilizza i seguenti modelli custom in Odoo:

### x_supercategories

Supercategorie per organizzazione gerarchica prodotti.

**Campi principali:**

- `id`: ID univoco
- `x_name`: Nome supercategoria
- `x_description`: Descrizione
- `x_img`: Immagine base64

### x_product_categories

Categorie prodotto con relazione alle supercategorie.

**Campi principali:**

- `id`: ID univoco
- `x_name`: Nome categoria
- `x_description`: Descrizione
- `x_supercategories_id`: Relazione Many2One con supercategorie
- `x_img`: Immagine base64
- `x_battery`: Flag per prodotti con batterie
- `x_software`: Flag per prodotti software
- `x_position`: Posizione ordinamento

### x_steps

Step di configurazione per ogni categoria.

**Campi principali:**

- `id`: ID univoco
- `x_name`: Nome step
- `x_title`: Titolo visualizzato
- `x_position`: Posizione nell'ordine
- `x_choice_type`: Tipo scelta (single_choice, multiple_choice)
- `x_product_category_id`: Relazione Many2One con categoria

### x_options

Opzioni di configurazione per ogni step.

**Campi principali:**

- `id`: ID univoco
- `x_name`: Codice opzione
- `x_name_readable`: Nome leggibile
- `x_description`: Descrizione dettagliata
- `x_price`: Prezzo opzione
- `x_default`: Flag opzione di default
- `x_step_id`: Relazione Many2One con step
- `x_code`: Codice specifico per logiche business

### x_constraints

Vincoli tra opzioni incompatibili.

**Campi principali:**

- `id`: ID univoco
- `x_option_id`: Opzione sorgente
- `x_restricted_option_id`: Opzione target vincolata
- `x_description`: Descrizione vincolo

### x_rules

Regole business per calcoli e validazioni.

**Campi principali:**

- `id`: ID univoco
- `x_name`: Nome regola
- `x_category_id`: Categoria di appartenenza
- `x_step_id`: Step associato
- `x_option_id`: Opzione associata
- `x_section`: Sezione regola
- `x_rule_type`: Tipo regola
- `x_parameter`: Parametro numerico

## API Client

### Helper Principale

```javascript
// src/api/odooApiNext.js
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

  const response = await apiClient.post("/web/dataset/call_kw", payload);
  const { data } = response;

  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result;
}
```

### Configurazione Axios

```javascript
// src/services/axios.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  withCredentials: true, // Per gestione cookie sessione
  headers: {
    "Content-Type": "application/json",
  },
});
```

## Autenticazione e Sessioni

### Login Process

```javascript
// Autenticazione utente
export async function authenticate(username, password) {
  const payload = {
    jsonrpc: "2.0",
    method: "call",
    params: {
      db: DATABASE,
      login: username,
      password: password,
    },
  };

  const response = await apiClient.post("/web/session/authenticate", payload);
  return response.data.result;
}
```

### Gestione Sessione

- **Cookie automatici**: Gestiti da Axios con `withCredentials: true`
- **Timeout sessione**: Gestito automaticamente da Odoo
- **Logout sicuro**: Distruzione sessione lato server

## Strutture Dati

### Formato Richieste JSON-RPC

```javascript
// Struttura standard richiesta
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "model": "x_product_categories",
    "method": "search_read",
    "args": [[]],
    "kwargs": {
      "fields": ["id", "x_name", "x_description"],
      "order": "x_position asc"
    }
  },
  "id": 1234567890
}
```

### Formato Risposte

```javascript
// Risposta successo
{
  "jsonrpc": "2.0",
  "id": 1234567890,
  "result": [
    {
      "id": 1,
      "x_name": "Category Name",
      "x_description": "Description"
    }
  ]
}

// Risposta errore
{
  "jsonrpc": "2.0",
  "id": 1234567890,
  "error": {
    "code": 200,
    "message": "Odoo Server Error",
    "data": {
      "name": "ValidationError",
      "message": "Error details"
    }
  }
}
```

## Operazioni CRUD

### Lettura Dati (search_read)

```javascript
// Recupera tutte le categorie
export async function fetchCategories() {
  return await callOdooModel("x_product_categories", "search_read", [[]]);
}

// Recupera con filtri
export async function fetchSteps(categoryId) {
  return await callOdooModel(
    "x_steps",
    "search_read",
    [[["x_product_category_id.id", "=", categoryId]]],
    { order: "x_position asc" }
  );
}
```

### Creazione Record (create)

```javascript
// Crea nuovo partner
export async function createPartner(partnerData) {
  return await callOdooModel("res.partner", "create", [partnerData]);
}

// Crea preventivo
export async function createQuote(quoteData) {
  const { order_line, ...orderData } = quoteData;

  // Step 1: Crea preventivo
  const orderId = await callOdooModel("sale.order", "create", [orderData]);

  // Step 2: Aggiungi righe
  for (const line of order_line) {
    await callOdooModel("sale.order.line", "create", [
      {
        ...line,
        order_id: orderId,
      },
    ]);
  }

  return orderId;
}
```

### Ricerca Universale

```javascript
// Ricerca attraverso multiple entità
export async function searchAllEntities(keyword) {
  const domainName = [
    "|",
    ["x_name", "ilike", keyword],
    ["x_description", "ilike", keyword],
  ];

  // Cerca in supercategorie
  const superCategories = await callOdooModel(
    "x_supercategories",
    "search_read",
    [domainName]
  );

  // Cerca in categorie
  const categories = await callOdooModel(
    "x_product_categories",
    "search_read",
    [domainName]
  );

  return { superCategories, categories };
}
```

## Gestione Errori

### Tipi di Errore

1. **Errori di Rete**: Connessione, timeout
2. **Errori Autenticazione**: Credenziali invalide, sessione scaduta
3. **Errori Validazione**: Dati non validi, vincoli violati
4. **Errori Server**: Errori interni Odoo

### Gestione Errori nell'API Client

```javascript
export async function callOdooModel(model, method, args = [], kwargs = {}) {
  try {
    const response = await apiClient.post("/web/dataset/call_kw", payload);
    const { data } = response;

    if (data.error) {
      throw new Error(JSON.stringify(data.error));
    }

    return data.result;
  } catch (error) {
    if (error.response?.status === 401) {
      // Gestisci errore autenticazione
      authStore.logout();
      router.push("/login");
    }

    console.error("API Error:", error);
    throw error;
  }
}
```

### Retry Logic

```javascript
// Implementazione retry automatico
async function apiCallWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
}
```

## Rate Limiting

### Configurazione Client-Side

```javascript
// Rate limiting per prevenire sovraccarico server
class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.maxConcurrent = 10;
    this.delayBetweenRequests = 1000;
  }

  async throttle(endpoint) {
    const now = Date.now();
    const lastRequest = this.requests.get(endpoint);

    if (lastRequest && now - lastRequest < this.delayBetweenRequests) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.delayBetweenRequests)
      );
    }

    this.requests.set(endpoint, now);
  }
}
```

## Sicurezza

### Protezioni Implementate

1. **HTTPS obbligatorio** in produzione
2. **Cookie HttpOnly** per sessioni
3. **CSRF Protection** via Odoo
4. **Input Validation** client e server
5. **SQL Injection Protection** via ORM Odoo

### Best Practices

```javascript
// Sanitizzazione input
function sanitizeInput(input) {
  if (typeof input !== "string") return input;
  return input.trim().replace(/[<>]/g, "");
}

// Validazione domini ricerca
function validateSearchDomain(domain) {
  const allowedFields = ["x_name", "x_description", "id"];
  return domain.filter((condition) => {
    if (Array.isArray(condition) && condition.length === 3) {
      return allowedFields.includes(condition[0]);
    }
    return true;
  });
}
```

## Configurazione Ambiente

### Sviluppo

```bash
# .env.development
VITE_API_BASE_URL=https://test.odoo-instance.com
VITE_DATABASE=test_database
```

### Produzione

```bash
# .env.production
VITE_API_BASE_URL=https://production.odoo-instance.com
VITE_DATABASE=production_database
```

### Permessi Utente Odoo

```python
# Permessi minimi richiesti
{
    'read': [
        'x_product_categories',
        'x_supercategories',
        'x_steps',
        'x_options',
        'x_constraints',
        'x_rules',
        'sale.order',
        'res.partner'
    ],
    'write': [
        'sale.order',
        'sale.order.line',
        'res.partner'
    ],
    'create': [
        'sale.order',
        'sale.order.line',
        'res.partner',
        'product.product'
    ]
}
```

## Testing

### Test API Calls

```javascript
// Test helper per chiamate API
export async function testApiConnection() {
  try {
    const result = await callOdooModel("res.users", "search_read", [[]], {
      fields: ["id", "name"],
      limit: 1,
    });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test autenticazione
export async function testAuthentication(username, password) {
  try {
    const sessionInfo = await authenticate(username, password);
    return sessionInfo.uid
      ? { success: true, uid: sessionInfo.uid }
      : { success: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Test Integrazione

```javascript
// Test completo workflow
describe("Odoo Integration", () => {
  test("should fetch categories successfully", async () => {
    const categories = await fetchCategories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  test("should create quote successfully", async () => {
    const quoteData = {
      partner_id: 123,
      order_line: [
        {
          name: "TEST-PRODUCT",
          product_uom_qty: 1,
          price_unit: 100,
        },
      ],
    };

    const orderId = await createQuote(quoteData);
    expect(typeof orderId).toBe("number");
  });
});
```

## Troubleshooting

### Problemi Comuni

#### 1. Errori di Connessione

```javascript
// Verifica connessione
Error: Network Error
Soluzione: Verificare URL API e connessione internet

// CORS Errors
Error: Access to XMLHttpRequest has been blocked by CORS policy
Soluzione: Configurare CORS su server Odoo
```

#### 2. Errori Autenticazione

```javascript
// Credenziali invalide
Error: {"code": 100, "message": "AccessDenied"}
Soluzione: Verificare username/password e permessi utente

// Sessione scaduta
Error: {"code": 200, "message": "SessionExpired"}
Soluzione: Re-autenticazione automatica
```

#### 3. Errori Modelli

```javascript
// Modello non trovato
Error: {"name": "ValueError", "message": "Model 'x_custom_model' does not exist"}
Soluzione: Verificare installazione moduli custom

// Campo non esistente
Error: {"name": "KeyError", "message": "Field 'x_custom_field' does not exist"}
Soluzione: Verificare definizione campi nel modello
```

### Debug Tools

```javascript
// Logger per debugging
const API_DEBUG = process.env.NODE_ENV === "development";

function logApiCall(model, method, args) {
  if (API_DEBUG) {
    console.group(`API Call: ${model}.${method}`);
    console.log("Args:", args);
    console.log("Timestamp:", new Date().toISOString());
    console.groupEnd();
  }
}
```

### Monitoring

```javascript
// Monitoraggio performance
class ApiMonitor {
  constructor() {
    this.stats = {
      totalCalls: 0,
      errors: 0,
      avgResponseTime: 0,
    };
  }

  recordCall(duration, success) {
    this.stats.totalCalls++;
    if (!success) this.stats.errors++;

    this.stats.avgResponseTime = (this.stats.avgResponseTime + duration) / 2;
  }

  getStats() {
    return {
      ...this.stats,
      errorRate: this.stats.errors / this.stats.totalCalls,
    };
  }
}
```

---

## Risorse Aggiuntive

- [Documentazione Odoo JSON-RPC](https://www.odoo.com/documentation/16.0/developer/reference/external_api.html)
- [Configurazione CORS Odoo](https://www.odoo.com/documentation/16.0/administration/install/deploy.html)
- [Gestione Sessioni Odoo](https://www.odoo.com/documentation/16.0/developer/reference/backend/session.html)

_Ultimo aggiornamento: Giugno 2025_
