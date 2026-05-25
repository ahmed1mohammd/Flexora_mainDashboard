// ============================================================
// PWAInstallBanner — بانر تثبيت التطبيق الاحترافي
// يظهر تلقائياً بعد ثانيتين من أول فتح للتطبيق
// ============================================================

import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function PWAInstallBanner() {
  const { isInstalled, triggerInstall, showBanner, dismissBanner, isInstallable } = usePWAInstall();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (showBanner && !isInstalled) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [showBanner, isInstalled]);

  if (!visible) return null;

  const handleInstall = async () => {
    if (isInstallable) {
      await triggerInstall();
    } else {
      // Fallback instructions for browsers that don't fire beforeinstallprompt
      dismissBanner();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'calc(100% - 48px)',
        maxWidth: '480px',
        background: 'linear-gradient(135deg, rgba(26,26,26,0.97) 0%, rgba(20,20,20,0.97) 100%)',
        border: '1px solid rgba(229,9,20,0.35)',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(229,9,20,0.1), 0 0 20px rgba(229,9,20,0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        animation: 'slideUpBanner 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        direction: 'rtl',
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
      }}
    >
      <style>{`
        @keyframes slideUpBanner {
          from { transform: translateX(-50%) translateY(100px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }
      `}</style>

      {/* Icon */}
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        background: 'linear-gradient(135deg, #E50914, #C0070F)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(229,9,20,0.4)',
      }}>
        <Smartphone size={22} color="#fff" />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f5f5f5', marginBottom: '2px' }}>
          ثبّت منظومة فليكسورا
        </div>
        <div style={{ fontSize: '0.75rem', color: '#8a8a8a', lineHeight: 1.4 }}>
          أضف التطبيق لشاشة هاتفك للوصول السريع بدون متصفح
        </div>
      </div>

      {/* Install Button */}
      <button
        onClick={handleInstall}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 14px',
          background: 'linear-gradient(135deg, #E50914, #C0070F)',
          color: '#fff', border: 'none', borderRadius: '10px',
          fontSize: '0.78rem', fontWeight: 700,
          cursor: 'pointer', flexShrink: 0,
          fontFamily: "'Cairo', 'Tajawal', sans-serif",
          boxShadow: '0 4px 12px rgba(229,9,20,0.35)',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
      >
        <Download size={14} />
        تثبيت
      </button>

      {/* Dismiss Button */}
      <button
        onClick={dismissBanner}
        style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#6e6e73', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,71,87,0.15)'; e.currentTarget.style.color = '#ff4757'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#6e6e73'; }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
