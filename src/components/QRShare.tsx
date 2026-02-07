'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRShareProps {
  roomId: string;
}

export default function QRShare({ roomId }: QRShareProps) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const roomUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/room/${roomId}`
      : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          onClick={() => setShowQR(!showQR)}
          className="bg-gray-800 text-gray-300 hover:text-white px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-600 transition-all flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          QR
        </button>
        <button
          onClick={handleCopyLink}
          className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
            copied
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-purple-600 text-white hover:bg-purple-500'
          }`}
        >
          {copied ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          )}
          {copied ? 'Copied!' : 'Invite'}
        </button>
      </div>

      {showQR && (
        <div className="absolute top-full mt-2 right-0 bg-gray-900 border border-gray-700 p-5 rounded-xl shadow-2xl shadow-black/50 z-50">
          <div className="bg-white p-3 rounded-lg">
            <QRCodeSVG value={roomUrl} size={180} />
          </div>
          <p className="text-center text-gray-400 text-xs mt-3 font-medium">
            Scan to join room
          </p>
        </div>
      )}
    </div>
  );
}
