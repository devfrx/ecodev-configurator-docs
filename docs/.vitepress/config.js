export default {
  title: "EcoDev Configurator",
  description: "Documentation for EcoDev Configurator",
  base: "/",
  ignoreDeadLinks: true,

  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Getting Started", link: "/getting-started/" },
      { text: "Components", link: "/components/" },
      { text: "API", link: "/api/" },
    ],

    sidebar: {
      "/getting-started/": [
        {
          text: "Getting Started",
          items: [
            { text: "Overview", link: "/getting-started/" },
            { text: "Installation", link: "/getting-started/installation" },
            { text: "Quick Start", link: "/getting-started/quick-start" },
          ],
        },
      ],
      "/components/": [
        {
          text: "Components",
          items: [
            { text: "Overview", link: "/components/" },
            { text: "Forms", link: "/components/forms" },
            { text: "Navigation", link: "/components/navigation" },
            { text: "UI Elements", link: "/components/ui-elements" },
          ],
        },
      ],
      "/features/": [
        {
          text: "Features",
          items: [
            { text: "Overview", link: "/features/" },
            {
              text: "Battery Management",
              link: "/features/battery-management",
            },
            { text: "PDF Export", link: "/features/pdf-export" },
            {
              text: "Product Configuration",
              link: "/features/product-configuration",
            },
            { text: "Quote Generation", link: "/features/quote-generation" },
          ],
        },
      ],
      "/architecture/": [
        {
          text: "Architecture",
          items: [
            { text: "Overview", link: "/architecture/" },
            { text: "API Integration", link: "/architecture/api-integration" },
            {
              text: "Project Structure",
              link: "/architecture/project-structure",
            },
            { text: "Stores", link: "/architecture/stores" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API",
          items: [
            { text: "Overview", link: "/api/" },
            { text: "Endpoints", link: "/api/endpoints" },
            { text: "Odoo Integration", link: "/api/odoo-integration" },
          ],
        },
      ],
      "/deployment/": [
        {
          text: "Deployment",
          items: [
            { text: "Overview", link: "/deployment/" },
            { text: "Build", link: "/deployment/build" },
            { text: "Capacitor", link: "/deployment/capacitor" },
          ],
        },
      ],
    },

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/yourusername/ecodev-configurator",
      },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2025 EcoDev Team",
    },
  },
};
