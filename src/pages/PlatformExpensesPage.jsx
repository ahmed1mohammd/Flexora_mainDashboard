import { useEffect, useState, useCallback } from 'react';
import { DollarSign, Plus, Trash2, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import axiosClient from '../api/axiosClient';
import StatCard from '../components/StatCard';

export default function PlatformExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/expenses');
      setExpenses(res.data.data.expenses || []);
      setTotalExpenses(res.data.data.totalExpenses || 0);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل جلب المصروفات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleAddExpense = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'إضافة مصروف جديد',
      html: `
        <div style="display:flex;flex-direction:column;gap:12px;text-align:right">
          <div>
            <label style="font-size:0.8rem;color:#8A8A8A;">المبلغ (جنيه)</label>
            <input id="exp-amount" type="number" min="1" class="swal2-input" placeholder="مثال: 500" style="margin:0;width:100%;text-align:right">
          </div>
          <div>
            <label style="font-size:0.8rem;color:#8A8A8A;">التصنيف</label>
            <select id="exp-category" class="swal2-input" style="margin:0;width:100%;padding:0 10px;">
              <option value="استضافة سيرفرات">استضافة سيرفرات</option>
              <option value="تسويق وإعلانات">تسويق وإعلانات</option>
              <option value="رواتب">رواتب</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.8rem;color:#8A8A8A;">الوصف / ملاحظات</label>
            <input id="exp-desc" type="text" class="swal2-input" placeholder="تفاصيل المصروف..." style="margin:0;width:100%;text-align:right">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'إضافة',
      cancelButtonText: 'إلغاء',
      preConfirm: () => {
        const amount = document.getElementById('exp-amount').value;
        const category = document.getElementById('exp-category').value;
        const description = document.getElementById('exp-desc').value;
        if (!amount || !category) {
          Swal.showValidationMessage('الرجاء إدخال المبلغ والتصنيف');
          return false;
        }
        return { amount: Number(amount), category, description };
      }
    });

    if (!formValues) return;

    try {
      await axiosClient.post('/admin/expenses', formValues);
      Swal.fire('تم!', 'تمت إضافة المصروف بنجاح', 'success');
      fetchExpenses();
    } catch (err) {
      Swal.fire('خطأ', err.response?.data?.message || 'حدث خطأ أثناء الإضافة', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'تأكيد الحذف',
      text: 'هل أنت متأكد من حذف هذا المصروف؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء'
    });
    if (!result.isConfirmed) return;

    try {
      await axiosClient.delete(`/admin/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      Swal.fire('خطأ', err.response?.data?.message || 'فشل الحذف', 'error');
    }
  };

  return (
    <div className="page-wrapper fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title"><DollarSign size={28} style={{ display: 'inline', marginLeft: '10px', color: 'var(--color-primary)' }}/> <span>المصروفات</span></h1>
          <p className="page-subtitle">تسجيل وإدارة المصروفات الخاصة بالمنصة (سيرفرات، إعلانات، إلخ)</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={fetchExpenses} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} /> تحديث
          </button>
          <button className="btn btn-primary" onClick={handleAddExpense}>
            <Plus size={16} /> إضافة مصروف
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <StatCard
          icon={DollarSign}
          label="إجمالي المصروفات"
          value={`${Number(totalExpenses).toLocaleString('ar-EG')} ج`}
          changeType="negative"
        />
      </div>

      <div className="glass-card slide-in" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>سجل المصروفات</h2>
        {error && <div className="alert-error" style={{ marginBottom: '15px' }}>{error}</div>}
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>المبلغ</th>
                <th>التصنيف</th>
                <th>الوصف</th>
                <th>التاريخ</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>جاري التحميل...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>لا توجد مصروفات مسجلة</td></tr>
              ) : (
                expenses.map(exp => (
                  <tr key={exp.id}>
                    <td style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>{Number(exp.amount).toLocaleString('ar-EG')} ج</td>
                    <td>{exp.category}</td>
                    <td>{exp.description || '—'}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{new Date(exp.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(exp.id)} title="حذف">
                        <Trash2 size={16} color="var(--color-danger)" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
