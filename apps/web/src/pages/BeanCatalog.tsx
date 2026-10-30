import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBeanStore } from '../store/useBeanStore';
import type { Bean } from '@brobean/shared';

export default function BeanCatalog() {
  const { beans, isLoading, error, isSubmitLoading, fetchBeans, addBean, editBean, removeBean } = useBeanStore();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchBeans();
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [fetchBeans]);

  const onSubmit = async (data: any) => {
    const payload = { ...data, photoBase64: photoPreview };
    const success = editingId ? await editBean(editingId, payload) : await addBean(payload);
    
    if (success) {
      reset();
      setPhotoPreview(null);
      setEditingId(null);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Brobean', { body: `Kopi ${data.name} berhasil disimpan!`, icon: '/vite.svg' });
      }
    }
  };

  const handleGetLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Browser tidak mendukung GPS');
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('latitude', pos.coords.latitude);
        setValue('longitude', pos.coords.longitude);
        setLocationLoading(false);
      },
      () => {
        setLocationError('Izin lokasi ditolak atau GPS mati.');
        setLocationLoading(false);
      }
    );
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-[#3E2723]">
      {/* Navbar UI */}
      <header className="bg-[#4E342E] text-[#EFEBE9] p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wide">☕ Brobean</h1>
          <span className="text-sm bg-[#5D4037] px-3 py-1 rounded-full border border-[#795548]">MVP Catalog</span>
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Panel Kiri: Form Input UI */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-2xl shadow-sm border border-[#D7CCC8]">
              <h2 className="text-xl font-semibold mb-5 text-[#5D4037] border-b pb-2 border-[#D7CCC8]">
                {editingId ? '✏️ Edit Data Kopi' : '✨ Tambah Koleksi'}
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#795548] mb-1">Nama Kopi</label>
                  <input {...register('name', { required: 'Wajib diisi' })} placeholder="mis. Gayo Wine" className="w-full p-2.5 bg-[#FDF8F5] border border-[#D7CCC8] rounded-lg focus:ring-2 focus:ring-[#8D6E63] outline-none transition" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{String(errors.name.message)}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#795548] mb-1">Roastery</label>
                  <input {...register('roastery', { required: 'Wajib diisi' })} placeholder="Nama penyangrai" className="w-full p-2.5 bg-[#FDF8F5] border border-[#D7CCC8] rounded-lg focus:ring-2 focus:ring-[#8D6E63] outline-none transition" />
                  {errors.roastery && <p className="text-red-500 text-xs mt-1">{String(errors.roastery.message)}</p>}
                </div>
              </div>

              {/* Sensor & Hardware UI */}
              <div className="bg-[#EFEBE9] p-4 rounded-xl mb-6 space-y-4 border border-[#D7CCC8]">
                <h3 className="text-xs font-bold text-[#5D4037] uppercase tracking-wider">Data Perangkat</h3>
                
                <div>
                  <button type="button" onClick={handleGetLocation} disabled={locationLoading} className="w-full bg-[#8D6E63] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#6D4C41] transition disabled:opacity-50 flex items-center justify-center gap-2">
                    📍 {locationLoading ? 'Melacak...' : 'Ambil Koordinat GPS'}
                  </button>
                  <div className="flex gap-2 mt-2">
                    <input {...register('latitude')} placeholder="Lat" readOnly className="w-full p-2 text-xs bg-gray-100 border-none rounded text-gray-500 text-center" />
                    <input {...register('longitude')} placeholder="Long" readOnly className="w-full p-2 text-xs bg-gray-100 border-none rounded text-gray-500 text-center" />
                  </div>
                  {locationError && <p className="text-red-500 text-xs mt-1">{locationError}</p>}
                </div>

                <div>
                  <label className="flex items-center justify-center w-full p-3 border-2 border-dashed border-[#8D6E63] rounded-lg cursor-pointer hover:bg-[#D7CCC8] transition">
                    <span className="text-sm text-[#5D4037] font-medium">📷 Ambil Foto Bungkus</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
                  </label>
                  {photoPreview && <img src={photoPreview} alt="Preview" className="mt-3 h-32 w-full object-cover rounded-lg shadow-sm border border-[#D7CCC8]" />}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={isSubmitLoading} className="flex-1 bg-[#4E342E] text-white py-2.5 rounded-lg font-medium hover:bg-[#3E2723] transition disabled:opacity-50">
                  {isSubmitLoading ? 'Menyimpan...' : (editingId ? 'Update' : 'Simpan')}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setPhotoPreview(null); reset(); }} className="flex-1 bg-transparent border border-[#795548] text-[#795548] py-2.5 rounded-lg hover:bg-[#EFEBE9] transition">
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Panel Kanan: Grid Catalog UI */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-[#4E342E] mb-6">Koleksi Biji Kopi</h2>
            
            {isLoading && <div className="text-center py-12 bg-white rounded-2xl border border-[#D7CCC8] animate-pulse">Menyeduh data...</div>}
            {error && !isLoading && (
              <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-200">
                <p className="text-red-800 mb-3">{error}</p>
                <button onClick={fetchBeans} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">Coba Lagi</button>
              </div>
            )}
            {!isLoading && !error && beans.length === 0 && (
              <div className="text-center py-12 bg-[#EFEBE9] rounded-2xl border-2 border-dashed border-[#D7CCC8] text-[#795548]">
                Belum ada koleksi kopi. Silakan tambah data.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {!isLoading && !error && beans.map((bean) => (
                <div key={bean.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#D7CCC8] hover:shadow-md transition flex flex-col justify-between group">
                  <div>
                    {bean.photoBase64 ? (
                      <div className="h-40 w-full mb-4 overflow-hidden rounded-xl bg-[#EFEBE9]">
                        <img src={bean.photoBase64} alt={bean.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      </div>
                    ) : (
                      <div className="h-40 w-full mb-4 rounded-xl bg-[#EFEBE9] flex items-center justify-center text-[#A1887F]">
                        <span className="text-3xl">☕</span>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-[#4E342E] truncate">{bean.name}</h3>
                    <p className="text-[#795548] text-sm mt-1 flex items-center gap-1">🏢 {bean.roastery}</p>
                    {bean.latitude && bean.longitude && (
                      <p className="text-xs text-[#8D6E63] mt-2 font-mono bg-[#FDF8F5] p-1.5 rounded inline-block">
                        📍 {bean.latitude.toFixed(3)}, {bean.longitude.toFixed(3)}
                      </p>
                    )}
                  </div>
                  <div className="mt-5 flex gap-3 pt-4 border-t border-[#EFEBE9]">
                    <button onClick={() => { setEditingId(bean.id!); setValue('name', bean.name); setValue('roastery', bean.roastery); setValue('latitude', bean.latitude); setValue('longitude', bean.longitude); setPhotoPreview(bean.photoBase64 || null); }} className="flex-1 py-1.5 text-sm font-medium text-[#4E342E] bg-[#EFEBE9] rounded-lg hover:bg-[#D7CCC8] transition">Edit</button>
                    <button onClick={() => removeBean(bean.id!)} className="flex-1 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}