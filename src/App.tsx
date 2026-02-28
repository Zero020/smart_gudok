import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Manage from './pages/Management';
import logo from "./assets/mainLogo.svg";
import menu_list from "./assets/menu_list.svg";
import menu_grid from "./assets/menu_grid.svg";
import menu_grid_inactive from "./assets/menu_grid_inactive.svg";
import menu_list_active from "./assets/menu_list_active.svg";

function Navigation() {
  const location = useLocation();

  // 현재 위치에 따라 텍스트와 아이콘의 활성화 상태를 결정
  const isActive = (path: string) => location.pathname === path;

  const tabClass = (active: boolean) =>
    `flex items-center gap-2 px-6 py-3 rounded-2xl transition-all
  ${active
      ? "bg-[rgba(17,173,147,0.1)] text-primary font-semibold"
      : "text-gray-400 hover:text-gray-600"
    }`;

  return (
    <nav className="flex justify-between items-center px-4 md:px-15 py-2 bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center">
        <img src={logo} alt="logo" className="w-14 h-10 md:w-18 md:h-12 object-contain" />
      </div>

      {/* 탭 메뉴 간격 조절 */}
      <div className="flex gap-1 md:gap-2">
        <Link to="/" className={tabClass(isActive('/'))}>
          <img src={isActive('/') ? menu_grid : menu_grid_inactive} className="w-5 h-5 md:w-[22px] md:h-[22px]" />
          <span className="inline">대시보드</span> {/* 텍스트 항상 노출 */}
        </Link>
        <Link to="/manage" className={tabClass(isActive('/manage'))}>
          <img src={isActive('/manage') ? menu_list_active : menu_list} className="w-5 h-5 md:w-[22px] md:h-[22px]" />
          <span className="inline">구독 관리</span>
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/manage" element={<Manage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;