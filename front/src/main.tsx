
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./styles/index.css";
  import "./styles/theme.css";

  import { AuthProvider } from "./authContext";

  createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
  );
  createRoot(document.getElementById("root")!).render(<App />);
  