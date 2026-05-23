// ============================================================
// صفحة تسجيل الدخول — POST /admin/login أو POST /user/login
// بوابة المصادقة الموحدة للمنظومة
// ─────────────────────────────────────────────────────────────
// ⚠ مهم: مدير النظام (Platform-Owner) يجب أن يستخدم
//        المسار /admin/login حصراً وليس /user/login
// ============================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Loader2, ShieldCheck, Building2 } from 'lucide-react';
import Swal from 'sweetalert2';
import axiosClient from '../api/axiosClient';

const LOGO_URL = 'https://i.ibb.co/qF44zwks/logo1-1.png';

export default function LoginPage() {
  const navigate  = useNavigate();
  // وضع الدخول: 'admin' = مدير المنظومة | 'gym' = مالك صالة
  const [loginMode, setLoginMode] = useState('admin');
  const [form, setForm]           = useState({ email: '', password: '' });
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── تحديد مسار الـ API بحسب وضع الدخول ──────────────────
  // Platform-Owner  → POST /admin/login
  // Gym-Owner       → POST /user/login
  const getEndpoint = () =>
    loginMode === 'admin' ? '/admin/login' : '/user/login';

  // ── معالج تسجيل الدخول ───────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      Swal.fire({
        title: 'بيانات ناقصة',
        text: 'يرجى إدخال البريد الإلكتروني وكلمة المرور',
        icon: 'warning',
        confirmButtonText: 'حسناً',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axiosClient.post(getEndpoint(), {
        email:    form.email.trim(),
        password: form.password,
      });

      // Extract token and user object correctly (some APIs wrap in 'data', others don't)
      const token = response.data.token;
      const user = response.data.data?.user || response.data.user;
      const role = user?.role || response.data.role;

      // حفظ بيانات المصادقة في التخزين المحلي
      localStorage.setItem('flexora_auth_token', token);
      localStorage.setItem('flexora_user_role',  role || (loginMode === 'admin' ? 'Platform-Owner' : 'Gym-Owner'));
      localStorage.setItem('flexora_user_name',  user?.name || user?.ownerName || 'مدير المنظومة');

      await Swal.fire({
        title: 'مرحباً بك 👋',
        text: loginMode === 'admin'
          ? 'تم دخول لوحة التحكم الإدارية بنجاح'
          : 'تم تسجيل دخولك بنجاح إلى منظومة فليكسورا',
        icon: 'success',
        timer: 1800,
        showConfirmButton: false,
      });

      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'بيانات الدخول غير صحيحة، يرجى المحاولة مجدداً';
      Swal.fire({
        title: 'فشل تسجيل الدخول',
        text: msg,
        icon: 'error',
        confirmButtonText: 'إعادة المحاولة',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        {/* الشعار */}
        <img
          src={LOGO_URL}
          alt="شعار فليكسورا"
          className="auth-logo"
          onError={(e) => { e.target.style.display = 'none'; }}
        />

        {/* تبديل وضع الدخول */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '24px',
          background: 'var(--color-bg-main)',
          padding: '6px',
          borderRadius: '10px',
          border: '1px solid var(--color-border)',
        }}>
          <button
            id="btn-mode-admin"
            type="button"
            onClick={() => setLoginMode('admin')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-primary)',
              fontSize: '0.82rem',
              fontWeight: 700,
              transition: 'all 0.2s ease',
              background: loginMode === 'admin'
                ? 'linear-gradient(135deg, var(--color-primary), #C0070F)'
                : 'transparent',
              color: loginMode === 'admin' ? '#fff' : 'var(--color-text-muted)',
              boxShadow: loginMode === 'admin' ? '0 4px 12px rgba(229,9,20,0.3)' : 'none',
            }}
          >
            <ShieldCheck size={15} />
            مدير المنظومة
          </button>
          <button
            id="btn-mode-gym"
            type="button"
            onClick={() => setLoginMode('gym')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-primary)',
              fontSize: '0.82rem',
              fontWeight: 700,
              transition: 'all 0.2s ease',
              background: loginMode === 'gym'
                ? 'linear-gradient(135deg, var(--color-primary), #C0070F)'
                : 'transparent',
              color: loginMode === 'gym' ? '#fff' : 'var(--color-text-muted)',
              boxShadow: loginMode === 'gym' ? '0 4px 12px rgba(229,9,20,0.3)' : 'none',
            }}
          >
            <Building2 size={15} />
            مالك الصالة
          </button>
        </div>

        {/* تلميح الوضع الحالي */}
        <div style={{
          padding: '10px 14px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '0.78rem',
          background: loginMode === 'admin'
            ? 'rgba(229,9,20,0.08)'
            : 'rgba(0,214,143,0.08)',
          border: `1px solid ${loginMode === 'admin' ? 'rgba(229,9,20,0.2)' : 'rgba(0,214,143,0.2)'}`,
          color: loginMode === 'admin' ? 'var(--color-primary)' : 'var(--color-success)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {loginMode === 'admin'
            ? <><ShieldCheck size={14} /> يستخدم مسار: <code style={{fontFamily:'monospace',background:'rgba(255,255,255,0.05)',padding:'1px 6px',borderRadius:'4px'}}>/admin/login</code></>
            : <><Building2 size={14} /> يستخدم مسار: <code style={{fontFamily:'monospace',background:'rgba(255,255,255,0.05)',padding:'1px 6px',borderRadius:'4px'}}>/user/login</code></>
          }
        </div>

        {/* العنوان */}
        <h1 className="auth-title" style={{ fontSize: '1.3rem' }}>
          {loginMode === 'admin' ? 'بوابة الدخول الإداري' : 'بوابة مالكي الصالات'}
        </h1>
        <p className="auth-subtitle">
          {loginMode === 'admin'
            ? 'أدخل بيانات Platform-Owner للوصول إلى المنظومة'
            : 'أدخل بيانات حساب صالتك الرياضية'}
        </p>

        {/* نموذج الدخول */}
        <form id="form-login" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              البريد الإلكتروني
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              className="form-input"
              placeholder={loginMode === 'admin' ? 'admin@flexora.io' : 'owner@gym.com'}
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              كلمة المرور
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                disabled={loading}
                style={{ paddingLeft: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', left: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: 'var(--color-text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center'
                }}
                aria-label={showPass ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading
              ? <><Loader2 size={18} /><span>جارٍ التحقق...</span></>
              : <><LogIn size={18} /><span>دخول المنظومة</span></>
            }
          </button>
        </form>

        {/* رابط التسجيل */}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          هل تريد تسجيل صالة جديدة؟{' '}
          <Link to="/register" className="auth-link">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  );
}
