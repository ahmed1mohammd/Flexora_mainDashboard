// ============================================================
// مكوّن الشريط الجانبي — Sidebar الثابت (RTL)
// ============================================================

import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, LogOut, Settings,
  Activity, Building2, Download, ShieldCheck, DollarSign
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import Swal from 'sweetalert2';

const LOGO_URL = 'https://i.ibb.co/qF44zwks/logo1-1.png';

const NAV_LINKS = [
  {
    group: 'الرئيسية',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
      { to: '/gyms',      icon: Building2,       label: 'الصالات الرياضية' },
      { to: '/plans',     icon: CreditCard,      label: 'خطط الاشتراك' },
    ]
  },
  {
    group: 'الإدارة',
    items: [
      { to: '/users',    icon: Users,    label: 'إدارة المستخدمين' },
      { to: '/activity', icon: Activity, label: 'سجل النشاط' },
      { to: '/expenses', icon: DollarSign, label: 'المصروفات' },
      { to: '/settings', icon: Settings, label: 'الإعدادات' },
    ]
  }
];

// Add Team Management conditionally
const getNavLinks = () => {
  const role = localStorage.getItem('flexora_user_role');
  const links = [...NAV_LINKS];
  
  if (role === 'Platform-Owner') {
    // Check if team is already in the Management group
    const managementGroup = links.find(g => g.group === 'الإدارة');
    if (managementGroup && !managementGroup.items.some(i => i.to === '/team')) {
      managementGroup.items.unshift({ to: '/team', icon: ShieldCheck, label: 'إدارة الصلاحيات' });
    }
  }
  return links;
};

export default function Sidebar() {
  const navigate = useNavigate();
  const { isInstallable, isInstalled, triggerInstall } = usePWAInstall();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'تأكيد تسجيل الخروج',
      text: 'هل أنت متأكد من رغبتك في إنهاء الجلسة الحالية؟',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم، خروج',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      localStorage.removeItem('flexora_auth_token');
      localStorage.removeItem('flexora_user_role');
      navigate('/login');
    }
  };

  return (
    <aside className="sidebar">
      {/* الشعار */}
      <div className="sidebar-logo-wrap">
        <img
          src={LOGO_URL}
          alt="شعار منظومة فليكسورا"
          className="sidebar-logo"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <span className="sidebar-brand">Flexora™ Admin</span>
      </div>

      {/* روابط التنقل */}
      <nav className="sidebar-nav" role="navigation" aria-label="القائمة الرئيسية">
        {getNavLinks().map((group) => (
          <div key={group.group}>
            <div className="nav-section-title">{group.group}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                id={`nav-${item.to.replace('/', '')}`}
                className={({ isActive }) =>
                  `nav-item${isActive ? ' active' : ''}`
                }
              >
                <item.icon className="nav-icon" size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* تذييل الشريط الجانبي */}
      <footer className="sidebar-footer">
        {/* زر التثبيت PWA */}
        {isInstallable && !isInstalled && (
          <button
            id="btn-pwa-install"
            className="btn-install"
            onClick={triggerInstall}
            title="تثبيت المنظومة كتطبيق مستقل"
          >
            <Download size={15} />
            <span>تثبيت المنظومة على الجهاز</span>
          </button>
        )}

        {isInstalled && (
          <div style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--color-success)',
            padding: '8px'
          }}>
            ✓ المنظومة مثبتة على الجهاز
          </div>
        )}

        {/* زر تسجيل الخروج */}
        <button
          id="btn-logout"
          className="btn btn-ghost w-full"
          style={{ marginTop: '8px', justifyContent: 'center' }}
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span>تسجيل الخروج</span>
        </button>
      </footer>
    </aside>
  );
}
