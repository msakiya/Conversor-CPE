import axios from "axios";

export const getCurrencyConfig = async () => {
  try {
    const response = await axios.get("/api/currency-config");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch currency config from backend", error);
    return null;
  }
};

export const getManualRates = async () => {
  try {
    const response = await axios.get("/api/manual-rates");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch manual rates", error);
    return {};
  }
};

export const saveManualRate = async (currency: string, rate: number | null) => {
  try {
    await axios.post("/api/manual-rates", { currency, rate });
  } catch (error) {
    console.error("Failed to save manual rate", error);
  }
};
