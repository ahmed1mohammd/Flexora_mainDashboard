// ============================================================
// الصفحات التكميلية — صفحات المستخدمين والنشاط والإعدادات
// ============================================================

import { Users, Activity, Construction } from 'lucide-react';

const PlaceholderPage = ({ icon: Icon, title, subtitle }) => (
  <div className="page-wrapper fade-in">
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
    </div>
    <div
      className="glass-card"
      style={{ padding: '80px 24px', textAlign: 'center' }}
    >
      <Construction size={64} style={{ color: 'var(--color-primary)', opacity: 0.5, margin: '0 auto 20px' }} />
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
        قيد التطوير
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
        هذه الوحدة قيد التطوير وستكون متاحة في الإصدار القادم
      </p>
    </div>
  </div>
);

export const UsersPage = () => (
  <PlaceholderPage
    icon={Users}
    title="إدارة المستخدمين"
    subtitle="عرض وإدارة حسابات مدراء الصالات الرياضية"
  />
);

export const ActivityPage = () => (
  <PlaceholderPage
    icon={Activity}
    title="سجل النشاط"
    subtitle="تتبع جميع العمليات والإجراءات المنفذة في المنظومة"
  />
);


