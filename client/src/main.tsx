import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/dark-input-fields.css"; // Dark mode input field styling
import "./styles/dark-mode-gradients.css"; // Dark mode gradient backgrounds
import "./styles/cluster-badges.css"; // DECA cluster badges for dark mode

// Set the theme.json colors in CSS
document.documentElement.style.setProperty("--background", "248 100% 96%");
document.documentElement.style.setProperty("--foreground", "222.2 84% 4.9%");

document.documentElement.style.setProperty("--card", "0 0% 100%");
document.documentElement.style.setProperty("--card-foreground", "222.2 84% 4.9%");

document.documentElement.style.setProperty("--popover", "0 0% 100%");
document.documentElement.style.setProperty("--popover-foreground", "222.2 84% 4.9%");

document.documentElement.style.setProperty("--primary", "221.2 83.2% 53.3%");
document.documentElement.style.setProperty("--primary-foreground", "210 40% 98%");

document.documentElement.style.setProperty("--secondary", "142.1 76.2% 36.3%");
document.documentElement.style.setProperty("--secondary-foreground", "144.9 80.4% 10%");

document.documentElement.style.setProperty("--accent", "47.9 95.8% 53.1%");
document.documentElement.style.setProperty("--accent-foreground", "26 83.3% 14.1%");

document.documentElement.style.setProperty("--muted", "210 40% 96.1%");
document.documentElement.style.setProperty("--muted-foreground", "215.4 16.3% 46.9%");

document.documentElement.style.setProperty("--destructive", "0 84.2% 60.2%");
document.documentElement.style.setProperty("--destructive-foreground", "210 40% 98%");

document.documentElement.style.setProperty("--border", "214.3 31.8% 91.4%");
document.documentElement.style.setProperty("--input", "214.3 31.8% 91.4%");
document.documentElement.style.setProperty("--ring", "221.2 83.2% 53.3%");

// Load fonts
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700&display=swap";
document.head.appendChild(fontLink);

// Add Font Awesome
const fontAwesome = document.createElement("link");
fontAwesome.rel = "stylesheet";
fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css";
document.head.appendChild(fontAwesome);

createRoot(document.getElementById("root")!).render(<App />);
