// ============================================================
// صفحة تسجيل الصالة الجديدة — POST /user/register
// نموذج 6 حقول لتسجيل الصالات الرياضية في المنظومة
// ============================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import axiosClient from '../api/axiosClient';

const LOGO_URL = 'https://i.ibb.co/qF44zwks/logo1-1.png';

const INITIAL_FORM = {
  name:        '',
  ownerName:   '',
  email:       '',
  phoneNumber: '',
  password:    '',
  address:     '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── معالج التسجيل (POST /user/register) ──────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ['name', 'ownerName', 'email', 'phoneNumber', 'password', 'address'];
    const isEmpty = requiredFields.some((f) => !form[f].trim());
    if (isEmpty) {
      Swal.fire({
        title: 'بيانات غير مكتملة',
        text: 'يرجى تعبئة جميع الحقول المطلوبة قبل إرسال الطلب',
        icon: 'warning',
        confirmButtonText: 'حسناً',
      });
      return;
    }

    if (form.password.length < 8) {
      Swal.fire({
        title: 'كلمة مرور ضعيفة',
        text: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل',
        icon: 'warning',
        confirmButtonText: 'حسناً',
      });
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/user/register', {
        gymName:     form.name.trim(),   // الباك اند يتوقع gymName وليس name
        ownerName:   form.ownerName.trim(),
        email:       form.email.trim().toLowerCase(),
        phoneNumber: form.phoneNumber.trim(),
        password:    form.password,
        address:     form.address.trim(),
      });

      await Swal.fire({
        title: 'تم تقديم الطلب بنجاح ✓',
        html: `
          <p>تم تسجيل صالة <strong>${form.name}</strong> في منظومة فليكسورا بنجاح.</p>
          <p style="margin-top:8px;color:#8A8A8A;font-size:0.85rem">سيتم مراجعة الطلب من قِبل فريق الإدارة وتفعيل الحساب قريباً.</p>
        `,
        icon: 'success',
        confirmButtonText: 'العودة لتسجيل الدخول',
      });

      navigate('/login');
    } catch (error) {
      const msg = error.response?.data?.message || 'حدث خطأ أثناء تسجيل الصالة';
      Swal.fire({
        title: 'فشل التسجيل',
        text: msg,
        icon: 'error',
        confirmButtonText: 'حسناً',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in" style={{ maxWidth: '560px' }}>
        {/* الشعار */}
        <img
          src={LOGO_URL}
          alt="شعار فليكسورا"
          className="auth-logo"
          onError={(e) => { e.target.style.display = 'none'; }}
        />

        {/* العنوان */}
        <h1 className="auth-title">تسجيل صالة رياضية جديدة</h1>
        <p className="auth-subtitle">
          أدخل بيانات صالتك الرياضية للانضمام إلى منظومة فليكسورا
        </p>

        {/* نموذج التسجيل */}
        <form id="form-register" onSubmit={handleSubmit} noValidate>
          {/* الصف الأول: اسم الصالة + اسم المالك */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">اسم الصالة الرياضية</label>
              <input
                id="reg-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="مثال: فليكسورا جيم"
                value={form.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-owner">اسم المالك</label>
              <input
                id="reg-owner"
                name="ownerName"
                type="text"
                className="form-input"
                placeholder="الاسم الكامل"
                value={form.ownerName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* الصف الثاني: البريد + رقم الهاتف */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">البريد الإلكتروني</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="gym@example.com"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ direction: 'ltr', textAlign: 'right' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">رقم الهاتف</label>
              <input
                id="reg-phone"
                name="phoneNumber"
                type="tel"
                className="form-input"
                placeholder="01xxxxxxxxx"
                value={form.phoneNumber}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ direction: 'ltr', textAlign: 'right' }}
              />
            </div>
          </div>

          {/* كلمة المرور */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">كلمة المرور</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="8 أحرف على الأقل"
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {/* العنوان */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-address">عنوان الصالة</label>
            <input
              id="reg-address"
              name="address"
              type="text"
              className="form-input"
              placeholder="المحافظة، المنطقة، الشارع"
              value={form.address}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button
            id="btn-register-submit"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading
              ? <><Loader2 size={18} className="animate-spin" /><span>جارٍ الإرسال...</span></>
              : <><UserPlus size={18} /><span>تسجيل الصالة الرياضية</span></>
            }
          </button>
        </form>

        {/* رابط الدخول */}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          لديك حساب مسبق؟{' '}
          <Link to="/login" className="auth-link">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}
