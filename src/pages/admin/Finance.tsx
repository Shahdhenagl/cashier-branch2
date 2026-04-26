import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Wallet, Plus, Trash2, Search, FileText, Table as TableIcon, ArrowUpCircle, ArrowDownCircle, Calendar, Filter, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function Finance() {
  const { expenses, orders, storeSettings, addExpense, deleteExpense } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: 'عام', amount: '', note: '' });

  // Filter expenses
  const filteredExpenses = expenses.filter(e => 
    e.category.includes(searchQuery) || e.note.includes(searchQuery)
  );

  // Financial Calculations
  const totalSales = orders.filter(o => o.type === 'sale').reduce((sum, o) => sum + o.paid_amount, 0);
  const totalPayments = orders.filter(o => o.type === 'payment').reduce((sum, o) => sum + o.paid_amount, 0);
  
  const totalReturnsValue = orders.reduce((sum, o) => {
    return sum + o.items.reduce((iSum, item) => iSum + (item.returned_quantity * item.sale_price), 0);
  }, 0);

  const totalExpensesValue = expenses.reduce((sum, e) => sum + e.amount, 0);

  const netSafeBalance = (totalSales + totalPayments) - totalReturnsValue - totalExpensesValue;

  const handleAddExpense = async () => {
    const amountNum = parseFloat(newExpense.amount);
    if (!amountNum || amountNum <= 0) {
      alert("الرجاء إدخال مبلغ صحيح");
      return;
    }
    await addExpense({
      category: newExpense.category,
      amount: amountNum,
      note: newExpense.note
    });
    setNewExpense({ category: 'عام', amount: '', note: '' });
    setShowAddModal(false);
  };

  const exportToExcel = () => {
    const wsData = [
      ['تقرير الخزينة والمصاريف', '', '', ''],
      ['التاريخ', new Date().toLocaleString('ar-SA'), '', ''],
      [''],
      ['إجمالي المبيعات (كاش)', totalSales, '', ''],
      ['تحصيل مديونيات', totalPayments, '', ''],
      ['إجمالي المرتجعات (خارج)', totalReturnsValue, '', ''],
      ['إجمالي المصاريف (خارج)', totalExpensesValue, '', ''],
      ['صافي الخزينة الحالي', netSafeBalance, '', ''],
      [''],
      ['سجل المصاريف التفصيلي'],
      ['الفئة', 'المبلغ', 'الملاحظات', 'التاريخ'],
      ...expenses.map(e => [e.category, e.amount, e.note, new Date(e.date).toLocaleString('ar-SA')])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Finance');
    XLSX.writeFile(wb, `finance_report_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Wallet style={{ color: storeSettings.themeColor }} size={32} />
            الخزينة والحسابات
          </h1>
          <p className="text-slate-500 mt-2 font-medium">مراقبة الدخل، المصاريف، وصافي أرباح الخزينة</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-900 transition shadow-lg"
          >
            <Download size={18} /> تصدير التقرير المالبي
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{ backgroundColor: storeSettings.themeColor }}
            className="flex items-center gap-2 text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition shadow-lg"
          >
            <Plus size={20} /> إضافة مصاريف / تكاليف
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <ArrowUpCircle size={28} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">+ الدخل</span>
          </div>
          <div>
            <p className="text-slate-400 font-bold text-sm mb-1">إجمالي الداخل (مبيعات + تحصيل)</p>
            <h3 className="text-3xl font-black text-slate-800">{(totalSales + totalPayments).toLocaleString()} <span className="text-sm font-normal text-slate-400">{storeSettings.currency}</span></h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-red-500" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
              <ArrowDownCircle size={28} />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">- الخارج</span>
          </div>
          <div>
            <p className="text-slate-400 font-bold text-sm mb-1">إجمالي الخارج (مرتجعات + مصاريف)</p>
            <h3 className="text-3xl font-black text-slate-800">{(totalReturnsValue + totalExpensesValue).toLocaleString()} <span className="text-sm font-normal text-slate-400">{storeSettings.currency}</span></h3>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[32px] shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div 
            className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10"
            style={{ backgroundColor: storeSettings.themeColor, borderRadius: '50%' }}
          />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
              <Wallet size={28} />
            </div>
            <span className="text-xs font-bold text-white bg-white/10 px-3 py-1 rounded-full">الرصيد الفعلي</span>
          </div>
          <div>
            <p className="text-slate-400 font-bold text-sm mb-1">صافي رصيد الخزينة الحالي</p>
            <h3 className="text-4xl font-black text-white">{netSafeBalance.toLocaleString()} <span className="text-sm font-normal text-slate-500">{storeSettings.currency}</span></h3>
          </div>
        </div>
      </div>

      {/* Main Content: Expenses Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute right-4 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="ابحث في سجل المصاريف..."
                className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
             <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-600 shadow-sm">
               <Calendar size={16} /> اليوم: {new Date().toLocaleDateString('ar-SA')}
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-100">
                <th className="p-6">البند / الفئة</th>
                <th className="p-6">المبلغ</th>
                <th className="p-6">ملاحظات إضافية</th>
                <th className="p-6">التاريخ والوقت</th>
                <th className="p-6 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <FileText size={64} />
                      <p className="text-xl font-bold mt-4">لا توجد مصاريف مسجلة</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-6 font-black text-red-600 text-lg">
                      {expense.amount.toLocaleString()} <span className="text-xs font-normal text-slate-400">{storeSettings.currency}</span>
                    </td>
                    <td className="p-6 text-slate-500 font-medium max-w-md truncate">
                      {expense.note || '—'}
                    </td>
                    <td className="p-6 text-slate-400 text-sm font-mono">
                      {new Date(expense.date).toLocaleString('ar-SA')}
                    </td>
                    <td className="p-6 text-left">
                      <button 
                        onClick={() => deleteExpense(expense.id)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">إضافة مصاريف جديدة</h2>
                <p className="text-slate-400 text-sm mt-1">سيتم خصم هذا المبلغ من رصيد الخزينة</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">الفئة / البند</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold"
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                >
                  <option value="عام">عام</option>
                  <option value="إيجار">إيجار</option>
                  <option value="كهرباء/مياه">كهرباء / مياه</option>
                  <option value="رواتب">رواتب موظفين</option>
                  <option value="نقل/توصيل">نقل / توصيل</option>
                  <option value="صيانة">صيانة</option>
                  <option value="مشتريات للمحل">مشتريات للمحل</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">المبلغ</label>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 focus:ring-2 focus:ring-indigo-500/20 outline-none font-black text-2xl text-red-600"
                    value={newExpense.amount}
                    onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{storeSettings.currency}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ملاحظات</label>
                <textarea 
                  placeholder="مثال: فاتورة الكهرباء لشهر مارس..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 h-32 focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium resize-none"
                  value={newExpense.note}
                  onChange={e => setNewExpense({...newExpense, note: e.target.value})}
                />
              </div>
              <button 
                onClick={handleAddExpense}
                style={{ backgroundColor: storeSettings.themeColor }}
                className="w-full text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-3"
              >
                تأكيد العملية وخصم من الخزينة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
