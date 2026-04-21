import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import POS from './pages/POS';
import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Overview from './pages/admin/Overview';
import Inventory from './pages/admin/Inventory';
import Invoices from './pages/admin/Invoices';
import Customers from './pages/admin/Customers';
import DeferredAccounts from './pages/admin/DeferredAccounts';
import Settings from './pages/admin/Settings';
import { useStore } from './store/useStore';

function ThemeInjector() {
  const { storeSettings } = useStore();
  const hex = storeSettings.themeColor || '#4f46e5';
  const r = parseInt(hex.slice(1, 3), 16) || 79;
  const g = parseInt(hex.slice(3, 5), 16) || 70;
  const b = parseInt(hex.slice(5, 7), 16) || 229;

  return (
    <style>
      {`
        :root { --tc: ${hex}; --tr: ${r}; --tg: ${g}; --tb: ${b}; }

        /* Backgrounds */
        .bg-indigo-50  { background-color: rgba(${r},${g},${b},0.08) !important; }
        .bg-indigo-100 { background-color: rgba(${r},${g},${b},0.15) !important; }
        .bg-indigo-500 { background-color: ${hex} !important; }
        .bg-indigo-600 { background-color: ${hex} !important; }
        .bg-indigo-700 { background-color: rgba(${r},${g},${b},0.85) !important; }
        .hover\\:bg-indigo-50:hover  { background-color: rgba(${r},${g},${b},0.08) !important; }
        .hover\\:bg-indigo-600:hover { background-color: ${hex} !important; }
        .hover\\:bg-indigo-700:hover { background-color: rgba(${r},${g},${b},0.85) !important; }
        
        /* Text */
        .text-indigo-400 { color: rgba(${r},${g},${b},0.75) !important; }
        .text-indigo-500 { color: rgba(${r},${g},${b},0.9) !important; }
        .text-indigo-600 { color: ${hex} !important; }
        .text-indigo-700 { color: rgba(${r},${g},${b},0.85) !important; }
        .hover\\:text-indigo-600:hover { color: ${hex} !important; }
        
        /* Borders */
        .border-indigo-100 { border-color: rgba(${r},${g},${b},0.2) !important; }
        .border-indigo-200 { border-color: rgba(${r},${g},${b},0.3) !important; }
        .border-indigo-500 { border-color: ${hex} !important; }
        .border-indigo-600 { border-color: ${hex} !important; }
        
        /* Gradients - from */
        .from-indigo-500, .from-indigo-600, .from-indigo-700 {
          --tw-gradient-from: ${hex} !important;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(${r},${g},${b},0)) !important;
        }
        .via-indigo-600 {
          --tw-gradient-stops: var(--tw-gradient-from), ${hex}, var(--tw-gradient-to, rgba(${r},${g},${b},0)) !important;
        }
        /* Gradients - to purple (make same as theme for unified look) */
        .to-purple-600, .to-purple-700, .to-purple-800 {
          --tw-gradient-to: rgba(${r},${g},${b},0.8) !important;
        }
        .hover\\:from-indigo-700:hover { --tw-gradient-from: rgba(${r},${g},${b},0.9) !important; }
        .hover\\:to-purple-700:hover   { --tw-gradient-to: rgba(${r},${g},${b},0.8) !important; }
        
        /* Focus ring */
        .focus\\:ring-indigo-500:focus { --tw-ring-color: rgba(${r},${g},${b},0.5) !important; }
        .focus\\:ring-2:focus { --tw-ring-color: rgba(${r},${g},${b},0.5) !important; }
        
        /* Shadow */
        .shadow-indigo-200, .shadow-indigo-500\/20, .shadow-indigo-900\/20 {
          --tw-shadow-color: rgba(${r},${g},${b},0.25) !important;
          --tw-shadow: var(--tw-shadow-colored) !important;
        }
        
        /* Dark mode variants */
        .dark .dark\\:text-indigo-400 { color: rgba(${r},${g},${b},0.75) !important; }
        .dark .dark\\:from-indigo-400 { --tw-gradient-from: rgba(${r},${g},${b},0.75) !important; }
        .dark .dark\\:to-purple-400   { --tw-gradient-to: rgba(${r},${g},${b},0.6) !important; }
      `}
    </style>
  );
}

function App() {
  const { loadAll, loadSettingsOnly, isLoading, dbError } = useStore();

  useEffect(() => {
    loadAll();

    const channel = new BroadcastChannel('cashier-sync');
    channel.onmessage = (event) => {
      if (event.data === 'sync_settings') {
        loadSettingsOnly();
      }
    };
    return () => channel.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold text-lg">جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-red-50 gap-4 p-8 text-center">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-2xl font-black text-red-700">تعذّر الاتصال بقاعدة البيانات</h2>
        <p className="text-red-500 font-mono text-sm bg-red-100 px-4 py-2 rounded-lg max-w-lg">{dbError}</p>
        <button onClick={() => loadAll()} className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <>
      <ThemeInjector />
      <Router>
        <Routes>
          <Route path="/" element={<POS />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="customers" element={<Customers />} />
            <Route path="deferred" element={<DeferredAccounts />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
