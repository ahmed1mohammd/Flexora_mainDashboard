import React from 'react';
import { Printer, X } from 'lucide-react';

export default function InvoiceTemplate({ transaction, onClose }) {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  // نفترض أن الديسكريبشن يحتوي على مدة الاشتراك، ونستخرج الرقم للتبسيط أو نستخدمه مباشرة
  // transaction: { id, amount, description, createdAt, gym: { name, email, maxReceptionists, maxCoaches, users: [{ ownerName, phoneNumber }] } }

  const invoiceNumber = transaction.id.substring(0, 8).toUpperCase();
  const date = new Date(transaction.createdAt).toLocaleDateString('ar-EG');
  const gymName = transaction.gym?.name || 'غير معروف';
  
  const ownerName = transaction.gym?.ownerName || 'مالك الصالة';
  const email = transaction.gym?.email || '—';
  const subEndDate = transaction.gym?.subscriptionEnd ? new Date(transaction.gym.subscriptionEnd).toLocaleDateString('ar-EG') : 'غير محدد';
  // Fetch Platform Settings dynamically on mount
  React.useEffect(() => {
    fetch('http://localhost:3000/public/settings')
      .then(res => res.json())
      .then(data => {
        if (data?.data?.settings) {
          const settings = data.data.settings;
          if (settings.showLegalFooter) {
            const block = document.getElementById('invoice-legal-block');
            const taxEl = document.getElementById('invoice-tax-num');
            const crEl = document.getElementById('invoice-cr-num');
            if (block && taxEl && crEl) {
              taxEl.innerText = settings.taxNumber || '—';
              crEl.innerText = settings.commercialRecord || '—';
              block.style.display = 'block';
            }
          }
        }
      }).catch(err => console.error('Error fetching global settings for invoice', err));
  }, []);

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* ستايلات الطباعة والشاشات الصغيرة */}
      <style>{`
        @media print {
          html, body, #root {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
          }
          /* جعل خلفية المودال بيضاء بالكامل لتغطية الموقع تحته وقت الطباعة */
          .modal-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 100vh !important;
            background: #ffffff !important;
            z-index: 999999 !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .modal-card {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            transform: none !important;
            overflow: visible !important;
          }
          .invoice-actions-bar {
            display: none !important;
          }
          .invoice-print-area {
            padding: 0 20px !important;
          }
        }
        
        @media screen and (max-width: 600px) {
          .invoice-print-area {
            padding: 15px !important;
          }
          .invoice-title {
            font-size: 1.8rem !important;
          }
          .invoice-subtitle {
            font-size: 1.1rem !important;
          }
          .invoice-table {
            font-size: 0.85rem !important;
          }
          .invoice-table th, .invoice-table td {
            padding: 8px !important;
          }
          .invoice-flex-mobile {
            flex-direction: column !important;
            gap: 15px;
          }
          .invoice-flex-mobile > div {
            text-align: right !important;
          }
        }
        
        /* جعل الجدول يتجاوب عبر التمرير الأفقي إذا لزم الأمر */
        .table-responsive {
          overflow-x: auto;
          width: 100%;
        }
      `}</style>

      <div className="modal-card fade-in" style={{ maxWidth: '800px', width: '90%', padding: 0, overflow: 'hidden' }}>
        
        {/* شريط التحكم (لا يُطبع) */}
        <div className="invoice-actions-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'var(--color-surface, #1A1A1A)', borderBottom: '1px solid var(--color-border, #333)' }}>
          <h2 style={{ margin: 0, color: 'var(--color-primary, #E50914)', fontSize: '1.2rem', fontWeight: 'bold' }}>معاينة الفاتورة</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={16} /> طباعة (PDF)
            </button>
            <button className="btn btn-ghost" onClick={onClose} style={{ color: '#fff' }}>
              <X size={16} /> إغلاق
            </button>
          </div>
        </div>

        {/* مساحة الفاتورة (التي ستُطبع) */}
        <div className="invoice-print-area" style={{ background: '#fff', color: '#111', padding: '40px', fontFamily: 'Arial, sans-serif', direction: 'rtl' }}>
          
          {/* رأس الفاتورة */}
          <div className="invoice-flex-mobile" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #E50914', paddingBottom: '20px', marginBottom: '30px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <img src="/logo.png" alt="Flexora Logo" style={{ height: '50px', objectFit: 'contain' }} />
              </div>
              <p style={{ margin: 0, color: '#555', fontSize: '0.9rem' }}>منظومة إدارة الصالات الرياضية الذكية</p>
              <p style={{ margin: '5px 0 0 0', color: '#555', fontSize: '0.9rem' }}>القاهرة، جمهورية مصر العربية</p>
              
              {/* Dynamic Legal Footer Block injected here */}
              <div id="invoice-legal-block" style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666', borderTop: '1px dashed #ddd', paddingTop: '10px', display: 'none' }}>
                <p style={{ margin: '0 0 4px 0' }}><strong>الرقم الضريبي:</strong> <span id="invoice-tax-num"></span></p>
                <p style={{ margin: 0 }}><strong>السجل التجاري:</strong> <span id="invoice-cr-num"></span></p>
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <h2 className="invoice-subtitle" style={{ fontSize: '1.5rem', margin: '0 0 10px 0', color: '#333' }}>فاتورة اشتراك (SaaS)</h2>
              <p style={{ margin: 0, color: '#666' }}>رقم الفاتورة: <strong>#{invoiceNumber}</strong></p>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>تاريخ الإصدار: <strong>{date}</strong></p>
            </div>
          </div>

          {/* معلومات العميل */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', color: '#888', marginBottom: '10px', textTransform: 'uppercase' }}>مفوترة إلى:</h3>
              <p style={{ margin: '0 0 5px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>صالة: {gymName}</p>
              <p style={{ margin: '0 0 5px 0' }}>اسم المالك: {ownerName}</p>
              <p style={{ margin: '0 0 5px 0' }}>البريد: {email}</p>
              <p style={{ margin: '0 0 5px 0' }}>تاريخ انتهاء الاشتراك: <span style={{ fontWeight: 'bold', color: '#E50914' }}>{subEndDate}</span></p>
            </div>
          </div>

          {/* تفاصيل الاشتراك */}
          <div className="table-responsive">
            <table className="invoice-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', minWidth: '400px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'right', color: '#444' }}>الوصف</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'center', color: '#444' }}>الصلاحيات</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left', color: '#444' }}>المبلغ الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '16px 12px', borderBottom: '1px solid #eee' }}>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '1.1rem' }}>الاشتراك في منصة فليكسورا</p>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{transaction.description}</p>
                  </td>
                  <td style={{ padding: '16px 12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 5px 0' }}>{transaction.gym?.maxReceptionists || 1} موظف استقبال</p>
                    <p style={{ margin: 0 }}>{transaction.gym?.maxCoaches || 4} مدربين</p>
                  </td>
                  <td style={{ padding: '16px 12px', borderBottom: '1px solid #eee', textAlign: 'left', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {transaction.amount} ج.م
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* الإجمالي */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '50px' }}>
            <div style={{ width: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#666' }}>المجموع الفرعي:</span>
                <span>{transaction.amount} ج.م</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#666' }}>الضرائب (0%):</span>
                <span>0 ج.م</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', color: '#E50914', fontWeight: 'bold', fontSize: '1.3rem' }}>
                <span>الإجمالي المستحق:</span>
                <span>{transaction.amount} ج.م</span>
              </div>
            </div>
          </div>

          {/* التذييل */}
          <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #eee', color: '#888', fontSize: '0.85rem' }}>
            <p style={{ margin: '0 0 5px 0' }}>نشكركم لاختياركم فليكسورا. نتمنى لكم دوام التوفيق والنجاح.</p>
            <p style={{ margin: 0 }}>هذه فاتورة إلكترونية معتمدة ولا تحتاج إلى توقيع.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
