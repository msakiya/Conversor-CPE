import React, { useState, useEffect } from "react";
import { 
  getCurrencyConfig, 
  getManualRates, 
  saveManualRate 
} from "./services/currencyService";
import { PRODUCTS, COUNTRY_CURRENCY_MAP, CurrencyData } from "./constants";
import { 
  ShoppingBag, 
  Settings, 
  Globe, 
  ArrowRight, 
  RefreshCcw, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";

export default function App() {
  const [activeTab, setActiveTab] = useState<"store" | "admin">("store");
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState("US");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [manualRates, setManualRates] = useState<Record<string, number>>({});
  const [currencyData, setCurrencyData] = useState<CurrencyData | null>(null);

  // Inicialización
  useEffect(() => {
    async function init() {
      const config = await getCurrencyConfig();
      if (config) {
        setCountry(config.countryCode);
        setRates(config.allAutoRates);
        setManualRates(config.allManualRates);
        setCurrencyData({
          code: config.currencyCode,
          symbol: config.symbol,
          rate: config.rate,
          isManual: config.isManual,
          country: config.countryCode
        });
      }
      setLoading(false);
    }
    init();
  }, []);

  // Actualizar datos de moneda si cambia el país manualmente (simulación) o se guardan tasas
  useEffect(() => {
    if (loading) return;
    
    const mapping = COUNTRY_CURRENCY_MAP[country] || COUNTRY_CURRENCY_MAP["DEFAULT"];
    const currencyCode = mapping.currency;
    const isManual = !!manualRates[currencyCode];
    const rate = manualRates[currencyCode] || rates[currencyCode] || 1;

    setCurrencyData({
      code: currencyCode,
      symbol: mapping.symbol,
      rate: rate,
      isManual: isManual,
      country: country
    });
  }, [country, manualRates, rates, loading]);

  const formatPrice = (usdPrice: number) => {
    if (!currencyData) return `$${usdPrice}`;
    const converted = usdPrice * currencyData.rate;
    return `${currencyData.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleSaveRate = async (code: string, val: string) => {
    const numVal = val === "" ? null : parseFloat(val);
    await saveManualRate(code, numVal);
    const updated = await getManualRates();
    setManualRates(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Detectando ubicación y moneda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar: Sidebar for WooCommerce Plugin */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen hidden md:flex">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-xl">C</div>
          <h1 className="text-lg font-bold tracking-tight">Conversor CPE</h1>
        </div>
        <nav className="flex-1 py-4">
          <div className="px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Principal</div>
          <button
            onClick={() => setActiveTab("store")}
            className={cn(
              "w-full flex items-center px-6 py-3 transition-colors text-left",
              activeTab === "store" 
                ? "bg-purple-50 text-purple-700 border-r-4 border-purple-600 font-medium" 
                : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <Globe className="w-5 h-5 mr-3" />
            Tienda Pública
          </button>
          
          <div className="mt-6 px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Configuración</div>
          <button
            onClick={() => setActiveTab("admin")}
            className={cn(
              "w-full flex items-center px-6 py-3 transition-colors text-left",
              activeTab === "admin" 
                ? "bg-purple-50 text-purple-700 border-r-4 border-purple-600 font-medium" 
                : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <Settings className="w-5 h-5 mr-3" />
            Tipos de Cambio
          </button>
        </nav>
        
        <div className="p-6 border-t border-slate-100">
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-xs flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
            Finanzas API Conectada
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-10">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">
              {activeTab === "store" ? "Catálogo de Productos" : "Reglas de Conversión"}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5">
               <Globe className="w-3 h-3" />
               Ubicación Detectada: <span className="text-slate-600 uppercase font-bold">{country}</span>
               <span className="mx-1">•</span>
               Moneda: <span className="text-purple-600 font-bold">{currencyData?.code} ({currencyData?.symbol})</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 hidden sm:block">
              Exportar
            </button>
            <button className="px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-bold shadow-sm shadow-purple-200 hover:bg-purple-700">
              Guardar Cambios
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-6 lg:p-10">
          <AnimatePresence mode="wait">
            {activeTab === "store" ? (
              <motion.div
                key="store"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Stats Header for Store */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-purple-900 rounded-xl p-6 text-white shadow-lg shadow-purple-100">
                    <h4 className="font-bold text-sm uppercase tracking-wider opacity-60 mb-2">Simulación de Región</h4>
                    <div className="text-3xl font-bold mb-1 uppercase">{country}</div>
                    <p className="text-xs opacity-80 leading-relaxed mb-4">
                      Viendo precios como un visitante de {country}.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(COUNTRY_CURRENCY_MAP).filter(k => k !== "DEFAULT").map(c => (
                        <button
                          key={c}
                          onClick={() => setCountry(c)}
                          className={cn(
                            "px-2 py-1 rounded text-[10px] font-bold transition-all",
                            country === c 
                              ? "bg-white text-purple-900" 
                              : "bg-white/10 text-white hover:bg-white/20"
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Motor de Cambio</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-xl">
                        {currencyData?.isManual ? "🎯" : "🔄"}
                      </div>
                      <div>
                        <div className="text-sm font-bold">
                          {currencyData?.isManual ? "Tasa Manual" : "Tasa Automática"}
                        </div>
                        <div className="text-xs text-slate-500">
                          1 USD = {currencyData?.rate.toFixed(2)} {currencyData?.code}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Segmentación Geográfica</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Auto-deteccion IP</span>
                      <div className="w-10 h-5 bg-purple-600 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-medium">Buscador Multi-moneda</span>
                      <div className="w-10 h-5 bg-slate-200 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Grid */}
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-purple-600" />
                    Productos de Muestra
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {PRODUCTS.map((product) => (
                      <div
                        key={product.id}
                        className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="aspect-[4/5] relative overflow-hidden bg-slate-100 rounded-t-xl">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm border border-slate-100">
                              {product.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors mb-2">
                            {product.name}
                          </h3>
                          <div className="flex flex-col gap-1 mb-4">
                            <span className="text-2xl font-black text-slate-900">{formatPrice(product.price)}</span>
                            <span className="text-xs text-slate-400 font-medium">Precio base: ${product.price} USD</span>
                          </div>
                          <button className="w-full bg-white border border-slate-200 text-slate-800 py-2.5 rounded-lg text-sm font-bold hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all active:scale-95 flex items-center justify-center gap-2">
                            Comprar Ahora
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="col-span-12 space-y-8"
              >
                {/* Main Settings Card */}
                <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg">Currencies Activas & Tasas Manuales</h3>
                      <p className="text-xs text-slate-500 italic mt-1">
                        Si dejas la tasa en 0.00 o vacía, se activará la consulta automática a Google Finance.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-xs font-bold border border-amber-100">
                      <AlertCircle className="w-4 h-4" />
                      USD es la moneda base del sistema
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4">País / Región</th>
                          <th className="px-6 py-4">Moneda Local</th>
                          <th className="px-6 py-4">Origen del Dato</th>
                          <th className="px-6 py-4 text-right">Tasa (vs USD)</th>
                          <th className="px-6 py-4 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(COUNTRY_CURRENCY_MAP).filter(([k]) => k !== "DEFAULT").map(([code, data]) => {
                          const isManual = !!manualRates[data.currency];
                          return (
                            <tr key={code} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 flex items-center gap-3">
                                <span className={cn("fi fi-" + code.toLowerCase(), "text-xl shadow-sm")}></span>
                                <span className="font-bold text-slate-700">{code === 'AR' ? 'Argentina' : code === 'MX' ? 'Mexico' : code === 'ES' ? 'España' : code === 'CO' ? 'Colombia' : code === 'CL' ? 'Chile' : code === 'PE' ? 'Perú' : code === 'BR' ? 'Brasil' : code === 'US' ? 'Estados Unidos' : code}</span>
                              </td>
                              <td className="px-6 py-4 font-mono text-sm tracking-tighter text-slate-500">
                                {data.currency}
                              </td>
                              <td className="px-6 py-4">
                                {isManual ? (
                                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">MANUAL</span>
                                ) : (
                                   <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded text-[10px] font-bold">AUTO (API)</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="text-[10px] text-slate-400 font-bold">{data.symbol}</span>
                                  <input 
                                    type="text" 
                                    placeholder={rates[data.currency]?.toFixed(2) || "0.00"}
                                    defaultValue={manualRates[data.currency] || ""}
                                    onBlur={(e) => handleSaveRate(data.currency, e.target.value)}
                                    className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-right text-sm font-bold focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all shadow-inner"
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {isManual ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                                ) : (
                                  <RefreshCcw className="w-4 h-4 text-slate-300 mx-auto" />
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-6 bg-slate-50 flex justify-center border-t border-slate-100">
                    <button className="text-purple-600 font-bold text-sm hover:underline flex items-center gap-2">
                      <span>+</span> Añadir Nueva Regla de Región
                    </button>
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl border border-slate-200 p-8">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-6">Configuración de Pantalla</h4>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800">Auto-redirección Geográfica</p>
                          <p className="text-xs text-slate-500">Forzar moneda local basándose en la IP.</p>
                        </div>
                        <div className="w-12 h-6 bg-purple-600 rounded-full relative cursor-pointer">
                          <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800">Selector de Moneda en UI</p>
                          <p className="text-xs text-slate-500">Permitir al usuario cambiar manualmente.</p>
                        </div>
                        <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                          <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-xl p-8 text-white">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">🌍</div>
                      <h4 className="font-bold uppercase tracking-[0.2em] text-sm opacity-60">Insight Global</h4>
                    </div>
                    <div className="text-4xl font-black mb-2 tracking-tighter">1,284</div>
                    <p className="text-sm opacity-70 leading-relaxed max-w-xs">
                      Usuarios activos detectados en 12 zonas horarias diferentes. 
                      La moneda más consultada hoy: <span className="text-purple-400 font-bold">EUR (65%)</span>.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

