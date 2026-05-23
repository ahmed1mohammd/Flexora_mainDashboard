// ============================================================
// مكوّن شبكة خطط الاشتراك — PlansGrid
// CRUD كامل: عرض + إضافة + تعديل + حذف + الفيتشرز
// ============================================================

import { useState } from 'react';
import { Plus, Tag, Clock, Loader2, Pencil, Trash2, X, Check } from 'lucide-react';
import Swal from 'sweetalert2';
import axiosClient from '../api/axiosClient';

// ── نموذج خطة فارغ ────────────────────────────────────────
const EMPTY_FORM = {
  planName:       '',
  durationInDays: '',
  price:          '',
  description:    '',
  featuresText:   '', // كل سطر = ميزة واحدة
};

// ── استخراج الفيتشرز بمرونة ───────────────────────────────
const getFeatures = (plan) => {
  if (Array.isArray(plan.features)) return plan.features.filter(Boolean);
  if (typeof plan.features === 'string' && plan.features.trim())
    return plan.features.split('\n').map((f) => f.trim()).filter(Boolean);
  return [];
};

// ── مكوّن Modal موحد للإضافة والتعديل ─────────────────────
function PlanModal({ mode, plan, onClose, onSave, loading }) {
  const [form, setForm] = useState(
    mode === 'edit' && plan
      ? {
          planName:       plan.planName || plan.name || '',
          durationInDays: String(plan.durationInDays || ''),
          price:          String(plan.price || ''),
          description:    plan.description || '',
          featuresText:   getFeatures(plan).join('\n'),
        }
      : EMPTY_FORM
  );

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.planName || !form.durationInDays || !form.price) {
      Swal.fire({ title: 'حقول مطلوبة', text: 'يرجى تعبئة الاسم والمدة والسعر', icon: 'warning', confirmButtonText: 'حسناً' });
      return;
    }
    const features = form.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    onSave({
      planName:       form.planName.trim(),
      durationInDays: Number(form.durationInDays),
      price:          Number(form.price),
      description:    form.description.trim(),
      features,
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card">
        {/* رأس الـ Modal */}
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'edit' ? `تعديل خطة: ${plan?.planName || plan?.name}` : 'إضافة خطة اشتراك جديدة'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="إغلاق">
            <X size={18} />
          </button>
        </div>

        {/* نموذج البيانات */}
        <form onSubmit={handleSubmit}>
          {/* الصف الأول */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="modal-plan-name">اسم الخطة *</label>
              <input
                id="modal-plan-name"
                name="planName"
                type="text"
                className="form-input"
                placeholder="مثال: الباقة الذهبية"
                value={form.planName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="modal-plan-desc">وصف مختصر</label>
              <input
                id="modal-plan-desc"
                name="description"
                type="text"
                className="form-input"
                placeholder="وصف الخطة (اختياري)"
                value={form.description}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* الصف الثاني */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="modal-plan-duration">المدة (بالأيام) *</label>
              <input
                id="modal-plan-duration"
                name="durationInDays"
                type="number"
                min="1"
                className="form-input"
                placeholder="مثال: 30"
                value={form.durationInDays}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="modal-plan-price">السعر (جنيه) *</label>
              <input
                id="modal-plan-price"
                name="price"
                type="number"
                min="0"
                className="form-input"
                placeholder="مثال: 500"
                value={form.price}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* حقل الفيتشرز */}
          <div className="form-group">
            <label className="form-label" htmlFor="modal-plan-features">
              مميزات الخطة
              <span style={{ fontWeight: 400, color: 'var(--color-text-dim)', marginRight: '6px' }}>
                (كل ميزة في سطر مستقل)
              </span>
            </label>
            <textarea
              id="modal-plan-features"
              name="featuresText"
              className="form-input"
              rows={5}
              placeholder={'مثال:\nأتمتة ملفات الأعضاء\nتوليد كود QR\nلوحة تقارير مالية'}
              value={form.featuresText}
              onChange={handleChange}
              disabled={loading}
              style={{ resize: 'vertical', lineHeight: 1.8, fontFamily: 'var(--font-primary)' }}
            />
            {/* معاينة الفيتشرز */}
            {form.featuresText.trim() && (
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {form.featuresText.split('\n').filter(f => f.trim()).map((f, i) => (
                  <span key={i} style={{
                    padding: '3px 10px',
                    background: 'var(--color-primary-dim)',
                    border: '1px solid rgba(229,9,20,0.25)',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    color: 'var(--color-primary)',
                  }}>
                    {f.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* أزرار الحفظ */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              إلغاء
            </button>
            <button
              id={mode === 'edit' ? 'btn-save-plan-edit' : 'btn-save-plan-new'}
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? <><Loader2 size={16} /><span>جارٍ الحفظ...</span></>
                : <><Check size={16} /><span>{mode === 'edit' ? 'حفظ التعديلات' : 'إضافة الخطة'}</span></>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── المكوّن الرئيسي ────────────────────────────────────────
export default function PlansGrid({ plans, loading, onRefresh }) {
  const [modal, setModal]         = useState(null); // null | { mode: 'add'|'edit', plan? }
  const [submitting, setSubmitting] = useState(false);
  const userRole = localStorage.getItem('flexora_user_role');

  // ── إضافة خطة (POST /admin/saas-plans) ───────────────────
  const handleAdd = async (data) => {
    setSubmitting(true);
    try {
      await axiosClient.post('/admin/saas-plans', data);
      await Swal.fire({ title: 'تمت الإضافة ✓', text: `خطة "${data.planName}" أُضيفت بنجاح`, icon: 'success', confirmButtonText: 'ممتاز' });
      setModal(null);
      onRefresh?.();
    } catch (err) {
      Swal.fire({ title: 'خطأ', text: err.response?.data?.message || 'حدث خطأ أثناء الإضافة', icon: 'error', confirmButtonText: 'حسناً' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── تعديل خطة (PUT /admin/saas-plans/:id) ────────────────
  const handleEdit = async (data) => {
    const planId = modal.plan._id || modal.plan.id;
    setSubmitting(true);
    try {
      await axiosClient.put(`/admin/saas-plans/${planId}`, data);
      await Swal.fire({ title: 'تم التعديل ✓', text: `تم تحديث خطة "${data.planName}" بنجاح`, icon: 'success', confirmButtonText: 'ممتاز' });
      setModal(null);
      onRefresh?.();
    } catch (err) {
      Swal.fire({ title: 'خطأ', text: err.response?.data?.message || 'حدث خطأ أثناء التعديل', icon: 'error', confirmButtonText: 'حسناً' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── حذف خطة (DELETE /admin/saas-plans/:id) ───────────────
  const handleDelete = async (plan) => {
    const result = await Swal.fire({
      title: 'حذف الخطة نهائياً؟',
      html: `سيتم حذف خطة <strong>"${plan.planName || plan.name}"</strong> بشكل لا رجعة فيه.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
    });
    if (!result.isConfirmed) return;

    const planId = plan._id || plan.id;
    try {
      await axiosClient.delete(`/admin/saas-plans/${planId}`);
      await Swal.fire({ title: 'تم الحذف', icon: 'success', timer: 1500, showConfirmButton: false });
      onRefresh?.();
    } catch (err) {
      Swal.fire({ title: 'خطأ', text: err.response?.data?.message || 'حدث خطأ أثناء الحذف', icon: 'error', confirmButtonText: 'حسناً' });
    }
  };

  return (
    <div>
      {/* ─── رأس القسم ──────────────────────────────────────── */}
      <div className="d-flex align-center justify-between mb-24">
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>خطط الاشتراك المتاحة</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            {plans?.length || 0} خطة مسجلة في المنظومة
          </p>
        </div>
        {userRole === 'Platform-Owner' && (
          <button id="btn-add-plan" className="btn btn-primary" onClick={() => setModal({ mode: 'add' })}>
            <Plus size={16} />
            <span>إضافة خطة جديدة</span>
          </button>
        )}
      </div>

      {/* ─── Modal الإضافة / التعديل ─────────────────────────── */}
      {modal && (
        <PlanModal
          mode={modal.mode}
          plan={modal.plan}
          loading={submitting}
          onClose={() => setModal(null)}
          onSave={modal.mode === 'edit' ? handleEdit : handleAdd}
        />
      )}

      {/* ─── شبكة البطاقات ──────────────────────────────────── */}
      <div className="plans-grid">

        {/* Skeleton Loading */}
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="plan-card">
            <div className="skeleton" style={{ height: '38px', width: '55%', borderRadius: '8px', marginBottom: '16px' }} />
            <div className="skeleton" style={{ height: '42px', width: '45%', borderRadius: '8px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ height: '18px', width: '60%', borderRadius: '6px', marginBottom: '20px' }} />
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[85, 70, 90, 65].map((w, j) => (
                <div key={j} className="skeleton" style={{ height: '13px', width: `${w}%`, borderRadius: '6px' }} />
              ))}
            </div>
          </div>
        ))}

        {/* حالة فراغ */}
        {!loading && (plans || []).length === 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state">
              <div className="empty-state-icon"><Tag size={64} /></div>
              <h3>لا توجد خطط مسجلة</h3>
              <p>أضف أول خطة اشتراك لمنظومة فليكسورا</p>
            </div>
          </div>
        )}

        {/* بطاقات الخطط */}
        {!loading && (plans || []).map((plan, index) => {
          const features = getFeatures(plan);
          return (
            <article
              key={plan._id || plan.id || index}
              className={`plan-card slide-in ${index === 1 ? 'featured' : ''}`}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              {/* ── رأس البطاقة: الاسم + أزرار الإجراءات ── */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                  background: 'var(--color-primary-dim)',
                  border: '1px solid rgba(229,9,20,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Tag size={16} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="plan-name" style={{ lineHeight: 1.3 }}>
                    {plan.planName || plan.name}
                  </div>
                  {plan.description && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '3px' }}>
                      {plan.description}
                    </div>
                  )}
                </div>
                {/* أزرار التعديل والحذف */}
                {userRole === 'Platform-Owner' && (
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      id={`btn-edit-plan-${plan._id || plan.id}`}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '6px', borderRadius: '8px' }}
                      onClick={() => setModal({ mode: 'edit', plan })}
                      title="تعديل الخطة"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      id={`btn-delete-plan-${plan._id || plan.id}`}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '6px', borderRadius: '8px' }}
                      onClick={() => handleDelete(plan)}
                      title="حذف الخطة"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* ── السعر ── */}
              <div className="plan-price">
                {Number(plan.price).toLocaleString('ar-EG')}
                <span> جنيه</span>
              </div>

              {/* ── المدة + تكلفة شهرية ── */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                marginBottom: '20px',
                fontSize: '0.85rem', color: 'var(--color-text-muted)',
              }}>
                <Clock size={14} />
                <span>{plan.durationInDays} يوم</span>
                <span style={{
                  marginRight: 'auto', padding: '2px 8px',
                  background: 'var(--color-bg-main)', borderRadius: '20px',
                  fontSize: '0.72rem', color: 'var(--color-text-dim)',
                  border: '1px solid var(--color-border)',
                }}>
                  ≈ {(plan.price / (plan.durationInDays / 30)).toFixed(0)} ج/شهر
                </span>
              </div>

              {/* ── قائمة الفيتشرز ── */}
              <div style={{ paddingTop: '16px', borderTop: '1px solid var(--color-border)', flex: 1 }}>
                {features.length > 0 ? (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {features.map((feature, fi) => (
                      <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{
                          width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                          background: 'var(--color-primary-dim)',
                          border: '1px solid rgba(229,9,20,0.35)',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          marginTop: '2px',
                        }}>
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1.5 4L3.5 6.5L8.5 1.5" stroke="#E50914" strokeWidth="1.6"
                              strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : userRole === 'Platform-Owner' ? (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'center', opacity: 0.6 }}
                    onClick={() => setModal({ mode: 'edit', plan })}
                  >
                    <Plus size={13} />
                    <span>إضافة مميزات للخطة</span>
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--color-text-dim)', fontSize: '0.8rem', opacity: 0.6 }}>
                    لم يتم تحديد مميزات
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
