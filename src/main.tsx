import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import "./index.css";
import { PasswordRecovery } from "./hooks/useAuth";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* 🔐 Pantalla de recuperación de contraseña */}
        <Route path="/recover" element={<PasswordRecovery />} />

        {/* 🌟 Todo lo demás lo maneja tu App (dashboards, login, etc.) */}
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);


// import React from "react";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import App from "./App";
// import "./index.css";

// ReactDOM.createRoot(document.getElementById("root")!).render(
//  <React.StrictMode>
//    <BrowserRouter>
//      <App />
//    </BrowserRouter>
//  </React.StrictMode>
// );