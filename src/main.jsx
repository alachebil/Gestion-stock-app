import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import axios from "axios";
import store from "./store/store.js";
import { persistor } from "./store/store.js";
import App from "./App.jsx";

axios.defaults.baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <StrictMode>
        <App />
      </StrictMode>
    </PersistGate>
  </Provider>
);
