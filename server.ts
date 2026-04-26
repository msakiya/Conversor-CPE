import express from "express";
import path from "path";
import axios from "axios";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Cache simple para tipos de cambio automáticos
  let cachedRates: Record<string, number> = {};
  let lastCacheUpdate = 0;

  // Mock de base de datos para tipos de cambio manuales
  let manualRates: Record<string, number> = {
    // "ARS": 1200
  };

  const COUNTRY_CURRENCY_MAP: Record<string, { currency: string; symbol: string }> = {
    AR: { currency: "ARS", symbol: "$" },
    MX: { currency: "MXN", symbol: "$" },
    ES: { currency: "EUR", symbol: "€" },
    CO: { currency: "COP", symbol: "$" },
    CL: { currency: "CLP", symbol: "$" },
    PE: { currency: "PEN", symbol: "S/" },
    US: { currency: "USD", symbol: "$" },
    BR: { currency: "BRL", symbol: "R$" },
  };

  const fetchAutoRates = async () => {
    const now = Date.now();
    // Cache por 1 hora
    if (now - lastCacheUpdate < 3600000 && Object.keys(cachedRates).length > 0) {
      return cachedRates;
    }
    try {
      const response = await axios.get("https://open.er-api.com/v6/latest/USD");
      cachedRates = response.data.rates;
      lastCacheUpdate = now;
      return cachedRates;
    } catch (error) {
      console.error("Error fetching rates:", error);
      return cachedRates;
    }
  };

  // API para obtener la configuración completa del cliente (Geolocalización + Tasa aplicada)
  app.get("/api/currency-config", async (req, res) => {
    try {
      // 1. Detectar país (usamos ipapi.co desde el servidor)
      // Nota: En desarrollo local la IP puede ser local, forzamos un fallback o detectamos la IP real
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      const geoResponse = await axios.get(`https://ipapi.co/${ip}/json/`).catch(() => ({ data: { country_code: "US" } }));
      const countryCode = geoResponse.data.country_code || "US";

      // 2. Obtener tasas automáticas
      const autoRates = await fetchAutoRates();

      // 3. Determinar moneda y tasa
      const mapping = COUNTRY_CURRENCY_MAP[countryCode] || { currency: "USD", symbol: "$" };
      const currencyCode = mapping.currency;
      
      const isManual = !!manualRates[currencyCode];
      const rate = manualRates[currencyCode] || autoRates[currencyCode] || 1;

      res.json({
        countryCode,
        currencyCode,
        symbol: mapping.symbol,
        rate,
        isManual,
        allAutoRates: autoRates,
        allManualRates: manualRates
      });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/manual-rates", (req, res) => {
    res.json(manualRates);
  });

  app.post("/api/manual-rates", (req, res) => {
    const { currency, rate } = req.body;
    if (!currency) return res.status(400).json({ error: "Currency required" });
    if (rate === null || rate === undefined || rate === 0) {
      delete manualRates[currency];
    } else {
      manualRates[currency] = parseFloat(rate);
    }
    res.json({ success: true, manualRates });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
