// ============================================================
// صفحة إدارة فريق العمل والصلاحيات — TeamPage.jsx
// مخصصة لمدير المنظومة (Platform-Owner) فقط
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Plus, Trash2, Mail, User, ShieldAlert, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import axiosClient from '../api/axiosClient';

export default function TeamPage() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Platform-Manager' // Default role
  });

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/admin/team');
      setTeam(response.data.data.team || []);
    } catch (error) {
      console.error('Error fetching team:', error);
      Swal.fire('خطأ', 'تعذر جلب بيانات الفريق', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await axiosClient.post('/admin/team', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'Platform-Manager' });
      Swal.fire({
        title: 'تم بنجاح',
        text: 'تمت إضافة المدير الجديد بنجاح',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      fetchTeam();
    } catch (error) {
      Swal.fire('فشل في الإضافة', error.response?.data?.message || 'حدث خطأ غير متوقع', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'تأكيد الحذف',
      text: `هل أنت متأكد من حذف حساب "${name}"؟ لا يمكن التراجع عن هذا الإجراء.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#C0070F'
    });

    if (result.isConfirmed) {
      try {
        await axiosClient.delete(`/admin/team/${id}`);
        Swal.fire({ title: 'تم الحذف', icon: 'success', timer: 1500, showConfirmButton: false });
        fetchTeam();
      } catch (error) {
        Swal.fire('خطأ', error.response?.data?.message || 'تعذر حذف الحساب', 'error');
      }
    }
  };

  return (
    <div className="page-wrapper fade-in">
      {/* ─── رأس الصفحة ──────────────────────────────────────── */}
      <div className="page-header d-flex align-center justify-between">
        <div>
          <h1 className="page-title d-flex align-center" style={{ gap: '10px' }}>
            <ShieldCheck size={28} className="text-primary" />
            <span>إدارة <span>الصلاحيات</span></span>
          </h1>
          <p className="page-subtitle" style={{ marginTop: '4px' }}>
            أضف مديرين لمساعدتك في إدارة المنظومة (الصلاحيات المالية محجوبة عن المساعدين).
          </p>
        </div>
        <button id="btn-add-team" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          <span>إضافة مدير</span>
        </button>
      </div>

      {/* ─── قائمة الفريق ────────────────────────────────────── */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <Loader2 className="spinner text-primary" size={40} style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <p className="text-muted">جاري تحميل بيانات الفريق...</p>
        </div>
      ) : team.length === 0 ? (
        <div className="empty-state slide-in" style={{ marginTop: '40px' }}>
          <div className="empty-state-icon"><ShieldAlert size={64} /></div>
          <h3>لا يوجد مديرين آخرين</h3>
          <p>قم بإضافة مساعدين لإدارة الأندية الرياضية ومتابعة التشغيل.</p>
        </div>
      ) : (
        <div className="plans-grid slide-in" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {team.map((member) => (
            <div key={member.id} className="glass-card plan-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div className="d-flex align-center justify-between mb-16">
                <div className="d-flex align-center gap-12">
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                    background: member.role === 'Platform-Owner' ? 'var(--color-primary-dim)' : 'rgba(0,214,143,0.1)',
                    border: `1px solid ${member.role === 'Platform-Owner' ? 'rgba(229,9,20,0.2)' : 'rgba(0,214,143,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: member.role === 'Platform-Owner' ? 'var(--color-primary)' : 'var(--color-success)',
                  }}>
                    <User size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text-light)' }}>
                      {member.name}
                    </h3>
                    <div className="text-muted d-flex align-center gap-8" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                      <Mail size={12} />
                      <span>{member.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: member.role === 'Platform-Owner' ? 'rgba(229,9,20,0.1)' : 'rgba(0,214,143,0.1)',
                  color: member.role === 'Platform-Owner' ? 'var(--color-primary)' : 'var(--color-success)',
                  border: `1px solid ${member.role === 'Platform-Owner' ? 'rgba(229,9,20,0.2)' : 'rgba(0,214,143,0.2)'}`
                }}>
                  {member.role === 'Platform-Owner' ? 'مدير عام المنظومة (صلاحية مطلقة)' : 'مدير مساعد (مبيعات / تشغيل)'}
                </div>
              </div>

              {localStorage.getItem('flexora_user_name') !== member.name && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--color-danger)' }}
                    onClick={() => handleDelete(member.id, member.name)}
                    title="حذف الحساب"
                  >
                    <Trash2 size={16} />
                    <span>حذف الحساب</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── Modal إضافة مدير ────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-card fade-in">
            <div className="modal-header">
              <h2 className="modal-title d-flex align-center gap-8">
                <Plus size={18} className="text-primary" />
                <span>إضافة عضو فريق جديد</span>
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <Trash2 size={18} style={{ display: 'none' }} /> {/* Just to keep spacing uniform, actual X is rendered by CSS but let's just use text/X */}
                <span>✕</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">الاسم بالكامل</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name} 
                  onChange={handleChange}
                  className="form-input"
                  placeholder="مثال: أحمد عبد الله"
                  required 
                  disabled={formLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">البريد الإلكتروني للدخول</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email} 
                  onChange={handleChange}
                  className="form-input"
                  placeholder="manager@flexora.com"
                  required 
                  disabled={formLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">كلمة المرور</label>
                <input 
                  type="text" 
                  name="password"
                  value={formData.password} 
                  onChange={handleChange}
                  className="form-input"
                  placeholder="كلمة مرور قوية للمدير"
                  required 
                  disabled={formLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">مستوى الصلاحية</label>
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-input"
                  disabled={formLoading}
                >
                  <option value="Platform-Manager">مدير مساعد (مبيعات وتشغيل الأندية)</option>
                  <option value="Platform-Owner">مدير عام المنظومة (صلاحية كاملة وإيرادات)</option>
                </select>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '6px' }}>
                  * المدير المساعد لا يمكنه رؤية الإيرادات المالية أو مسح وتعديل خطط الأسعار.
                </div>
              </div>

              <div className="d-flex align-center gap-12" style={{ marginTop: '24px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)} disabled={formLoading}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? (
                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /><span>جارٍ الإضافة...</span></>
                  ) : (
                    <><Plus size={16} /><span>إضافة المدير</span></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
