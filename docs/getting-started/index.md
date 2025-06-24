# EcoDev Configurator - Documentazione del Progetto

Benvenuto nella documentazione del **Configuratore EcoCtrl**, un'applicazione web per la configurazione di preventivi personalizzati per prodotti eco-sostenibili.

## Indice

- [Introduzione](#introduzione)
- [Panoramica del Progetto](#panoramica-del-progetto)
- [Architettura](#architettura)
- [Struttura del Progetto](#struttura-del-progetto)
- [Funzionalità Principali](#funzionalità-principali)
- [Tecnologie Utilizzate](#tecnologie-utilizzate)
- [Setup e Installazione](#setup-e-installazione)
- [Configurazione](#configurazione)
- [API e Backend](#api-e-backend)
- [Sicurezza](#sicurezza)
- [Testing](#testing)
- [Deployment](#deployment)
- [Sviluppo](#sviluppo)
- [Roadmap](#roadmap)

## Introduzione

Il **Configuratore EcoCtrl** è un'applicazione web sviluppata con Vue.js 3 e Ionic Framework che permette ai venditori di creare preventivi personalizzati per prodotti eco-sostenibili. L'applicazione si integra con un backend Odoo tramite API JSON-RPC e gestisce configurazioni complesse con vincoli dinamici tra le opzioni.

### Obiettivi del Progetto

- Semplificare il processo di configurazione prodotti
- Automatizzare il calcolo di prezzi e vincoli
- Gestire configurazioni complesse (batterie master/slave)
- Integrare direttamente con il sistema Odoo esistente
- Fornire un'interfaccia mobile-first responsive

## Panoramica del Progetto

### Caratteristiche Principali

- **Configurazione Guidata**: Processo step-by-step per la configurazione prodotti
- **Gestione Vincoli**: Sistema automatico di vincoli tra opzioni incompatibili
- **Batterie Complesse**: Supporto per configurazioni master-slave con validazione
- **Software Licensing**: Gestione automatica di licenze software basate sul numero di dispositivi
- **Preventivi PDF**: Generazione automatica di preventivi professionali
- **Gestione Clienti**: Creazione e gestione anagrafica clienti
- **Ricerca Universale**: Sistema di ricerca avanzato tra categorie e prodotti

### Flusso Applicativo

```
Login → Home → Supercategorie → Categorie → Configurazione → Riepilogo → Conferma
                                      ↓
                              [Configurazione Batterie]
                                      ↓
                              [Master → Slave 1-N]
```

## Architettura

### Frontend Architecture

- **Framework**: Vue.js 3 con Composition API
- **UI Framework**: Ionic Vue 7
- **State Management**: Pinia con persistenza
- **Routing**: Vue Router 4
- **PDF Generation**: pdfMake

### Backend Integration

- **Sistema Backend**: Odoo 16+
- **Protocollo**: JSON-RPC 2.0
- **Autenticazione**: Session-based con cookie
- **Rate Limiting**: Client-side con gestione concorrenza

### Data Models

```
x_product_categories ← x_steps ← x_options
        ↓                         ↓
x_supercategories           x_constraints
        ↓                         ↓
  sale.order ← sale.order.line ← x_rules
```

## Struttura del Progetto

```
src/
├── api/                    # Integrazione API Odoo
│   ├── odooApi.js         # API client principale
│   └── odooApiNext.js     # API client aggiornato
├── components/            # Componenti Vue riutilizzabili
│   ├── CategoryCard.vue   # Card per visualizzazione categorie
│   ├── ConfiguratorProgress.vue # Barra progresso configurazione
│   ├── LoadingOverlay.vue # Overlay di caricamento
│   ├── ModalOptionDetail.vue # Modal dettagli opzione
│   ├── NavBar.vue         # Barra di navigazione
│   ├── QuoteTable.vue     # Tabella preventivi
│   └── SearchBar.vue      # Barra di ricerca
├── composables/           # Logica business riutilizzabile
│   ├── configuratorsPageComps/ # Composables per configurazione
│   ├── summaryPageComps/  # Composables per riepilogo
│   ├── useAuthState.js    # Gestione stato autenticazione
│   ├── useCurrencyFormatter.js # Formattazione valute
│   ├── useDocDefinition.js # Definizione documenti PDF
│   └── usePdfMaker.js     # Generazione PDF
├── stores/                # Store Pinia
│   ├── auth.js           # Store autenticazione
│   ├── categoryStore.js  # Store categorie
│   ├── configuratorStore.js # Store configurazione
│   ├── partnerStore.js   # Store clienti
│   ├── ruleStore.js      # Store regole business
│   ├── softwareStore.js  # Store licenze software
│   └── summaryStore.js   # Store riepilogo/carrello
├── views/                # Pagine principali
│   ├── HomePage.vue      # Homepage con guida
│   ├── LoginPage.vue     # Pagina login
│   ├── SuperCategoriesPage.vue # Selezione supercategorie
│   ├── CategoriesPage.vue # Selezione categorie
│   ├── ConfiguratorPage2.vue # Configurazione prodotto
│   ├── BatteryConfigPage.vue # Configurazione batterie
│   ├── BatteryUnitConfigPage.vue # Config unità batteria
│   ├── SummaryPage.vue   # Riepilogo carrello
│   ├── ConfirmationPage.vue # Conferma preventivo
│   ├── SearchPage.vue    # Ricerca prodotti
│   └── DocumentationPage.vue # Documentazione prodotti
├── router/               # Configurazione routing
├── theme/                # Stili e temi
└── utils/                # Utility functions
```

## Funzionalità Principali

### 1. Autenticazione e Autorizzazione

- Login con credenziali Odoo
- Gestione sessioni automatica
- Protezione route con guard
- Logout sicuro

### 2. Configurazione Prodotti

- **Step Guidati**: Processo di configurazione diviso in step logici
- **Scelte Multiple/Singole**: Supporto per diversi tipi di selezione
- **Quantità Dinamiche**: Gestione quantità per opzioni multiple
- **Vincoli Automatici**: Disabilitazione automatica opzioni incompatibili
- **Reset Intelligente**: Reset selettivo delle scelte vincolate

### 3. Gestione Batterie

- **Configurazione Master**: Configurazione unità principale
- **Configurazione Slave**: Configurazione unità secondarie (1-8)
- **Validazione Potenza**: Controllo compatibilità alimentazione
- **Sequenza Guidata**: Processo step-by-step master → slave[1-N]

### 4. Software e Licenze

- **Calcolo Automatico**: Selezione tier software basato su numero dispositivi
  - SOFT1: 1-3 dispositivi
  - SOFT2: 4-10 dispositivi
  - SOFT3: 11-30 dispositivi
- **Clausole Opzionali**: SOFTFR (clausola francese), SOFT4 (clausola avanzata)
- **GSM Connectivity**: Opzione GSM con quantità dinamica

### 5. Gestione Preventivi

- **Riepilogo Dinamico**: Visualizzazione real-time configurazioni
- **Calcoli Automatici**: Prezzi, sconti, totali
- **Separatori**: Organizzazione logica del preventivo
- **Modifica/Duplicazione**: Gestione flessibile prodotti
- **PDF Generation**: Creazione preventivi professionali

### 6. Ricerca e Navigazione

- **Ricerca Universale**: Ricerca in categorie, supercategorie, step, opzioni
- **Filtri Dinamici**: Filtraggio risultati per tipo
- **Navigazione Breadcrumb**: Tracciamento percorso utente

### 7. Gestione Clienti

- **Anagrafica Completa**: Nome, email, telefono, indirizzo
- **Integrazione Odoo**: Sincronizzazione automatica con res.partner
- **Validazione Form**: Controlli real-time sui campi

## Tecnologie Utilizzate

### Frontend Stack

- **Vue.js 3**: Framework JavaScript reattivo
- **Ionic Framework 7**: UI components mobile-first
- **Pinia**: State management con persistenza
- **Vue Router 4**: Routing SPA
- **Composition API**: Pattern di sviluppo Vue 3
- **TypeScript**: Type safety (parziale)

### Build Tools & Development

- **Vite**: Build tool e dev server
- **ESLint**: Linting JavaScript/Vue
- **Prettier**: Code formatting
- **Git**: Version control

### Libraries & Utilities

- **pdfMake**: Generazione PDF client-side
- **Lodash**: Utility functions
- **ionicons**: Icon library
- **pinia-plugin-persistedstate**: Persistenza store

### Backend Integration

- **Odoo 16+**: ERP backend system
- **JSON-RPC 2.0**: API protocol
- **PostgreSQL**: Database (tramite Odoo)

## Setup e Installazione

### Prerequisiti

- Node.js 18+
- npm o yarn
- Accesso a istanza Odoo configurata

### Installazione Locale

```bash
# Clona repository
git clone <repository-url>
cd configurator-ecoctrl

# Installa dipendenze
npm install

# Copia file di configurazione
cp .env.example .env

# Configura variabili ambiente
# VITE_API_BASE_URL=https://your-odoo-instance.com
# VITE_DATABASE=your_database_name

# Avvia development server
npm run dev
```

### Build per Produzione

```bash
# Build ottimizzato
npm run build

# Preview build locale
npm run preview
```

## Configurazione

### Variabili d'Ambiente

```bash
# .env
VITE_API_BASE_URL=https://your-odoo-instance.com
VITE_DATABASE=your_database_name
VITE_APP_TITLE=EcoCtrl Configurator
```

### Configurazione Odoo

#### Modelli Custom Richiesti

- `x_product_categories`: Categorie prodotto
- `x_supercategories`: Supercategorie
- `x_steps`: Step di configurazione
- `x_options`: Opzioni di configurazione
- `x_constraints`: Vincoli tra opzioni
- `x_rules`: Regole business

#### Permessi Utente

- Lettura: tutti i modelli custom + sale.order + res.partner
- Scrittura: sale.order + sale.order.line + res.partner
- Accesso: /web/session/\* endpoints

### Configurazione Categorie Speciali

```javascript
// ID categoria software (configurabile)
const SOFTWARE_CATEGORY_ID = 31;

// Codici opzioni speciali
const SPECIAL_CODES = {
  GSM: "GSM01",
  SOFT_FR: "SOFTFR",
  SOFT_4: "SOFT4",
  SOFT_1: "SOFT1",
  SOFT_2: "SOFT2",
  SOFT_3: "SOFT3",
};
```

## API e Backend

### Endpoint Principali

```javascript
// Autenticazione
POST / web / session / authenticate;
POST / web / session / get_session_info;
POST / web / session / destroy;

// Operazioni CRUD
POST / web / dataset / call_kw / { model } / { method };

// Upload file
POST / web / binary / upload_attachment;
```

### Rate Limiting

- Max 10 richieste concorrenti
- Delay 1s tra richieste allo stesso endpoint
- Retry automatico con backoff esponenziale

### Error Handling

- Gestione errori JSON-RPC standard
- Retry automatico su errori temporanei
- Fallback graceful su errori API

## Sicurezza

### Autenticazione

- Session-based authentication via Odoo
- Cookie HttpOnly e Secure in produzione
- Protezione CSRF tramite Odoo
- Timeout sessione automatico

### Autorizzazione

- Route guards per pagine protette
- Controllo permessi lato server
- Validazione input client/server

### Data Protection

- Nessun dato sensibile in localStorage
- Comunicazione HTTPS obbligatoria
- Sanitizzazione input utente

## Testing

### Struttura Test

```bash
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

### Comandi Test

```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## Deployment

### Ambienti

#### Development

- Hot reload attivo
- Source maps abilitate
- Debug mode on

#### Staging

- Build ottimizzato
- Source maps abilitate
- Logging esteso

#### Production

- Build ottimizzato e minificato
- Source maps disabilitate
- Error reporting
- Performance monitoring

### Build Process

```bash
# Build produzione
npm run build

# Verifica bundle
npm run analyze

# Deploy
npm run deploy
```

### Environment Variables per Deploy

```bash
# Production
VITE_API_BASE_URL=https://odoo.production.com
VITE_DATABASE=production_db
NODE_ENV=production

# Staging
VITE_API_BASE_URL=https://odoo.staging.com
VITE_DATABASE=staging_db
NODE_ENV=staging
```

## Sviluppo

### Coding Standards

- ESLint + Prettier per formatting
- Composition API preferita
- TypeScript per tipizzazione (incrementale)
- Naming convention: camelCase JS, kebab-case Vue

### Git Workflow

```bash
main (produzione)
├── develop (sviluppo)
├── feature/nome-feature
├── hotfix/nome-fix
└── release/versione
```

### Componenti Naming

- PascalCase per componenti Vue
- camelCase per funzioni/metodi
- UPPER_CASE per costanti
- kebab-case per file CSS/HTML

### Store Management

- Un store per dominio business
- Persistenza solo dove necessario
- Actions per logica asincrona
- Getters per computed state

## Roadmap

### Versione Attuale (v1.0)

- ✅ Configurazione base prodotti
- ✅ Gestione batterie master/slave
- ✅ Preventivi PDF
- ✅ Integrazione Odoo completa
- ✅ Ricerca universale

### Prossime Release

#### v1.1 (Q2 2025)

- [ ] Modalità offline
- [ ] Cache intelligente
- [ ] Notifiche push
- [ ] Export Excel preventivi

#### v1.2 (Q3 2025)

- [ ] Configurazioni salvate
- [ ] Template preventivi
- [ ] Dashboard analytics
- [ ] API REST native

#### v2.0 (Q4 2025)

- [ ] Refactor completo TypeScript
- [ ] Architecture micro-frontend
- [ ] PWA capabilities
- [ ] Real-time collaboration

### Backlog

- Integrazione CRM avanzata
- Workflow approvazione preventivi
- Sistema commissioni venditori
- Mobile app nativa
- AI-powered recommendations

---

## Supporto e Contributi

### Documentazione

- [API Reference](./endpoints.md)
- [Component Library](./components/)
- [Development Guide](./guides/)

### Team di Sviluppo

- **Tech Lead**: [Nome]
- **Frontend**: [Nome]
- **Backend**: [Nome]
- **QA**: [Nome]

### Contatti

- **Email**: dev@ecodev.com
- **Slack**: #configurator-dev
- **Issues**: GitHub Issues

---

_Ultimo aggiornamento: Giugno 2025_
