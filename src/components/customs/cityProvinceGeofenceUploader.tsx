import { useState } from 'react';
import { Button } from '../ui/button';
import supabase from '@/utils/supabase';

interface GeofenceData {
  radar_id: string;
  external_id: string;
  coordinates: number[];
  city: string;
  province: string;
}

const CityProvinceUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    error: number;
    errors: string[];
  }>({ success: 0, error: 0, errors: [] });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult({ success: 0, error: 0, errors: [] });

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const text = e.target?.result;
        if (!text) return;

        const geofences: GeofenceData[] = JSON.parse(text as string);
        const results = await processUpload(geofences);
        setUploadResult(results);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setUploadResult(prev => ({
        ...prev,
        error: prev.error + 1,
        errors: [...prev.errors, 'File format invalid']
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const processUpload = async (geofences: GeofenceData[]) => {
    let successCount = 0;
    let errorCount = 0;
    const errorMessages: string[] = [];

    // 1. Update data existing berdasarkan radar_id
    const updates = geofences.map(async (g) => {
      try {
        const { error } = await supabase
          .from('geofences')
          .update({ city: g.city, province: g.province })
          .eq('radar_id', g.radar_id);

        if (error) throw error;
        successCount++;
      } catch (error) {
        errorCount++;
        errorMessages.push(`Gagal update radar_id ${g.radar_id}: ${error}`);
      }
    });

    await Promise.all(updates);

    return {
      success: successCount,
      error: errorCount,
      errors: errorMessages
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            variant="outline"
            asChild
            disabled={isUploading}
          >
            <span>Pilih File JSON</span>
          </Button>
        </label>

        <Button
          variant="default"
          disabled={isUploading}
          onClick={() => (document.querySelector('input[type="file"]') as HTMLElement)?.click()}
        >
          {isUploading ? 'Mengunggah...' : 'Mulai Unggah'}
        </Button>
      </div>

      {uploadResult && (
        <div className="p-4 mt-4 bg-gray-100 rounded-lg">
          <h4 className="mb-2 font-semibold">Hasil Unggahan:</h4>
          <p>✅ Berhasil: {uploadResult.success}</p>
          <p>❌ Gagal: {uploadResult.error}</p>

          {uploadResult.errors.length > 0 && (
            <div className="mt-2 text-red-600">
              <p>Detail Kesalahan:</p>
              <ul className="pl-6 list-disc">
                {uploadResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CityProvinceUploader;