import React, { useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 rounded-lg border border-[#D4AF37]/40 bg-[#122D22] px-3.5 py-2 text-xs font-semibold text-[#F3D77D] hover:bg-[#193B2D] hover:border-[#D4AF37] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        title="Install aplikasi PAKEBOX STUDIO ke perangkat"
      >
        <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span>{isIOS ? 'Install di iOS' : 'Install PWA'}</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-[#D4AF37]/30 bg-[#0D2119] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/15">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-semibold text-[#F4F1EA]">
                  Install PAKEBOX STUDIO
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-[#94A89B] hover:bg-[#163528] hover:text-[#F4F1EA] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-[#B8C7BE] leading-relaxed">
              {isIOS ? (
                <>
                  <p>Untuk menginstal aplikasi ini di iPhone atau iPad Anda:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-[#F4F1EA]">
                    <li>Ketuk tombol <strong>Bagikan (Share)</strong> di bilah navigasi Safari.</li>
                    <li>Gulir ke bawah dan pilih <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.</li>
                  </ol>
                </>
              ) : (
                <>
                  <p>
                    Aplikasi <strong>PAKEBOX STUDIO</strong> sudah mendukung mode <em>Progressive Web App (PWA)</em> dan penyimpanan lokal (client-side).
                  </p>
                  <p className="text-xs text-[#94A89B]">
                    Untuk menginstal langsung dari browser Desktop/Android: klik ikon <strong>Install / Unduh</strong> di sisi kanan address bar browser Anda, atau buka aplikasi di tab baru penuh.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg bg-[#D4AF37] px-4 py-2 text-xs font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg border border-[#D4AF37]/40 bg-[#122D22] px-3.5 py-2 text-xs font-medium text-[#F3D77D] shadow-lg">
      <WifiOff className="h-3.5 w-3.5 text-[#D4AF37]" />
      <span>Mode Offline — Data lokal tetap tersimpan di perangkat.</span>
    </div>
  );
};
