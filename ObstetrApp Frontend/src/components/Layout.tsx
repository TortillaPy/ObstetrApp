import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { AppProvider } from '../components/AppContext';

export function Layout() {
  return (
    <AppProvider>
      <div className="flex h-screen w-full bg-[#F3F4ED] font-sans text-[#2C3333] overflow-hidden print:h-auto print:min-h-screen print:bg-white print:block">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-[#F3F4ED] flex flex-col h-full print:bg-white print:overflow-visible print:h-auto print:block">
          <Outlet />
        </main>
      </div>
    </AppProvider>
  );
}
