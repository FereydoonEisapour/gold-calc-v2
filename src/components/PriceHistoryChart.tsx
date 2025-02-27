import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { fetchHistoricalPrices } from '../utils/api';
import { formatPersianNumber } from '../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PriceHistoryChart: React.FC = () => {
  const [historicalData, setHistoricalData] = useState<{ dates: string[], prices: number[] }>({
    dates: [],
    prices: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchHistoricalPrices(7);
        
        const dates = data.map(item => item.date);
        const prices = data.map(item => item.price);
        
        setHistoricalData({ dates, prices });
        setError(null);
      } catch (err) {
        console.error('Error fetching historical prices:', err);
        setError('خطا در دریافت تاریخچه قیمت');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Convert dates to Persian format (simplified)
  const persianDates = historicalData.dates.map(date => {
    const [year, month, day] = date.split('-');
    return `${formatPersianNumber(parseInt(day))}/${formatPersianNumber(parseInt(month))}`;
  });

  const chartData = {
    labels: persianDates,
    datasets: [
      {
        label: 'قیمت طلا (ریال)',
        data: historicalData.prices,
        borderColor: '#d4af37',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#8a6d3b',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointRadius: 4,
        tension: 0.3,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('fa-IR').format(context.parsed.y) + ' ریال';
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('en-US', { 
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value);
          }
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default PriceHistoryChart;