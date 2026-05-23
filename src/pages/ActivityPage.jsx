// ============================================================
// صفحة سجل النشاط (Activity Logs)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Loader2, ShieldAlert, Clock, User, Building2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import Swal from 'sweetalert2';

export default function ActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/admin/activity');
      setLogs(response.data.data.logs || []);
    } catch (err) {
      console.error(err);
      Swal.fire('خطأ', 'فشل جلب سجل النشاطات', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // دالة لتنسيق الوقت بصيغة "منذ 5 دقائق" أو عرض التاريخ الكامل
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'منذ لحظات';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="page-wrapper fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title d-flex align-center gap-12">
            <Activity size={28} className="text-primary" />
            <span>سجل <span>النشاط</span></span>
          </h1>
          <p className="page-subtitle" style={{ marginTop: '4px' }}>
            تتبع جميع العمليات والإجراءات التي قام بها مدراء المنظومة الإدارية.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '80px', textAlign: 'center' }}>
          <Loader2 className="spinner text-primary" size={40} style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <p className="text-muted">جاري تحميل السجل...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="empty-state slide-in" style={{ marginTop: '40px' }}>
          <div className="empty-state-icon"><ShieldAlert size={64} /></div>
          <h3>لا توجد نشاطات مسجلة</h3>
          <p>لم يتم تسجيل أي عمليات إدارية حتى الآن.</p>
        </div>
      ) : (
        <div className="glass-card slide-in" style={{ padding: '24px' }}>
          <div style={{ position: 'relative' }}>
            {/* خط التايم لاين العمودي */}
            <div style={{
              position: 'absolute', top: 0, bottom: 0, right: '19px',
              width: '2px', background: 'var(--color-border)', zIndex: 0
            }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', zIndex: 1 }}>
              {logs.map(log => (
                <div key={log.id} className="d-flex" style={{ gap: '16px' }}>
                  {/* الأيقونة */}
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                    background: 'var(--color-bg-main)', border: '2px solid var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 10px rgba(229,9,20,0.2)'
                  }}>
                    <Activity size={18} className="text-primary" />
                  </div>

                  {/* المحتوى */}
                  <div style={{
                    flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)',
                    borderRadius: '12px', padding: '16px'
                  }}>
                    <div className="d-flex align-center justify-between mb-8">
                      <div className="d-flex align-center gap-8">
                        <User size={14} className="text-muted" />
                        <span className="fw-bold text-light" style={{ fontSize: '0.95rem' }}>{log.user.name}</span>
                        <span className="badge" style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(255,255,255,0.05)' }}>
                          {log.user.role}
                        </span>
                      </div>
                      <div className="d-flex align-center gap-8 text-muted" style={{ fontSize: '0.8rem' }}>
                        <Clock size={12} />
                        <span>{formatTime(log.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div style={{ color: 'var(--color-text-light)', lineHeight: 1.6, marginBottom: '8px' }}>
                      {log.details}
                    </div>

                    <div className="d-flex gap-8" style={{ flexWrap: 'wrap' }}>
                      <span className="badge text-primary" style={{ background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.2)' }}>
                        {log.action}
                      </span>
                      {log.gym && (
                        <span className="badge text-muted" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)' }}>
                          <Building2 size={12} style={{ marginLeft: '4px' }} />
                          {log.gym.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
