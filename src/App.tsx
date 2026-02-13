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
    <nav className="flex justify-between items-center px-15 py-2 bg-white border-1 border-gray-100 sticky top-0 z-10">
      <div className="flex items-center gap-1">
        <img src={logo} alt="logo" className="w-18 h-12" />
      </div>
      <div className="flex gap-2 text-sm">
        <Link to="/" className={tabClass(isActive('/'))}>          <img
          src={isActive('/') ? menu_grid : menu_grid_inactive}
          className="w-[22px] h-[22px]"
        />
          대시보드
        </Link>
        <Link to="/manage" className={tabClass(isActive('/manage'))}>
          <img
            src={isActive('/') ? menu_list : menu_list_active}
            className="w-[22px] h-[22px]"
          />
          구독 관리
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