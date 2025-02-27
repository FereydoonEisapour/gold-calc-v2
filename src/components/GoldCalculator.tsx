import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Calculator,
  Info,
  Save,
  Share2,
  AlertTriangle,
  RefreshCw,
  History,
  Scale,
} from "lucide-react";

import {
  fetchCurrentGoldPrice,
  convertToUSD,
  calculateGoldValue,
  convertCaratToWeight,
} from "../utils/api";
import {
  formatPersianNumber,
  formatPersianCurrency,
  formatPersianDate,
  formatCurrency,
} from "../utils/formatters";
import { saveCalculation, saveLastKnownPrice, getLastKnownPrice } from "../utils/storage";
import PriceHistoryChart from "./PriceHistoryChart";
import SavedCalculations from "./SavedCalculations";
import CaratCalculator from "./CaratCalculator";

const GoldCalculator: React.FC = () => {
  const [weight, setWeight] = useState<number>(1);
  const [purity, setPurity] = useState<number>(24);
  const [customPurity, setCustomPurity] = useState<number>(75);
  const [goldPrice, setGoldPrice] = useState<number | null>(null);
  const [goldPrices, setGoldPrices] = useState<{
    gold24k: number | null;
    gold18k: number | null;
    usd: number | null;
  }>({
    gold24k: null,
    gold18k: null,
    usd: null,
  });

  const [priceTimestamp, setPriceTimestamp] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState<boolean>(false);
  const [showCaratCalculator, setShowCaratCalculator] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch gold price on component mount
  useEffect(() => {
    fetchGoldPrice();
  }, []);

  // Fetch current gold price from API
  const fetchGoldPrice = async () => {
    try {
      setIsRefreshing(true);
      const data = await fetchCurrentGoldPrice();
      setGoldPrice(data.price);
      setPriceTimestamp(data.timestamp);

      if (data.prices) {
        setGoldPrices({
          gold24k: data.prices.gold24k,
          gold18k: data.prices.gold18k,
          usd: data.prices.usd,
        });
      }

      // Save last known price for offline use
      saveLastKnownPrice(data.price, data.timestamp);

      setError(null);
    } catch (err) {
      console.error("Error fetching gold price:", err);
      setError("خطا در دریافت قیمت طلا. از آخرین قیمت ذخیره شده استفاده می‌شود.");

      // Use last known price if available
      const lastKnownPrice = getLastKnownPrice();
      if (lastKnownPrice) {
        setGoldPrice(lastKnownPrice.price);
        setPriceTimestamp(lastKnownPrice.timestamp);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Calculate total value based on weight, purity, and current gold price
  const calculateTotalValue = (): number => {
    if (!goldPrice || !weight) return 0;

    const actualPurity = purity === 0 ? customPurity / 100 : purity / 24;
    return weight * goldPrice * actualPurity;
  };

  // Handle weight input change
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0) {
      setWeight(0);
    } else if (value > 10000) {
      setWeight(10000);
      toast.warning("حداکثر وزن مجاز ۱۰۰۰۰ گرم است");
    } else {
      setWeight(value);
    }
  };

  // Handle purity selection change
  const handlePurityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    setPurity(value);
  };

  // Handle custom purity input change
  const handleCustomPurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value < 1) {
      setCustomPurity(1);
    } else if (value > 1000) {
      setCustomPurity(1000);
      toast.warning("حداکثر عیار مجاز ۱۰۰۰ است");
    } else {
      setCustomPurity(value);
    }
  };

  // Save current calculation
  const handleSaveCalculation = () => {
    if (!goldPrice || !weight) {
      toast.error("لطفا مقادیر معتبر وارد کنید");
      return;
    }

    const totalValue = calculateTotalValue();
    const actualPurity = purity === 0 ? customPurity : (purity / 24) * 100;

    saveCalculation({
      weight,
      purity: actualPurity,
      price: goldPrice,
      totalValue,
      timestamp: Date.now(),
    });

    toast.success("محاسبه با موفقیت ذخیره شد");
  };

  // Share calculation result
  const handleShareResult = () => {
    if (!goldPrice || !weight) {
      toast.error("لطفا مقادیر معتبر وارد کنید");
      return;
    }

    const totalValue = calculateTotalValue();
    const actualPurity = purity === 0 ? customPurity : (purity / 24) * 100;

    const shareText = `
محاسبه ارزش طلای آب شده:
وزن: ${formatPersianNumber(weight)} گرم
عیار: ${formatPersianNumber(actualPurity)}٪
قیمت هر گرم: ${formatPersianCurrency(goldPrice!)}
ارزش کل: ${formatPersianCurrency(totalValue)}
    `.trim();

    if (navigator.share) {
      navigator
        .share({
          title: "محاسبه ارزش طلای آب شده",
          text: shareText,
        })
        .catch((err) => {
          console.error("Error sharing:", err);
          toast.error("خطا در اشتراک‌گذاری نتیجه");
        });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard
        .writeText(shareText)
        .then(() => toast.success("نتیجه محاسبه در کلیپ‌بورد کپی شد"))
        .catch(() => toast.error("خطا در کپی نتیجه"));
    }
  };

  const totalValue = calculateTotalValue();
  const usd_price = Number(goldPrices.usd);
  const totalValueUSD = convertToUSD(totalValue, usd_price);

  return (
    <div className="min-h-screen bg-sand-light persian-pattern">
      <ToastContainer position="top-center" autoClose={3000} rtl={true} />

      <header className="gold-gradient text-white py-4 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
              <Calculator className="ml-2" />
              محاسبه‌گر طلای آب‌شده
            </h1>
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={() => {
                  setShowSaved(false);
                  setShowCaratCalculator(!showCaratCalculator);
                }}
                className="bg-white text-amber-700 px-3 py-1 rounded-md flex items-center text-sm ml-2"
              >
                <Scale className="ml-1 w-4 h-4" />
                {showCaratCalculator ? "بازگشت به محاسبه" : "تبدیل عیار"}
              </button>
              <button
                onClick={() => {
                  setShowCaratCalculator(false);
                  setShowSaved(!showSaved);
                }}
                className="bg-white text-amber-700 px-3 py-1 rounded-md flex items-center text-sm"
              >
                <History className="ml-1 w-4 h-4" />
                {showSaved ? "بازگشت به محاسبه" : "محاسبات ذخیره شده"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showSaved ? (
          <SavedCalculations onBack={() => setShowSaved(false)} />
        ) : showCaratCalculator ? (
          <CaratCalculator onBack={() => setShowCaratCalculator(false)} goldPrices={goldPrices} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="card mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gold-dark">اطلاعات طلا</h2>

                  <div className="flex items-center">
                    {isLoading ? (
                      <span className="text-gray-500 text-sm">در حال بارگذاری...</span>
                    ) : (
                      <>
                        <button
                          onClick={fetchGoldPrice}
                          className="text-amber-600 hover:text-amber-800 p-1 rounded-full"
                          disabled={isRefreshing}
                        >
                          <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
                        </button>
                        <div className="text-sm text-gray-500 mr-2">
                          {priceTimestamp && (
                            <span>آخرین به‌روزرسانی: {formatPersianDate(priceTimestamp)}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="bg-amber-50 border-r-4 border-amber-500 p-4 mb-6 flex items-start">
                    <AlertTriangle className="text-amber-500 ml-3 mt-1 flex-shrink-0" />
                    <p className="text-amber-700">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      وزن (گرم)
                      <span className="text-xs text-gray-500 mr-2 group relative inline-block">
                        <Info className="w-4 h-4 inline-block" />
                        <span className="tooltip">
                          وزن طلا را به گرم وارد کنید. محدوده مجاز: ۰.۱ تا ۱۰۰۰۰ گرم
                        </span>
                      </span>
                    </label>
                    <input
                      type="number"
                      value={weight || ""}
                      onChange={handleWeightChange}
                      min="0.1"
                      max="10000"
                      step="0.1"
                      className="input-field"
                      placeholder="وزن طلا به گرم"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      عیار
                      <span className="text-xs text-gray-500 mr-2 group relative inline-block">
                        <Info className="w-4 h-4 inline-block" />
                        <span className="tooltip">
                          عیار طلا را انتخاب کنید. برای طلای آبشده، گزینه "طلای آبشده" را انتخاب
                          کنید.
                        </span>
                      </span>
                    </label>
                    <select value={purity} onChange={handlePurityChange} className="input-field">
                      <option value={24}>طلای ۲۴ عیار (۱۰۰٪)</option>
                      <option value={18}>طلای ۱۸ عیار (۷۵٪)</option>
                      <option value={0}>طلای آبشده </option>
                    </select>

                    {purity === 0 && (
                      <div className="mt-4">
                        <label className="block text-gray-700 mb-2 font-medium">
                        عیار طلای آبشده 
                          <span className="text-xs text-gray-500 mr-2 group relative inline-block">
                            <Info className="w-4 h-4 inline-block" />
                            <span className="tooltip">
                              عیار طلا را از فاکتور وارد کنید. مثال: ۷۵۰
                            </span>
                          </span>
                        </label>
                        <div className="flex items-center">
                          <input
                            type="number"
                            value={customPurity || ""}
                            onChange={handleCustomPurityChange}
                            min="1"
                            max="1000"
                            step="0.1"
                            className="input-field"
                          />
                          {/* <span className="mr-2 text-gray-700">٪</span> */}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-xl font-bold text-gold-dark mb-6">نتیجه محاسبه</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                    <h3 className="text-amber-800 text-sm mb-1">قیمت هر گرم طلای ۲۴ عیار</h3>
                    <p className="text-xl font-bold">
                      {goldPrice ? formatPersianCurrency(goldPrice) : "..."}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {goldPrice ? formatCurrency(goldPrice) : " "}
                    </p>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                    <h3 className="text-amber-800 text-sm mb-1">ارزش کل</h3>
                    <p className="text-xl font-bold">
                      {goldPrice ? formatPersianCurrency(totalValue) : "..."}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {goldPrice ? `  معادل : ${formatCurrency(totalValueUSD, "USD")} ` : " "}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button onClick={handleSaveCalculation} className="btn-primary flex items-center">
                    <Save className="ml-2 w-5 h-5" />
                    ذخیره محاسبه
                  </button>

                  <button
                    onClick={handleShareResult}
                    className="bg-white border border-amber-500 text-amber-700 hover:bg-amber-50 font-bold py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
                  >
                    <Share2 className="ml-2 w-5 h-5" />
                    اشتراک‌گذاری
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="card mb-8">
                <h2 className="text-xl font-bold text-gold-dark mb-6">قیمت‌های فعلی</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-amber-50">
                        <th className="text-right p-2 border border-amber-200">نوع</th>
                        <th className="text-right p-2 border border-amber-200">قیمت (تومان)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border border-amber-200">طلای ۲۴ عیار</td>
                        <td className="p-2 border border-amber-200">
                          {goldPrices.gold24k
                            ? formatPersianNumber(Math.round(goldPrices.gold24k / 10))
                            : "..."}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-amber-200">طلای ۱۸ عیار</td>
                        <td className="p-2 border border-amber-200">
                          {goldPrices.gold18k
                            ? formatPersianNumber(Math.round(goldPrices.gold18k / 10))
                            : "..."}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-amber-200">دلار</td>
                        <td className="p-2 border border-amber-200">
                          {goldPrices.usd ? formatPersianNumber(goldPrices.usd) : "..."}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* <div className="card">
                <h2 className="text-xl font-bold text-gold-dark mb-6">نمودار قیمت طلا</h2>
                <div className="rtl-chart">
                  <PriceHistoryChart />
                </div>
              </div> */}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gold-dark text-white py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            محاسبه‌گر طلای آب‌شده - تمامی قیمت‌ها تقریبی هستند و برای اطلاعات دقیق‌تر با صرافی‌ها
            تماس بگیرید
          </p>
        </div>
      </footer>
    </div>
  );
};

export default GoldCalculator;
