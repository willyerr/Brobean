import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBeanStore } from '../store/useBeanStore';
import type { Bean } from '@brobean/shared';

export default function BeanCatalog() {
  const { beans, isLoading, error, isSubmitLoading, fetchBeans, addBean, editBean, removeBean } = useBeanStore();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // States untuk Advanced Features
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchBeans();
    // Meminta izin Notifikasi saat aplikasi pertama kali dibuka
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [fetchBeans]);

  // ADVANCED FEATURE 1 & 3: Notifikasi & Submit
  const onSubmit = async (data: any) => {
    const payload = { ...data, photoBase64: photoPreview };
    let success = false;
    
    if (editingId) {
      success = await editBean(editingId, payload);
      setEditingId(null);
    } else {
      success = await addBean(payload);
    }
    
    if (success) {
      reset();
      setPhotoPreview(null);
      // Memicu Push Notification jika diizinkan
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Brobean', {
          body: `Kopi ${data.name} berhasil disimpan!`,
          icon: '/vite.svg'
        });
      }
    }
  };

  // ADVANCED FEATURE 2: Geolocation (Lokasi)
  const handleGetLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('Browser tidak mendukung GPS');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('latitude', position.coords.latitude);
        setValue('longitude', position.coords.longitude);
        setLocationLoading(false);
      },
      (err) => {
        setLocationError('Izin lokasi ditolak atau GPS mati.');
        setLocationLoading(false);
      }
    );
  };

  // ADVANCED FEATURE 3: Kamera (Media Capture)
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setPhotoPreview(null);
    reset();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Brobean MVP: Katalog Kopi</h1>

      {/* FORM CRUD & ADVANCED FEATURES */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 shadow-md rounded-lg mb-8 border">
        <h2 className="font-semibold mb-4 text-lg">
          {editingId ? 'Edit Data Kopi' : 'Tambah Data Baru'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <input 
              {...register('name', { required: 'Nama kopi wajib diisi' })} 
              placeholder="Nama Kopi (mis. Gayo Natural)" 
              className="w-full p-2 border rounded focus:outline-blue-500"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{String(errors.name.message)}</p>}
          </div>
          <div>
            <input 
              {...register('roastery', { required: 'Roastery wajib diisi' })} 
              placeholder="Roastery" 
              className="w-full p-2 border rounded focus:outline-blue-500"
            />
            {errors.roastery && <p className="text-red-500 text-sm mt-1">{String(errors.roastery.message)}</p>}
          </div>
        </div>

        {/* INTEGRASI SENSOR & HARDWARE */}
        <div className="p-4 bg-gray-50 border rounded mb-6 space-y-4">
          <h3 className="font-semibold text-gray-700 text-sm">Fitur Tambahan (Hardware APIs)</h3>
          
          {/* Geolocation UI */}
          <div className="flex flex-col gap-2">
            <button 
              type="button" 
              onClick={handleGetLocation}
              disabled={locationLoading}
              className="bg-green-600 text-white px-3 py-2 rounded text-sm w-fit hover:bg-green-700 disabled:bg-green-300"
            >
              {locationLoading ? 'Mencari lokasi...' : '📍 Ambil Koordinat GPS Saat Ini'}
            </button>
            <div className="flex gap-2">
              <input {...register('latitude')} placeholder="Latitude" readOnly className="w-full p-2 text-sm border rounded bg-gray-100 text-gray-500" />
              <input {...register('longitude')} placeholder="Longitude" readOnly className="w-full p-2 text-sm border rounded bg-gray-100 text-gray-500" />
            </div>
            {locationError && <p className="text-red-500 text-xs">{locationError}</p>}
          </div>

          {/* Camera UI */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-600">📷 Foto Bungkus Kopi (Kamera)</label>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={handlePhotoCapture}
              className="text-sm"
            />
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="h-32 w-32 object-cover rounded border mt-2" />
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            type="submit" 
            disabled={isSubmitLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 transition"
          >
            {isSubmitLoading ? 'Menyimpan...' : (editingId ? 'Update Biji Kopi' : 'Simpan Biji Kopi')}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition">
              Batal
            </button>
          )}
        </div>
      </form>

      {/* TAMPILAN DATA */}
      {isLoading && <div className="text-center p-8 text-gray-500 animate-pulse">Memuat data dari server...</div>}
      
      {error && !isLoading && (
        <div className="text-center p-8 bg-red-50 text-red-600 rounded">
          <p>{error}</p>
          <button onClick={fetchBeans} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">Coba Lagi</button>
        </div>
      )}

      {!isLoading && !error && beans.length === 0 && (
        <div className="text-center p-8 bg-gray-50 rounded text-gray-500 border border-dashed">
          Belum ada data biji kopi.
        </div>
      )}

      {!isLoading && !error && beans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {beans.map((bean) => (
            <div key={bean.id} className="p-5 border rounded-lg shadow-sm bg-white flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{bean.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{bean.roastery}</p>
                {bean.latitude && bean.longitude && (
                  <p className="text-xs text-blue-600">📍 Lokasi: {bean.latitude.toFixed(4)}, {bean.longitude.toFixed(4)}</p>
                )}
                {bean.photoBase64 && (
                  <img src={bean.photoBase64} alt="Kopi" className="h-24 w-full object-cover rounded mt-2" />
                )}
              </div>
              <div className="mt-4 flex gap-3 border-t pt-3">
                <button onClick={() => {
                  setEditingId(bean.id!);
                  setValue('name', bean.name);
                  setValue('roastery', bean.roastery);
                  setValue('latitude', bean.latitude);
                  setValue('longitude', bean.longitude);
                  setPhotoPreview(bean.photoBase64 || null);
                }} className="text-blue-600 font-medium hover:underline">Edit</button>
                <button onClick={() => removeBean(bean.id!)} className="text-red-600 font-medium hover:underline">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}