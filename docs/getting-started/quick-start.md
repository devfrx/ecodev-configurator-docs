# Quick Start Guide

Get up and running with the EcoDev Configurator in minutes. This guide walks you through your first product configuration and quote creation.

## Table of Contents

- [First Steps](#first-steps)
- [Login and Authentication](#login-and-authentication)
- [Creating Your First Quote](#creating-your-first-quote)
- [Product Configuration](#product-configuration)
- [Quote Management](#quote-management)
- [Next Steps](#next-steps)

## First Steps

### 1. Access the Application

Open your browser and navigate to the application URL:

```
Development: http://localhost:5173
Production:  https://your-domain.com
```

You should see the EcoDev Configurator login page.

### 2. Verify System Status

Before logging in, ensure:

- ✅ Application loads without errors
- ✅ No console errors in browser developer tools
- ✅ Odoo backend is accessible (check network tab)

## Login and Authentication

### 1. Login Process

1. Enter your Odoo credentials:

   - **Username**: Your Odoo login email
   - **Password**: Your Odoo password

2. Click **"Accedi"** (Login)

3. Upon successful login, you'll be redirected to the Home page

### 2. Home Page Overview

The Home page provides:

- **"Crea Nuovo Preventivo"** - Start new quote
- **"Nuovo Prodotto"** - Add product to existing quote
- **User information** - Your profile details
- **Quick navigation** - Access to search and documentation

## Creating Your First Quote

### 1. Start New Quote

Click **"Crea Nuovo Preventivo"** from the Home page.

### 2. Choose Supercategory

Select a product supercategory:

- Browse available supercategories
- Click on your desired category card
- Each supercategory contains related product categories

### 3. Select Product Category

Choose a specific product category:

- Review category descriptions
- Note special indicators (e.g., battery symbol for battery products)
- Click **"Seleziona"** to proceed

## Product Configuration

### 1. Configuration Steps

The configurator guides you through sequential steps:

```
Step 1: Structure Selection
↓
Step 2: Component Selection
↓
Step 3: Optional Features
↓
Step 4: Final Configuration
```

### 2. Making Selections

#### Single Choice Steps

- Select one option from available choices
- Required selections are marked clearly
- Previous selections may affect available options

#### Multiple Choice Steps

- Select multiple compatible options
- Set quantities for quantifiable options
- Review totals in real-time

#### Battery Configuration

For battery products, follow the special workflow:

1. **Configure Master Unit**:
   - Set number of slave units (1-8)
   - Configure master battery settings
2. **Configure Slave Units**:
   - Configure each slave unit individually
   - Option to copy settings between slaves
   - Automatic validation between units

### 3. Constraint Handling

The system automatically:

- **Disables incompatible options** based on previous selections
- **Resets conflicting choices** when constraints are violated
- **Shows warning messages** for important constraints
- **Provides explanations** for why options are unavailable

### 4. Navigation Controls

Use the configuration controls:

- **"Indietro"** - Go to previous step
- **"Reset"** - Clear current step selections
- **"Avanti"** - Proceed to next step
- **"Conferma"** - Finalize configuration

## Quote Management

### 1. Summary Page

After configuration, review your quote:

- **Product details** with configuration summary
- **Pricing breakdown** with line items
- **Software licensing** (automatically calculated)
- **Total calculations** including discounts

### 2. Quote Actions

Available actions:

- **"Modifica"** - Edit product configuration
- **"Duplica"** - Copy product with same settings
- **"Elimina"** - Remove product from quote
- **"Nuovo Prodotto"** - Add another product

### 3. Software Management

For software-enabled products:

- **Automatic tier selection** based on device count:
  - 1-3 devices → SOFT1
  - 4-10 devices → SOFT2
  - 11-30 devices → SOFT3
- **Optional clauses**:
  - French clause (SOFTFR)
  - Advanced clause (SOFT4)
- **GSM connectivity** with quantity control

### 4. Customer Management

Before finalizing:

1. Select existing customer or create new one
2. Fill customer details:
   - Name and contact information
   - Address details
   - Language preference
3. Save customer to Odoo database

### 5. Quote Finalization

Complete your quote:

1. **Review** all products and totals
2. **Generate PDF** for professional presentation
3. **Send via email** (mobile platforms)
4. **Save to Odoo** as sales order

## Example Workflow

Here's a complete example workflow:

### Scenario: Configure EcoBox with Battery

1. **Login** with your credentials
2. **Start new quote** from Home
3. **Select "Contenitori"** supercategory
4. **Choose "EcoBox"** category
5. **Configure structure** (Step 1):
   - Select "Struttura 4 moduli"
6. **Select containers** (Step 2):
   - Choose container types and quantities
7. **Add optionals** (Step 3):
   - Select additional features
8. **Review configuration** and confirm
9. **Add battery** (if EcoBox supports it):
   - Configure master battery
   - Set 2 slave units
   - Configure each slave
10. **Review summary**:
    - Check products and pricing
    - Software automatically added
11. **Create customer** or select existing
12. **Generate PDF** and finalize

## Tips for Success

### Configuration Best Practices

- **Read step descriptions** carefully before selecting
- **Pay attention to constraint warnings** - they prevent incompatible configurations
- **Use the reset button** if you need to reconsider choices
- **Save frequently** by progressing through steps

### Navigation Tips

- **Use breadcrumb navigation** to understand your current location
- **Home button** always returns to the main menu
- **Back buttons** preserve your current progress
- **Search function** helps find specific products quickly

### Troubleshooting Common Issues

#### Configuration Not Saving

- Ensure all required fields are completed
- Check for validation errors in red
- Try refreshing if the interface becomes unresponsive

#### Options Disabled/Grayed Out

- This is normal - options are disabled due to constraints
- Change previous selections to unlock different options
- Hover over disabled options for explanation (if available)

#### Battery Configuration Errors

- Ensure master is configured before slaves
- Check power compatibility between units
- Verify slave count matches your initial selection

#### PDF Generation Issues

- Ensure customer information is complete
- Check browser popup settings
- Try a different browser if problems persist

## Next Steps

Now that you've completed your first configuration:

1. **Explore other product categories** to understand different workflows
2. **Practice battery configurations** to master the master-slave workflow
3. **Experiment with software options** to understand automatic tier selection
4. **Review the API documentation** if you need technical integration details
5. **Check the user interface** documentation for advanced features

### Additional Resources

- **[Installation Guide](./installation.md)** - For technical setup
- **[API Documentation](../api/endpoints.md)** - For developers
- **Search function** - Find products quickly
- **Documentation page** - Product-specific guides

Welcome to efficient quote creation with EcoDev Configurator! 🌱
