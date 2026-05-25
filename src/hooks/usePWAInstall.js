// ====================================================
// PWA Install Hook — محسّن مع fallback للبانر
// يلتقط حدث beforeinstallprompt + يكشف لو التطبيق
// مش متثبت ومش شغال كـ standalone
// ====================================================

import { useState, useEffect } from 'react';

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // التحقق إذا كان التطبيق مثبتاً أو شغال كـ standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      setShowBanner(false);
      return;
    }

    // التحقق إذا المستخدم أغلق البانر قبل كده
    const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
    if (!dismissed) {
      // أظهر البانر بعد ثانيتين لتجربة أفضل
      const timer = setTimeout(() => setShowBanner(true), 2000);
      setTimeout(() => clearTimeout(timer), 0);
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setIsInstallable(true);
      const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
      if (!dismissed) setShowBanner(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
      if (!dismissed) setShowBanner(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } else {
      // Fallback: عرض تعليمات التثبيت اليدوي
      setShowBanner(false);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', '1');
  };

  return { isInstallable, isInstalled, triggerInstall, showBanner, dismissBanner };
};
