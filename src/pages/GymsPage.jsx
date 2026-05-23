// ============================================================
// صفحة إدارة الصالات الرياضية — GET /admin/gyms
// مع إجراءات: تفعيل / تجميد / تعليق
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import { Building2 } from 'lucide-react';
import GymTable from '../components/GymTable';
import InvoiceTemplate from '../components/InvoiceTemplate';
import axiosClient from '../api/axiosClient';

export default function GymsPage() {
  const [gyms, setGyms]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [selectedGym, setSelectedGym] = useState(null);

  // ── جلب قائمة الصالات (GET /admin/gyms) ──────────────────
  // الـ Backend يُرجع: { status, results, data: { gyms: [...] } }
  const fetchGyms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get('/admin/gyms');
      // استخراج المصفوفة من الغلاف المتعدد الأشكال
      const data =
        response.data?.data?.gyms ||
        response.data?.gyms ||
        (Array.isArray(response.data) ? response.data : []);
      setGyms(data);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل جلب قائمة الصالات الرياضية');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGyms();
  }, [fetchGyms]);

  return (
    <div className="page-wrapper fade-in">
      {/* رأس الصفحة */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Building2 size={28} style={{ display: 'inline', marginLeft: '10px', color: 'var(--color-primary)' }} />
            إدارة <span>الصالات الرياضية</span>
          </h1>
          <p className="page-subtitle">
            عرض وإدارة جميع الصالات المسجلة في منظومة فليكسورا عبر مصر
          </p>
        </div>
        <div style={{
          padding: '10px 20px',
          background: 'var(--color-primary-dim)',
          borderRadius: '50px',
          border: '1px solid var(--color-border-glow)',
          fontSize: '0.875rem',
          color: 'var(--color-primary)',
          fontWeight: 700
        }}>
          {loading ? '...' : `${gyms.length} صالة مسجلة`}
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
            onClick={fetchGyms}
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* جدول الصالات */}
      <GymTable
        gyms={gyms}
        loading={loading}
        onRefresh={fetchGyms}
        onPrint={(gym) => setSelectedGym(gym)}
      />

      {selectedGym && (
        <InvoiceTemplate
          transaction={{
            id: selectedGym.id,
            amount: 0,
            description: 'بيانات اشتراك الصالة',
            createdAt: new Date(),
            gym: selectedGym
          }}
          onClose={() => setSelectedGym(null)}
        />
      )}
    </div>
  );
}
