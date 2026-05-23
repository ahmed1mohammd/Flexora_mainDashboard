// ============================================================
// صفحة إدارة المستخدمين (مُلاك الأندية وحصص الموظفين)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, Loader2, Building2, User, Mail, ShieldAlert, Edit2, Check, X, Tag } from 'lucide-react';
import Swal from 'sweetalert2';
import axiosClient from '../api/axiosClient';

// ── نافذة ملف الصالة (Gym Profile & Quota) ──────────────────
function GymProfileModal({ gymId, onClose, onRefresh }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // أرقام الحصص
  const [maxReceptionists, setMaxReceptionists] = useState(1);
  const [maxCoaches, setMaxCoaches] = useState(4);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/admin/gyms/${gymId}/profile`);
      const { gym, owners, staff } = response.data.data;
      setProfile({ gym, owners, staff });
      setMaxReceptionists(gym.maxReceptionists || 1);
      setMaxCoaches(gym.maxCoaches || 4);
    } catch (err) {
      Swal.fire('خطأ', 'تعذر جلب ملف الصالة', 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  }, [gymId, onClose]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveQuotas = async () => {
    setSaving(true);
    try {
      await axiosClient.put(`/admin/gyms/${gymId}/quota`, {
        maxReceptionists: Number(maxReceptionists),
        maxCoaches: Number(maxCoaches)
      });
      Swal.fire({ title: 'تم التحديث', text: 'تم تعديل الحصص المسموحة للصالة بنجاح', icon: 'success', timer: 1500, showConfirmButton: false });
      onRefresh();
      onClose();
    } catch (err) {
      Swal.fire('خطأ', err.response?.data?.message || 'تعذر تعديل الحصص', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card fade-in" style={{ maxWidth: '800px', width: '90%' }}>
        <div className="modal-header">
          <h2 className="modal-title d-flex align-center gap-8">
            <Building2 size={20} className="text-primary" />
            <span>ملف الصالة وتوزيع الموظفين</span>
          </h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Loader2 className="spinner text-primary" size={40} style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <p className="text-muted">جاري تحميل بيانات الصالة...</p>
          </div>
        ) : profile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* قسم ملاك الصالة */}
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', color: 'var(--color-text-light)' }}>
                مُلاك الصالة الرياضية
              </h3>
              <div className="plans-grid" style={{ gridTemplateColumns: '1fr', gap: '12px' }}>
                {profile.owners.map(owner => (
                  <div key={owner.id} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="user-avatar bg-primary" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={18} color="#fff" />
                    </div>
                    <div>
                      <div className="fw-bold">{owner.name}</div>
                      <div className="text-muted d-flex align-center gap-8" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                        <Mail size={12} /> {owner.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* قسم تعديل الحصص المسموحة */}
            <div className="glass-card" style={{ padding: '20px', border: '1px solid rgba(229,9,20,0.3)', background: 'rgba(229,9,20,0.02)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', color: 'var(--color-primary)' }}>
                تعديل الحصص المسموحة (Quotas)
              </h3>
              <div className="d-flex align-center gap-16" style={{ flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                  <label className="form-label">الحد الأقصى لموظفي الاستقبال</label>
                  <input 
                    type="number" min="0" className="form-input" 
                    value={maxReceptionists} 
                    onChange={e => setMaxReceptionists(e.target.value)} 
                  />
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                  <label className="form-label">الحد الأقصى للمدربين (Coaches)</label>
                  <input 
                    type="number" min="0" className="form-input" 
                    value={maxCoaches} 
                    onChange={e => setMaxCoaches(e.target.value)} 
                  />
                </div>
                <div style={{ flex: '0 0 auto', alignSelf: 'flex-end', marginBottom: '16px' }}>
                  <button className="btn btn-primary" onClick={handleSaveQuotas} disabled={saving}>
                    {saving ? <Loader2 size={16} className="spinner" /> : <Check size={16} />}
                    <span>حفظ الحصص</span>
                  </button>
                </div>
              </div>
            </div>

            {/* قسم الموظفين الحاليين */}
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', color: 'var(--color-text-light)' }}>
                الموظفين والمدربين الحاليين ({profile.staff.length})
              </h3>
              {profile.staff.length === 0 ? (
                <div className="text-muted" style={{ padding: '20px', textAlign: 'center', background: 'var(--color-bg-main)', borderRadius: '8px' }}>
                  لا يوجد موظفين أو مدربين مسجلين في هذه الصالة حالياً.
                </div>
              ) : (
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>الاسم</th>
                        <th>الدور</th>
                        <th>تاريخ التسجيل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.staff.map(emp => (
                        <tr key={emp.id}>
                          <td>
                            <div className="fw-bold">{emp.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>{emp.email}</div>
                          </td>
                          <td>
                            <span className="badge" style={{ background: emp.role === 'Coach' ? 'rgba(0,214,143,0.1)' : 'rgba(255,160,0,0.1)', color: emp.role === 'Coach' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                              {emp.role === 'Coach' ? 'مدرب (Coach)' : 'استقبال (Receptionist)'}
                            </span>
                          </td>
                          <td className="text-muted">{new Date(emp.createdAt).toLocaleDateString('ar-EG')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
}

// ── المكون الرئيسي (UsersPage) ──────────────────────────────
export default function UsersPage() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGymId, setSelectedGymId] = useState(null);

  const fetchGyms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/admin/gyms');
      setGyms(response.data.data.gyms || []);
    } catch (err) {
      console.error(err);
      Swal.fire('خطأ', 'فشل جلب قائمة الأندية', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGyms();
  }, [fetchGyms]);

  const filteredGyms = gyms.filter(gym => 
    gym.name.toLowerCase().includes(search.toLowerCase()) || 
    gym.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper fade-in">
      <div className="page-header d-flex align-center justify-between">
        <div>
          <h1 className="page-title d-flex align-center gap-12">
            <Users size={28} className="text-primary" />
            <span>إدارة <span>مستخدمي الصالات</span></span>
          </h1>
          <p className="page-subtitle" style={{ marginTop: '4px' }}>
            تصفح مُلاك الصالات وعدل حصص موظفي الاستقبال والمدربين لكل صالة.
          </p>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} className="text-muted" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="form-input w-full" 
            placeholder="ابحث باسم الصالة أو المالك..."
            style={{ paddingRight: '36px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '80px', textAlign: 'center' }}>
          <Loader2 className="spinner text-primary" size={40} style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <p className="text-muted">جاري تحميل البيانات...</p>
        </div>
      ) : filteredGyms.length === 0 ? (
        <div className="empty-state slide-in" style={{ marginTop: '40px' }}>
          <div className="empty-state-icon"><ShieldAlert size={64} /></div>
          <h3>لا توجد صالات رياضية</h3>
          <p>لم يتم العثور على أي صالة مطابقة لبحثك أو لا توجد صالات مسجلة.</p>
        </div>
      ) : (
        <div className="plans-grid slide-in">
          {filteredGyms.map(gym => (
            <div key={gym.id} className="glass-card plan-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <div className="d-flex align-center justify-between mb-16">
                <div className="d-flex align-center gap-12">
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'var(--color-primary-dim)', border: '1px solid rgba(229,9,20,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Building2 size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="fw-bold" style={{ fontSize: '1.05rem' }}>{gym.name}</h3>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>المالك: {gym.ownerName}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Tag size={12} /> {gym.maxReceptionists} موظف استقبال
                </span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Tag size={12} /> {gym.maxCoaches} مدربين
                </span>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <button 
                  className="btn btn-ghost w-full"
                  style={{ justifyContent: 'center' }}
                  onClick={() => setSelectedGymId(gym.id)}
                >
                  <Edit2 size={14} />
                  <span>تعديل الحصص واستعراض الموظفين</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedGymId && (
        <GymProfileModal 
          gymId={selectedGymId} 
          onClose={() => setSelectedGymId(null)} 
          onRefresh={fetchGyms}
        />
      )}
    </div>
  );
}
