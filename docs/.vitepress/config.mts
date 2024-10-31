import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Mithril Shell",
  description: "An opinionated desktop shell for hyprland based on GNOME.",
  markdown: {
    theme: {
      light: "catppuccin-latte",
      dark: "catppuccin-mocha",
    },
  },
  base: "/mithril-shell/",
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    outline: "deep",

    socialLinks: [{ icon: "github", link: "https://github.com/andreashgk/mithril-shell" }],

    editLink: {
      pattern: "https://github.com/andreashgk/mithril-shell/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    nav: [
      {
        text: "Documentation",
        link: "/getting-started/introduction",
        activeMatch: "/getting-started|configuration/",
      },
    ],

    sidebar: [
      {
        text: "Getting Started",
        base: "/getting-started",
        collapsed: false,
        items: [
          { text: "Introduction", link: "/introduction" },
          { text: "Installation", link: "/installation" },
        ],
      },
      {
        text: "Configuration",
        base: "/configuration",
        collapsed: false,
        items: [
          { text: "Theming", link: "/theming" },
          { text: "All Options", link: "/options" },
        ],
      },
    ],

    search: {
      provider: "local",
    },

    lastUpdated: {
      text: "Last updated",
    },
  },
});
