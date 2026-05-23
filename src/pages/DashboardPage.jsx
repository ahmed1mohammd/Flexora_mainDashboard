// ============================================================
// صفحة لوحة التحكم — GET /admin/dashboard-stats
// تعرض الإحصائيات الحيوية للمنظومة
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import {
  Building2, Users, TrendingUp, DollarSign,
  Activity, Calendar, RefreshCw, Printer
} from 'lucide-react';
import StatCard from '../components/StatCard';
import axiosClient from '../api/axiosClient';
import { EyeOff } from 'lucide-react';

const userName = localStorage.getItem('flexora_user_name') || 'المدير';
const userRole = localStorage.getItem('flexora_user_role');

// تعريف بطاقات الإحصائيات مع ربطها بحقول الـ API الفعلية
// الـ Backend يُرجع: { totalEarnings, totalGyms, activeGyms, recentTransactions }
const buildStatCards = (data) => [
  {
    icon:       Building2,
    value:      data?.totalGyms?.toLocaleString('ar-EG') ?? '—',
    label:      'إجمالي الصالات المسجلة',
    changeType: 'positive',
  },
  {
    icon:       Users,
    value:      data?.activeGyms?.toLocaleString('ar-EG') ?? '—',
    label:      'الصالات النشطة حالياً',
    changeType: 'positive',
  },
  {
    icon:       DollarSign,
    value:      userRole === 'Platform-Manager'
      ? <div className="flex items-center gap-2 blur-sm select-none opacity-60" title="مخفي للصلاحيات المساعدة"><EyeOff size={16}/> <span>***</span></div>
      : data?.totalEarnings != null
        ? `${Number(data.totalEarnings).toLocaleString('ar-EG')} ج`
        : '—',
    label:      'إجمالي إيرادات المنظومة',
    changeType: 'positive',
  },
  {
    icon:       TrendingUp,
    value:      data?.recentTransactions?.length?.toLocaleString('ar-EG') ?? '—',
    label:      'آخر العمليات المالية',
    changeType: 'positive',
  },
];

export default function DashboardPage() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // ── جلب إحصائيات المنظومة (GET /admin/dashboard) ───────
  // ⚠ المسار الفعلي هو /admin/dashboard وليس /admin/dashboard-stats
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get('/admin/dashboard');
      // الـ Backend يُرجع { status, data: { totalEarnings, totalGyms, activeGyms, recentTransactions } }
      const payload = response.data?.data || response.data;
      setStats(payload);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.response?.data?.message || 'فشل جلب إحصائيات المنظومة');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // تحديث دوري كل 5 دقائق
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const statCards = buildStatCards(stats || {});

  return (
    <div className="page-wrapper fade-in">
      {/* رأس الصفحة */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            لوحة <span>التحكم</span>
          </h1>
          <p className="page-subtitle">
            مرحباً {userName} — نظرة شاملة على منظومة فليكسورا
          </p>
          {lastUpdate && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '4px' }}>
              آخر تحديث: {lastUpdate.toLocaleTimeString('ar-EG')}
            </p>
          )}
        </div>
        <button
          id="btn-refresh-stats"
          className="btn btn-ghost"
          onClick={fetchStats}
          disabled={loading}
          title="تحديث الإحصائيات"
        >
          <RefreshCw size={16} />
          <span>تحديث</span>
        </button>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div
          role="alert"
          style={{
            padding: '16px 20px',
            background: 'rgba(255, 71, 87, 0.1)',
            border: '1px solid rgba(255, 71, 87, 0.3)',
            borderRadius: '12px',
            color: 'var(--color-danger)',
            marginBottom: '24px',
            fontSize: '0.875rem',
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* شبكة الإحصائيات */}
      <div className="stats-grid">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} loading={loading} />
        ))}
      </div>

      {/* لوحة آخر العمليات المالية */}
      {!loading && stats?.recentTransactions?.length > 0 && userRole === 'Platform-Owner' && (
        <div className="glass-card slide-in" style={{ padding: '28px', marginTop: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
            آخر العمليات المالية
          </h2>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الصالة</th>
                  <th>المبلغ</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.gym?.name || '—'}</td>
                    <td style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                      {Number(tx.amount).toLocaleString('ar-EG')} ج
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      {new Date(tx.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
