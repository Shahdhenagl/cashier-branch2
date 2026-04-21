import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { BookUser, CreditCard, Search, Banknote, X } from 'lucide-react';

export default function DeferredAccounts() {
  const { customers, orders, storeSettings, checkout } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');

  // Calculate debts
  const customersWithDebt = customers.map(c => {
    const customerOrders = orders.filter(o => o.customer?.id === c.id);
    const totalDebt = customerOrders.reduce((sum, o) => {
      // debt is (total - paid_amount). For payments total is 0, so it's negative debt (which reduces total debt)
      return sum + (o.total - o.paid_amount);
    }, 0);
    
    return { 
      ...c, 
      totalDebt, 
      orders: customerOrders.filter(o => o.total - o.paid_amount > 0) // optional: keep only unpaid invoices for reference
    };
  }).filter(c => c.totalDebt > 0)
    .sort((a, b) => b.totalDebt - a.totalDebt);

  const filteredCustomers = customersWithDebt.filter(c => 
    c.name.includes(searchQuery) || c.phone.includes(searchQuery)
  );

  const handleOpenModal = (customer: any) => {
    setSelectedCustomer(customer);
    setPaymentAmount(customer.totalDebt.toString());
    setIsModalOpen(true);
  };

  const handleProcessPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0 || !selectedCustomer) {
      alert('الرجاء إدخال مبلغ صحيح');
      return;
    }
    
    if (amount > selectedCustomer.totalDebt) {
      alert('المبلغ المدفوع أكبر من إجمالي الدين');
      return;
    }

    try {
      // Pass total=0, paidAmount=amount, type='payment'
      const invoiceId = await checkout(
        0, 
        { name: selectedCustomer.name, phone: selectedCustomer.phone }, 
        amount, 
        'payment'
      );
      
      alert(`تم تسجيل الدفعة بنجاح!\nرقم الإيصال: ${invoiceId}`);
      setIsModalOpen(false);
      setSelectedCustomer(null);
      setPaymentAmount('');
    } catch (e: any) {
      alert('حدث خطأ أثناء معالجة الدفعة');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans text-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <BookUser className="text-indigo-600" size={32} />
            حسابات الآجل (الديون)
          </h1>
          <p className="text-slate-500 mt-2">إدارة العملاء المتعثرين وتسجيل الدفعات للفواتير الآجلة</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-3.5 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="ابحث برقم الهاتف أو اسم العميل..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <tr>
                <th className="py-4 px-6 font-bold">اسم العميل</th>
                <th className="py-4 px-6 font-bold">رقم الهاتف</th>
                <th className="py-4 px-6 font-bold">الفواتير المعلقة</th>
                <th className="py-4 px-6 font-bold">إجمالي المديونية</th>
                <th className="py-4 px-6 font-bold text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">{customer.name}</td>
                    <td className="py-4 px-6 font-mono text-slate-600" dir="ltr">{customer.phone}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-2">
                        {customer.orders.slice(0, 3).map((o: any) => (
                          <span key={o.id} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-mono">
                            #{o.id}
                          </span>
                        ))}
                        {customer.orders.length > 3 && (
                          <span className="text-xs text-slate-400">+{customer.orders.length - 3} فواتير أخرى</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-red-600 font-black text-lg bg-red-50 px-3 py-1 rounded-xl block w-max">
                        {customer.totalDebt.toFixed(2)} <span className="text-xs">{storeSettings.currency}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-left">
                      <button 
                        onClick={() => handleOpenModal(customer)}
                        className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl font-bold transition-colors"
                      >
                        <CreditCard size={18} /> سداد
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <BookUser size={48} className="mx-auto mb-4 opacity-50" />
                    لا يوجد عملاء لديهم التزامات مالية حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-l from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Banknote /> تسجيل دفعة سداد
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="flex flex-col items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-sm font-bold text-slate-500 mb-1">إجمالي المديونية</div>
                <div className="text-3xl font-black text-red-600">{selectedCustomer.totalDebt.toFixed(2)} <span className="text-lg">{storeSettings.currency}</span></div>
                <div className="mt-2 text-sm font-semibold">{selectedCustomer.name} - <span dir="ltr">{selectedCustomer.phone}</span></div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">المبلغ المراد سداده</label>
                <div className="relative">
                  <input
                    type="number"
                    dir="ltr"
                    className="w-full border border-slate-200 rounded-xl py-4 px-4 text-xl font-black text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    max={selectedCustomer.totalDebt}
                    min={1}
                  />
                  <div className="absolute left-4 top-4 text-slate-400 font-bold">{storeSettings.currency}</div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleProcessPayment}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold transition shadow-md shadow-indigo-200"
                >
                  إتمام عملية الدفع
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 border border-slate-200 hover:bg-slate-50 text-slate-600 py-3.5 rounded-xl font-bold transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
