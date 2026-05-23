import React, { useState, useEffect } from 'react';
import { Settings, User, Lock, Palette, Globe, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import axiosClient from '../api/axiosClient';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Security Tab State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Platform Settings State
  const [loadingPlatform, setLoadingPlatform] = useState(false);
  const [platformSettings, setPlatformSettings] = useState({
    supportEmail: '', supportPhone: '',
    facebookUrl: '', whatsappUrl: '', instagramUrl: '', snapchatUrl: '', linkedinUrl: '',
    showFacebook: true, showWhatsapp: true, showInstagram: true, showSnapchat: false, showLinkedin: false,
    taxNumber: '', commercialRecord: '', showLegalFooter: false
  });

  const userName = localStorage.getItem('flexora_user_name') || 'مدير النظام';
  const userRole = localStorage.getItem('flexora_user_role') || 'Platform-Owner';

  useEffect(() => {
    if (activeTab === 'platform') {
      fetchPlatformSettings();
    }
  }, [activeTab]);

  const fetchPlatformSettings = async () => {
    try {
      const { data } = await axiosClient.get('/admin/settings/platform');
      if (data?.data?.settings) {
        setPlatformSettings(data.data.settings);
      }
    } catch (err) {
      console.error('Error fetching platform settings:', err);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return Swal.fire('خطأ', 'كلمة المرور الجديدة غير متطابقة', 'error');
    }
    setLoadingPassword(true);
    try {
      await axiosClient.put('/admin/settings/password', { oldPassword, newPassword });
      Swal.fire('تم!', 'تم تغيير كلمة المرور بنجاح', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      Swal.fire('خطأ', err.response?.data?.message || 'فشل تغيير كلمة المرور', 'error');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handlePlatformSettingsSave = async (e) => {
    e.preventDefault();
    setLoadingPlatform(true);
    try {
      await axiosClient.put('/admin/settings/platform', platformSettings);
      Swal.fire({
        icon: 'success',
        title: 'تم التحديث بنجاح',
        text: 'تم حفظ إعدادات المنصة المركزية والمصفوفة الضريبية.',
        confirmButtonColor: '#00ff9d',
        background: '#1a1a1a',
        color: '#fff'
      });
    } catch (err) {
      Swal.fire('خطأ', 'فشل حفظ الإعدادات', 'error');
    } finally {
      setLoadingPlatform(false);
    }
  };

  const handleThemeToggle = () => {
    Swal.fire('تلميح', 'الوضع الليلي (Dark Mode) هو الوضع الأساسي والافتراضي للمنظومة لضمان أفضل تجربة بصرية ولإبراز الجودة العالية للتصميم.', 'info');
  };

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlatformSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Cyberpunk Toggle Component
  const CyberToggle = ({ label, name, checked, onChange }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: '0.9rem', color: '#e0e0e0' }}>{label}</span>
      <label className="cyber-toggle">
        <input type="checkbox" name={name} checked={checked} onChange={onChange} />
        <span className="cyber-slider"></span>
      </label>
    </div>
  );

  return (
    <div className="page-wrapper fade-in">
      {/* Cyberpunk Toggle CSS */}
      <style>{`
        .cyber-toggle {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 22px;
        }
        .cyber-toggle input { opacity: 0; width: 0; height: 0; }
        .cyber-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #2a2a2a; 
          transition: .3s;
          border-radius: 34px;
          border: 1px solid #444;
        }
        .cyber-slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 3px;
          bottom: 3px;
          background-color: #888;
          transition: .3s;
          border-radius: 50%;
        }
        .cyber-toggle input:checked + .cyber-slider {
          background-color: #00ff9d; 
          border-color: #00ff9d;
          box-shadow: 0 0 10px rgba(0, 255, 157, 0.4);
        }
        .cyber-toggle input:checked + .cyber-slider:before {
          transform: translateX(22px);
          background-color: #111;
        }
        .cyber-input {
          background: rgba(0,0,0,0.3);
          border: 1px solid #333;
          color: #fff;
          padding: 10px 14px;
          border-radius: 6px;
          width: 100%;
          transition: border-color 0.3s;
        }
        .cyber-input:focus {
          outline: none;
          border-color: #00ff9d;
        }
        .sector-title {
          font-size: 1.1rem;
          color: #00ff9d;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 1px solid #333;
          padding-bottom: 8px;
        }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Settings size={28} style={{ display: 'inline', marginLeft: '10px', color: 'var(--color-primary)' }}/> 
            إعدادات <span>المنظومة</span>
          </h1>
          <p className="page-subtitle">تخصيص وضبط حسابك الشخصي وإعدادات المنصة</p>
        </div>
      </div>

      <div className="settings-container" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Sidebar Tabs */}
        <div className="glass-card" style={{ flex: '1 1 250px', padding: '16px', alignSelf: 'flex-start' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <button 
                onClick={() => setActiveTab('profile')} 
                className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-ghost'}`} 
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <User size={18} /> الحساب الشخصي
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('platform')} 
                className={`btn ${activeTab === 'platform' ? 'btn-primary' : 'btn-ghost'}`} 
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <Globe size={18} /> بيانات المنصة (Global Matrix)
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('security')} 
                className={`btn ${activeTab === 'security' ? 'btn-primary' : 'btn-ghost'}`} 
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <Lock size={18} /> الأمان وكلمة المرور
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('appearance')} 
                className={`btn ${activeTab === 'appearance' ? 'btn-primary' : 'btn-ghost'}`} 
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <Palette size={18} /> المظهر
              </button>
            </li>
          </ul>
        </div>

        {/* Content Area */}
        <div className="glass-card slide-in" style={{ flex: '3 1 500px', padding: '32px' }}>
          
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={20} color="var(--color-primary)"/> بيانات الحساب
              </h2>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>الاسم الكامل</label>
                <input type="text" className="form-input" value={userName} readOnly disabled />
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>الصلاحية</label>
                <input type="text" className="form-input" value={userRole === 'Platform-Owner' ? 'المالك الأساسي (Platform Owner)' : 'مدير منصة (Platform Manager)'} readOnly disabled />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                ملاحظة: تعديل البيانات الشخصية يتم مباشرة من قاعدة البيانات لضمان الموثوقية والأمان.
              </p>
            </div>
          )}

          {activeTab === 'platform' && (
            <form onSubmit={handlePlatformSettingsSave}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Globe size={20} color="#00ff9d"/> التحكم المركزي الشامل (Global Settings Matrix)
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                
                {/* Sector 1: Social Matrix */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid #222' }}>
                  <h3 className="sector-title">Social Visibility Matrix</h3>
                  
                  <CyberToggle label="تفعيل فيسبوك (Facebook)" name="showFacebook" checked={platformSettings.showFacebook} onChange={handleSettingChange} />
                  {platformSettings.showFacebook && (
                    <input type="text" name="facebookUrl" value={platformSettings.facebookUrl} onChange={handleSettingChange} placeholder="رابط فيسبوك..." className="cyber-input" style={{ marginBottom: '16px', marginTop: '4px' }} />
                  )}

                  <CyberToggle label="تفعيل واتساب (WhatsApp)" name="showWhatsapp" checked={platformSettings.showWhatsapp} onChange={handleSettingChange} />
                  {platformSettings.showWhatsapp && (
                    <input type="text" name="whatsappUrl" value={platformSettings.whatsappUrl} onChange={handleSettingChange} placeholder="رابط واتساب (أو الرقم)..." className="cyber-input" style={{ marginBottom: '16px', marginTop: '4px' }} />
                  )}

                  <CyberToggle label="تفعيل إنستجرام (Instagram)" name="showInstagram" checked={platformSettings.showInstagram} onChange={handleSettingChange} />
                  {platformSettings.showInstagram && (
                    <input type="text" name="instagramUrl" value={platformSettings.instagramUrl} onChange={handleSettingChange} placeholder="رابط إنستجرام..." className="cyber-input" style={{ marginBottom: '16px', marginTop: '4px' }} />
                  )}

                  <CyberToggle label="تفعيل سناب شات (Snapchat)" name="showSnapchat" checked={platformSettings.showSnapchat} onChange={handleSettingChange} />
                  {platformSettings.showSnapchat && (
                    <input type="text" name="snapchatUrl" value={platformSettings.snapchatUrl} onChange={handleSettingChange} placeholder="رابط سناب شات..." className="cyber-input" style={{ marginBottom: '16px', marginTop: '4px' }} />
                  )}

                  <CyberToggle label="تفعيل لينكد إن (LinkedIn)" name="showLinkedin" checked={platformSettings.showLinkedin} onChange={handleSettingChange} />
                  {platformSettings.showLinkedin && (
                    <input type="text" name="linkedinUrl" value={platformSettings.linkedinUrl} onChange={handleSettingChange} placeholder="رابط لينكد إن..." className="cyber-input" style={{ marginBottom: '16px', marginTop: '4px' }} />
                  )}
                </div>

                {/* Sector 2: Legal Credentials & General */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid #222' }}>
                  <h3 className="sector-title">Legal Credentials & Support</h3>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>البريد الإلكتروني للدعم التقني</label>
                    <input type="email" name="supportEmail" value={platformSettings.supportEmail} onChange={handleSettingChange} className="cyber-input" />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>رقم هاتف الدعم الفني</label>
                    <input type="text" name="supportPhone" value={platformSettings.supportPhone} onChange={handleSettingChange} className="cyber-input" />
                  </div>

                  <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '12px', borderBottom: '1px dashed #444', paddingBottom: '8px' }}>الملف الضريبي المصري</h4>
                  
                  <CyberToggle label="عرض البيانات القانونية على الفواتير والفوتر" name="showLegalFooter" checked={platformSettings.showLegalFooter} onChange={handleSettingChange} />
                  
                  <div style={{ marginBottom: '16px', marginTop: '12px', opacity: platformSettings.showLegalFooter ? 1 : 0.5, pointerEvents: platformSettings.showLegalFooter ? 'auto' : 'none' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>الرقم الضريبي (Tax Number)</label>
                    <input type="text" name="taxNumber" value={platformSettings.taxNumber} onChange={handleSettingChange} className="cyber-input" placeholder="مثال: 123-456-789" />
                  </div>

                  <div style={{ marginBottom: '16px', opacity: platformSettings.showLegalFooter ? 1 : 0.5, pointerEvents: platformSettings.showLegalFooter ? 'auto' : 'none' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>السجل التجاري (Commercial Record)</label>
                    <input type="text" name="commercialRecord" value={platformSettings.commercialRecord} onChange={handleSettingChange} className="cyber-input" placeholder="أدخل رقم السجل التجاري..." />
                  </div>

                </div>
              </div>

              <div style={{ marginTop: '24px', textAlign: 'left' }}>
                <button type="submit" className="btn" disabled={loadingPlatform} style={{ background: '#00ff9d', color: '#000', fontWeight: 'bold', padding: '12px 32px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={20} />
                  {loadingPlatform ? 'جاري المزامنة...' : 'حفظ ونشر التعديلات (Hydrate)'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Lock size={20} color="var(--color-primary)"/> تغيير كلمة المرور
              </h2>
              <form onSubmit={handlePasswordChange}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>كلمة المرور الحالية</label>
                  <input type="password" required className="form-input" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="أدخل كلمة المرور الحالية..." />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>كلمة المرور الجديدة</label>
                  <input type="password" required className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="أدخل كلمة المرور الجديدة..." />
                </div>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>تأكيد كلمة المرور الجديدة</label>
                  <input type="password" required className="form-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="أعد إدخال كلمة المرور الجديدة..." />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loadingPassword}>
                  {loadingPassword ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Palette size={20} color="var(--color-primary)"/> تخصيص المظهر
              </h2>
              <div style={{ padding: '20px', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>الوضع الليلي (Dark Mode)</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>الوضع المفضل لتقليل إجهاد العين.</p>
                </div>
                <button className="btn btn-primary" onClick={handleThemeToggle}>مفعل تلقائياً</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
