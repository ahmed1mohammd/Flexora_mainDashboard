// ============================================================
// مكوّن جدول الصالات الرياضية — GymTable
// يعرض قائمة الصالات مع أزرار: تفعيل / تجميد / تعليق
// ============================================================

import { useState } from 'react';
import { CheckCircle, Snowflake, Ban, Search, RefreshCw, Printer } from 'lucide-react';
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
    const { value: formValues } = await Swal.fire({
      title: `تفعيل صالة: ${gym.name}`,
      html: `
        <div style="display:flex;flex-direction:column;gap:12px;text-align:right">
          <div>
            <label style="font-size:0.8rem;color:#8A8A8A;display:block;margin-bottom:4px">مدة الاشتراك (بالأشهر)</label>
            <input id="swal-duration" type="number" min="1" value="1"
              class="swal2-input" style="margin:0;width:100%;text-align:right" placeholder="مثال: 3">
          </div>
          <div>
            <label style="font-size:0.8rem;color:#8A8A8A;display:block;margin-bottom:4px">السعر المدفوع (جنيه)</label>
            <input id="swal-price" type="number" min="0"
              class="swal2-input" style="margin:0;width:100%;text-align:right" placeholder="مثال: 500">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'تفعيل الآن',
      cancelButtonText: 'إلغاء',
      focusConfirm: false,
      preConfirm: () => {
        const duration = document.getElementById('swal-duration').value;
        const price    = document.getElementById('swal-price').value;
        if (!duration || !price) {
          Swal.showValidationMessage('يرجى تعبئة جميع الحقول المطلوبة');
          return false;
        }
        return {
          durationInMonths: Number(duration), // ⚠ الباك اند يتوقع durationInMonths (أشهر)
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
      });
      onRefresh?.();
    } catch (error) {
      Swal.fire({
        title: 'خطأ في التفعيل',
        text: error.response?.data?.message || 'حدث خطأ غير متوقع أثناء التفعيل',
        icon: 'error',
        confirmButtonText: 'حسناً',
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
