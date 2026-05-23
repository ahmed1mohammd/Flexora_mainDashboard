// ============================================================
// مكوّن بطاقة الإحصائيات — StatCard
// ============================================================

import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ icon: Icon, value, label, change, changeType = 'positive', loading = false }) {
  if (loading) {
    return (
      <div className="stat-card">
        <div className="skeleton skeleton-card" style={{ height: '120px' }} />
      </div>
    );
  }

  return (
    <div className="stat-card slide-in">
      <div className="stat-card-icon">
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-card-value">{value ?? '—'}</div>
      <div className="stat-card-label">{label}</div>
      {change !== undefined && (
        <div className={`stat-card-change ${changeType}`}>
          {changeType === 'positive'
            ? <TrendingUp size={12} />
            : <TrendingDown size={12} />
          }
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}
