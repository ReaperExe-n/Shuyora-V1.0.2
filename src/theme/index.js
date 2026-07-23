// src/theme/index.js
export const lightTheme = {
  colors: {
    background: "#fafafa",
    text: "#212121",
    primary: "#ff6f61",
    secondary: "#ffb300",
    accent: "#3f51b5",
    cardBackground: "#ffffff",
    border: "#e0e0e0",
  },
  spacing: (factor) => `${factor * 8}px`,
  radius: "8px",
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
  },
};

export const darkTheme = {
  colors: {
    background: "#0d0d0d",
    text: "#fafafa",
    primary: "#ff6f61",
    secondary: "#ffb300",
    accent: "#90caf9",
    cardBackground: "#1e1e1e",
    border: "#333333",
  },
  spacing: (factor) => `${factor * 8}px`,
  radius: "8px",
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
  },
};
