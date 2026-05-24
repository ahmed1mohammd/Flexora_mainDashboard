// ============================================================
// صفحة إدارة الفروع — BranchesPage.jsx
// عرض طلبات الفروع المعلقة + قائمة الفروع النشطة
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import { GitBranch, CheckCircle2, Clock, XCircle, MapPin, Building2, RefreshCw } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import Swal from 'sweetalert2';

const STATUS_MAP = {
  ACTIVE:   { label: 'نشط',          color: 'var(--color-success)', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)',  icon: '✓' },
  PENDING:  { label: 'قيد المراجعة', color: '#f59e0b',              bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', icon: '⏳' },
  INACTIVE: { label: 'موقوف',        color: 'var(--color-danger)',  bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  icon: '✕' },
};

export default function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [gyms,     setGyms]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [approving, setApproving] = useState(null);

  // ── جلب جميع الفروع دفعة واحدة ──────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get('/admin/branches');
      const raw = res.data?.data?.branches || [];

      // ترتيب: PENDING أولاً ثم ACTIVE ثم INACTIVE
      const sorted = [...raw].sort((a, b) => {
        const order = { PENDING: 0, ACTIVE: 1, INACTIVE: 2 };
        return (order[a.status] ?? 3) - (order[b.status] ?? 3);
      });

      // إضافة gymName من الـ relation المضمّنة
      setBranches(sorted.map(b => ({
        ...b,
        gymName: b.gym?.gymName || b.gym?.name || '—'
      })));
    } catch (err) {
      setError(err.response?.data?.message || 'فشل جلب بيانات الفروع');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── الموافقة على فرع ─────────────────────────────────────
  const handleApprove = async (branch) => {
    const result = await Swal.fire({
      title: 'تفعيل الفرع',
      html: `هل تريد اعتماد وتفعيل الفرع <b>"${branch.name}"</b><br>التابع لصالة <b>"${branch.gymName}"</b>؟`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم، فعّل الفرع',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#22c55e',
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    setApproving(branch.id);
    try {
      await axiosClient.put(`/admin/branches/${branch.id}/approve`);
      setBranches(prev =>
        prev.map(b => b.id === branch.id ? { ...b, status: 'ACTIVE' } : b)
      );
      Swal.fire({ icon: 'success', title: 'تم التفعيل', text: `تم تفعيل الفرع "${branch.name}" بنجاح.`, timer: 2500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'فشل التفعيل', text: err.response?.data?.message || 'حدث خطأ أثناء تفعيل الفرع.' });
    } finally {
      setApproving(null);
    }
  };

  // ── الإحصائيات ────────────────────────────────────────────
  const pending  = branches.filter(b => b.status === 'PENDING');
  const active   = branches.filter(b => b.status === 'ACTIVE');
  const inactive = branches.filter(b => b.status === 'INACTIVE');

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="page-wrapper fade-in">

      {/* رأس الصفحة */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <GitBranch size={28} style={{ display: 'inline', marginLeft: '10px', color: 'var(--color-primary)' }} />
            إدارة <span>الفروع</span>
          </h1>
          <p className="page-subtitle">
            مراجعة واعتماد طلبات فروع الصالات الرياضية الجديدة
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchData} title="تحديث">
          <RefreshCw size={16} style={{ marginLeft: '6px' }} />
          تحديث
        </button>
      </div>

      {/* بطاقات الإحصائيات */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'قيد المراجعة', count: pending.length,  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', icon: Clock },
          { label: 'فروع نشطة',    count: active.length,   color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.3)',  icon: CheckCircle2 },
          { label: 'إجمالي الفروع',count: branches.length, color: 'var(--color-primary)', bg: 'var(--color-primary-dim)', border: 'var(--color-border-glow)', icon: GitBranch },
        ].map(({ label, count, color, bg, border, icon: Icon }) => (
          <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Icon size={28} style={{ color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color, lineHeight: 1.2 }}>{count}</div>
            </div>
          </div>
        ))}
      </div>

      {/* رسالة خطأ */}
      {error && (
        <div role="alert" style={{ padding: '14px 20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: 'var(--color-danger)', marginBottom: '20px', fontSize: '0.875rem' }}>
          ⚠ {error}
          <button className="btn btn-ghost btn-sm" style={{ marginRight: '12px' }} onClick={fetchData}>إعادة المحاولة</button>
        </div>
      )}

      {/* تحميل */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '12px', color: 'var(--color-text-muted)' }}>
          <div style={{ width: '28px', height: '28px', border: '3px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          جاري تحميل بيانات الفروع...
        </div>
      )}

      {/* قائمة الطلبات المعلقة أولاً */}
      {!loading && pending.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} />
            طلبات تنتظر الموافقة ({pending.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {pending.map(branch => (
              <BranchCard key={branch.id} branch={branch} onApprove={handleApprove} approving={approving} />
            ))}
          </div>
        </div>
      )}

      {/* جميع الفروع */}
      {!loading && branches.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
          <GitBranch size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p style={{ fontWeight: 600 }}>لا توجد فروع مسجلة حتى الآن</p>
          <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>عندما يطلب أصحاب الصالات فروعاً جديدة ستظهر هنا</p>
        </div>
      )}

      {!loading && active.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-success)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            الفروع النشطة ({active.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {active.map(branch => (
              <BranchCard key={branch.id} branch={branch} onApprove={handleApprove} approving={approving} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── مكوّن بطاقة الفرع ────────────────────────────────────────
function BranchCard({ branch, onApprove, approving }) {
  const cfg = STATUS_MAP[branch.status] || STATUS_MAP.PENDING;
  const isApproving = approving === branch.id;

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: `1px solid ${branch.status === 'PENDING' ? 'rgba(245,158,11,0.4)' : 'var(--color-border)'}`,
      borderRadius: '14px',
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'border-color 0.2s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--color-primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GitBranch size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>{branch.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Building2 size={11} />
              {branch.gymName}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700,
          background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
          whiteSpace: 'nowrap'
        }}>
          {cfg.icon} {cfg.label}
        </span>
      </div>

      {/* Address */}
      {branch.address && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          <MapPin size={13} style={{ flexShrink: 0 }} />
          {branch.address}
        </div>
      )}

      {/* Date */}
      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
        تاريخ الطلب: {new Date(branch.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>

      {/* Approve Button */}
      {branch.status === 'PENDING' && (
        <button
          className="btn btn-sm"
          onClick={() => onApprove(branch)}
          disabled={isApproving}
          style={{
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.4)',
            color: '#22c55e',
            fontWeight: 700,
            borderRadius: '10px',
            padding: '8px 16px',
            cursor: isApproving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            opacity: isApproving ? 0.6 : 1,
            transition: 'all 0.2s',
          }}
        >
          {isApproving ? (
            <>
              <div style={{ width: '14px', height: '14px', border: '2px solid #22c55e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              جاري التفعيل...
            </>
          ) : (
            <>✓ اعتماد وتفعيل الفرع</>
          )}
        </button>
      )}
    </div>
  );
}
