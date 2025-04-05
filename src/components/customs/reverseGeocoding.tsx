/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Button } from '../ui/button';
import geofences from './jsonDataOutput/geofences.json';

interface GeofenceData {
  radar_id: string;
  external_id: string;
  coordinates: number[];
  city: string;
  province: string;
}

const GeocodingButton = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getCityFromAddress = (address: any): string => {
    return address.city || address.county || address.town || address.regency || address.village || '';
  };
  const getProvinceFromAddress = (address: any): string => {
    return address.state || address.region || '';
  };

  const saveToFile = (data: GeofenceData[]) => {
    // Membuat Blob dari data JSON
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    // Membuat URL untuk Blob
    const url = URL.createObjectURL(blob);

    // Membuat elemen anchor untuk download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newGeofences.json';

    // Trigger download
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGeocoding = async () => {
    setIsProcessing(true);
    try {
      const processedData: GeofenceData[] = [];

      for (let i = 0; i < geofences.length; i++) {
        const { radar_id, external_id, coordinates } = geofences[i];

        if (!coordinates || coordinates.length < 2) {
          processedData.push({ radar_id, external_id, coordinates: coordinates || [], city: '', province: '' });
          continue;
        }

        const [lon, lat] = coordinates;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
              }
            }
          );

          const data = await response.json();
          const city = getCityFromAddress(data.address || {});
          const province = getProvinceFromAddress(data.address || {});
          processedData.push({ radar_id, external_id, coordinates, city, province });
        } catch (error) {
          console.error(`Error processing ${external_id}:`, error);
          processedData.push({ radar_id, external_id, coordinates, city: '', province: '' });
        }

        if (i < geofences.length - 1) await sleep(1000);
      }

      // Simpan ke file JSON
      saveToFile(processedData);
      console.log('File newGeofences.json telah di-generate');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <Button
        variant="default"
        onClick={handleGeocoding}
        disabled={isProcessing}
        className='mb-4'
      >
        {isProcessing ? 'Processing...' : 'Start Geocoding & Download JSON'}
      </Button>
    </div>
  );
};

export default GeocodingButton;