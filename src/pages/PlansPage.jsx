// ============================================================
// صفحة خطط الاشتراك — GET + POST /admin/saas-plans
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import { CreditCard } from 'lucide-react';
import PlansGrid from '../components/PlansGrid';
import axiosClient from '../api/axiosClient';

export default function PlansPage() {
  const [plans, setPlans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ── جلب خطط الاشتراك (GET /admin/saas-plans) ─────────────
  // الـ Backend يُرجع: { status, data: { plans: [...] } }
  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get('/admin/saas-plans');
      const data =
        response.data?.data?.plans ||
        response.data?.plans ||
        (Array.isArray(response.data) ? response.data : []);
      setPlans(data);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل جلب خطط الاشتراك');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return (
    <div className="page-wrapper fade-in">
      {/* رأس الصفحة */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CreditCard size={28} style={{ display: 'inline', marginLeft: '10px', color: 'var(--color-primary)' }} />
            منظومة <span>خطط الاشتراك</span>
          </h1>
          <p className="page-subtitle">
            إدارة وتخصيص حزم الاشتراك المتاحة للصالات الرياضية
          </p>
        </div>
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
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginRight: '12px' }}
            onClick={fetchPlans}
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* شبكة الخطط */}
      <PlansGrid
        plans={plans}
        loading={loading}
        onRefresh={fetchPlans}
      />
    </div>
  );
}
