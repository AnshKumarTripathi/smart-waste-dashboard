// theme.js
document.addEventListener("DOMContentLoaded", () => {
  const themeSelect = document.getElementById("theme-select");

  themeSelect.addEventListener("change", () => {
    const selectedTheme = themeSelect.value;
    document.documentElement.setAttribute("data-theme", selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  });

  // Set initial theme from local storage or default to light
  const storedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", storedTheme);
  themeSelect.value = storedTheme;
});
