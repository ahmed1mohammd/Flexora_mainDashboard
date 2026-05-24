// ============================================================
// مكوّن جدول الصالات الرياضية — GymTable
// يعرض قائمة الصالات مع أزرار: تفعيل / تجميد / تعليق
// ============================================================

import { useState } from 'react';
import { CheckCircle, Snowflake, Ban, Search, RefreshCw, Printer, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import axiosClient from '../api/axiosClient';

const STATUS_MAP = {
  active:    { label: 'نشط',       cls: 'badge-active'    },
  pending:   { label: 'معلق',      cls: 'badge-pending'   },
  freeze:    { label: 'مجمد',      cls: 'badge-frozen'    },
  suspended: { label: 'موقوف',     cls: 'badge-suspended' },
  // دعم القيم القديمة (Uppercase) للتوافق الخلفي
  ACTIVE:    { label: 'نشط',       cls: 'badge-active'    },
  PENDING:   { label: 'معلق',      cls: 'badge-pending'   },
  FROZEN:    { label: 'مجمد',      cls: 'badge-frozen'    },
  SUSPENDED: { label: 'موقوف',     cls: 'badge-suspended' },
};

export default function GymTable({ gyms, loading, onRefresh, onPrint }) {
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const filtered = (gyms || []).filter((g) =>
    g.name?.includes(search) ||
    g.ownerName?.includes(search) ||
    g.email?.includes(search) ||
    g.phoneNumber?.includes(search)
  );

  // ── تفعيل الصالة ──────────────────────────────────────────
  const handleActivate = async (gym) => {
    let plans = [];
    try {
      const response = await axiosClient.get('/admin/saas-plans');
      plans = response.data?.data?.plans || response.data?.plans || [];
    } catch (e) {
      console.error('Failed to fetch plans', e);
    }

    const plansOptions = plans.map(p => 
      `<option value="${p.id}" ${gym.planId === p.id ? 'selected' : ''}>${p.planName} (${p.price} ج.م / ${p.durationInDays} يوم)</option>`
    ).join('');

    const { value: formValues } = await Swal.fire({
      title: `تفعيل صالة: ${gym.name}`,
      background: '#1A1A1A',
      color: '#F5F5F5',
      confirmButtonColor: '#E50914',
      cancelButtonColor: '#333',
      html: `
        <div style="display:flex;flex-direction:column;gap:12px;text-align:right" dir="rtl">
          <div>
            <label style="font-size:0.8rem;color:#8A8A8A;display:block;margin-bottom:4px">اختر باقة الاشتراك السحابي *</label>
            <select id="swal-plan-id" class="swal2-input" style="margin:0;width:100%;text-align:right;background:#111;color:#fff;border:1px solid #333;border-radius:8px">
              <option value="">-- تفعيل باقة مخصصة يدوياً --</option>
              ${plansOptions}
            </select>
          </div>
          <div id="manual-fields-container" style="display:flex;flex-direction:column;gap:12px">
            <div>
              <label style="font-size:0.8rem;color:#8A8A8A;display:block;margin-bottom:4px">مدة الاشتراك (بالأشهر)</label>
              <input id="swal-duration" type="number" min="1" value="1"
                class="swal2-input" style="margin:0;width:100%;text-align:right;background:#111;color:#fff;border:1px solid #333;border-radius:8px" placeholder="مثال: 3">
            </div>
            <div>
              <label style="font-size:0.8rem;color:#8A8A8A;display:block;margin-bottom:4px">السعر المدفوع (جنيه)</label>
              <input id="swal-price" type="number" min="0" value="500"
                class="swal2-input" style="margin:0;width:100%;text-align:right;background:#111;color:#fff;border:1px solid #333;border-radius:8px" placeholder="مثال: 500">
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'تفعيل الآن',
      cancelButtonText: 'إلغاء',
      focusConfirm: false,
      didOpen: () => {
        const select = document.getElementById('swal-plan-id');
        const manualContainer = document.getElementById('manual-fields-container');
        if (select && manualContainer) {
          select.addEventListener('change', () => {
            if (select.value) {
              manualContainer.style.display = 'none';
            } else {
              manualContainer.style.display = 'flex';
            }
          });
          // Initial state
          if (select.value) {
            manualContainer.style.display = 'none';
          }
        }
      },
      preConfirm: () => {
        const planId   = document.getElementById('swal-plan-id').value;
        const duration = document.getElementById('swal-duration').value;
        const price    = document.getElementById('swal-price').value;
        
        if (planId) {
          return { planId };
        }
        
        if (!duration || !price) {
          Swal.showValidationMessage('يرجى اختيار باقة أو إدخال المدة والسعر يدوياً');
          return false;
        }
        
        return {
          durationInMonths: Number(duration),
          price: Number(price)
        };
      }
    });

    if (!formValues) return;

    setActionLoading(gym.id);
    try {
      await axiosClient.put(`/admin/gyms/${gym.id}/activate`, formValues);
      await Swal.fire({
        title: 'تم التفعيل بنجاح',
        text: `تم تفعيل صالة "${gym.name}" بنجاح`,
        icon: 'success',
        confirmButtonText: 'ممتاز',
        background: '#1A1A1A',
        color: '#F5F5F5',
        confirmButtonColor: '#E50914'
      });
      onRefresh?.();
    } catch (error) {
      Swal.fire({
        title: 'خطأ في التفعيل',
        text: error.response?.data?.message || 'حدث خطأ غير متوقع أثناء التفعيل',
        icon: 'error',
        confirmButtonText: 'حسناً',
        background: '#1A1A1A',
        color: '#F5F5F5',
        confirmButtonColor: '#E50914'
      });
    } finally {
      setActionLoading(null);
    }
  };

  // ── تجميد الصالة ──────────────────────────────────────────
  const handleFreeze = async (gym) => {
    const result = await Swal.fire({
      title: 'تجميد حساب الصالة',
      text: `هل تؤكد تجميد حساب صالة "${gym.name}"؟ سيتم تغيير حالتها إلى FROZEN.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، تجميد',
      cancelButtonText: 'إلغاء',
    });

    if (!result.isConfirmed) return;

    setActionLoading(gym.id);
    try {
      await axiosClient.put(`/admin/gyms/${gym.id}/freeze`);
      await Swal.fire({
        title: 'تم التجميد',
        text: `تم تجميد حساب صالة "${gym.name}"`,
        icon: 'info',
        confirmButtonText: 'حسناً',
      });
      onRefresh?.();
    } catch (error) {
      Swal.fire({
        title: 'خطأ في التجميد',
        text: error.response?.data?.message || 'حدث خطأ أثناء تجميد الحساب',
        icon: 'error',
        confirmButtonText: 'حسناً',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // ── تعليق الصالة ──────────────────────────────────────────
  const handleSuspend = async (gym) => {
    const result = await Swal.fire({
      title: 'تعليق حساب الصالة',
      text: `هل تؤكد التعليق الكامل لحساب صالة "${gym.name}"؟ سيتم تفعيل بروتوكول القفل الإداري.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'نعم، تعليق كامل',
      cancelButtonText: 'إلغاء',
    });

    if (!result.isConfirmed) return;

    setActionLoading(gym.id);
    try {
      await axiosClient.put(`/admin/gyms/${gym.id}/suspend`);
      await Swal.fire({
        title: 'تم التعليق',
        text: `تم تعليق حساب صالة "${gym.name}" بالكامل`,
        icon: 'success',
        confirmButtonText: 'حسناً',
      });
      onRefresh?.();
    } catch (error) {
      Swal.fire({
        title: 'خطأ في التعليق',
        text: error.response?.data?.message || 'حدث خطأ أثناء تعليق الحساب',
        icon: 'error',
        confirmButtonText: 'حسناً',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // ── حذف الصالة نهائياً ─────────────────────────────────────
  const handleDelete = async (gym) => {
    const result = await Swal.fire({
      title: 'حذف الصالة نهائياً؟',
      html: `هل تؤكد حذف صالة <strong>"${gym.name}"</strong> بالكامل؟<br/><span style="color:var(--color-danger);font-size:0.8rem;display:block;margin-top:8px">تنبيه: سيتم مسح المالك والموظفين واللاعبين وكود الـ QR وكل السجلات المالية نهائياً ولا يمكن التراجع!</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف نهائياً',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#333',
      background: '#1A1A1A',
      color: '#F5F5F5',
    });

    if (!result.isConfirmed) return;

    setActionLoading(gym.id);
    try {
      await axiosClient.delete(`/admin/gyms/${gym.id}`);
      await Swal.fire({
        title: 'تم الحذف بنجاح',
        text: `تم حذف صالة "${gym.name}" وكل بياناتها من النظام.`,
        icon: 'success',
        confirmButtonText: 'حسناً',
        background: '#1A1A1A',
        color: '#F5F5F5',
        confirmButtonColor: '#E50914'
      });
      onRefresh?.();
    } catch (error) {
      Swal.fire({
        title: 'خطأ في الحذف',
        text: error.response?.data?.message || 'حدث خطأ أثناء محاولة حذف الصالة',
        icon: 'error',
        confirmButtonText: 'حسناً',
        background: '#1A1A1A',
        color: '#F5F5F5',
        confirmButtonColor: '#E50914'
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* شريط البحث والتحكم */}
      <div className="d-flex align-center justify-between mb-16">
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute', right: '14px', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--color-text-muted)'
            }}
          />
          <input
            id="gym-search-input"
            type="text"
            className="form-input"
            placeholder="البحث بالاسم أو البريد أو الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingRight: '40px' }}
          />
        </div>
        <button
          id="btn-refresh-gyms"
          className="btn btn-ghost"
          onClick={onRefresh}
          disabled={loading}
          title="تحديث القائمة"
        >
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
          <span>تحديث</span>
        </button>
      </div>

      {/* جدول البيانات */}
      <div className="data-table-wrap">
        <table className="data-table" role="table" aria-label="جدول الصالات الرياضية">
          <thead>
            <tr>
              <th scope="col">اسم الصالة</th>
              <th scope="col">المالك</th>
              <th scope="col">البريد الإلكتروني</th>
              <th scope="col">رقم الهاتف</th>
              <th scope="col">الباقة الحالية</th>
              <th scope="col">تاريخ الانتهاء</th>
              <th scope="col">الحالة</th>
              <th scope="col">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j}>
                      <div className="skeleton skeleton-text" style={{ height: '14px', width: '80%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Search size={64} />
                    </div>
                    <h3>لا توجد صالات مسجلة</h3>
                    <p>لم يتم العثور على صالات رياضية مطابقة للبحث</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((gym) => {
                const status = STATUS_MAP[gym.status] || { label: gym.status, cls: 'badge-pending' };
                const isLoading = actionLoading === gym.id;
                return (
                  <tr key={gym.id}>
                    <td style={{ fontWeight: 600 }}>{gym.name}</td>
                    <td>{gym.ownerName}</td>
                    <td style={{ direction: 'ltr', textAlign: 'right' }}>{gym.email}</td>
                    <td style={{ direction: 'ltr', textAlign: 'right' }}>{gym.phoneNumber}</td>
                    <td>
                      {gym.planName ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{gym.planName}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-dim)' }}>{gym.planPrice} ج.م</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-dim)', fontSize: '0.8rem' }}>بدون باقة</span>
                      )}
                    </td>
                    <td>
                      {gym.subscriptionEnd
                        ? new Date(gym.subscriptionEnd).toLocaleDateString('ar-EG')
                        : '—'
                      }
                    </td>
                    <td>
                      <span className={`badge ${status.cls}`}>
                        <span className="badge-dot" />
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {isLoading ? (
                          <span className="spinner" />
                        ) : (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleActivate(gym)}
                              title="تفعيل الصالة"
                              id={`btn-activate-${gym.id}`}
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              className="btn btn-freeze btn-sm"
                              onClick={() => handleFreeze(gym)}
                              title="تجميد الصالة"
                              id={`btn-freeze-${gym.id}`}
                            >
                              <Snowflake size={14} />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleSuspend(gym)}
                              title="تعليق الصالة"
                              id={`btn-suspend-${gym.id}`}
                            >
                              <Ban size={14} />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(gym)}
                              title="حذف الصالة نهائياً"
                              id={`btn-delete-${gym.id}`}
                              style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#EF4444' }}
                            >
                              <Trash2 size={14} />
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => onPrint && onPrint(gym)}
                              title="طباعة بيانات الصالة"
                              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                            >
                              <Printer size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* معلومات التصفية */}
      {!loading && filtered.length > 0 && (
        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'left' }}>
          عرض {filtered.length} من أصل {gyms?.length || 0} صالة
        </div>
      )}
    </div>
  );
}
