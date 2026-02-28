import { useState, useEffect } from 'react';

export type Region = 'gulf' | 'north-africa' | 'other';

interface RegionData {
  region: Region;
  country: string;
  currency: string;
  currencySymbol: string;
}

const GULF_COUNTRIES = ['AE', 'QA', 'BH', 'KW', 'SA', 'OM'];
const NORTH_AFRICA_COUNTRIES = ['MA', 'DZ', 'TN', 'LY', 'EG'];

export const useRegionDetection = () => {
  const [regionData, setRegionData] = useState<RegionData>({
    region: 'other',
    country: '',
    currency: 'USD',
    currencySymbol: '$'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectRegion = async () => {
      try {
        // Try to get country from IP-based geolocation
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        const countryCode = data.country_code;
        let detectedRegion: Region = 'other';
        let currency = 'USD';
        let currencySymbol = '$';

        if (GULF_COUNTRIES.includes(countryCode)) {
          detectedRegion = 'gulf';
          currency = 'USD';
          currencySymbol = '$';
        } else if (NORTH_AFRICA_COUNTRIES.includes(countryCode)) {
          detectedRegion = 'north-africa';
          currency = 'USD';
          currencySymbol = '$';
        }

        setRegionData({
          region: detectedRegion,
          country: data.country_name || '',
          currency,
          currencySymbol
        });
      } catch (error) {
        console.error('Region detection failed:', error);
        // Default to 'other' region
        setRegionData({
          region: 'other',
          country: '',
          currency: 'USD',
          currencySymbol: '$'
        });
      } finally {
        setLoading(false);
      }
    };

    detectRegion();
  }, []);

  return { ...regionData, loading };
};
