import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import logo from "./assets/mainLogo.svg";
import menu_list from "./assets/menu_list.svg";
import menu_grid from "./assets/menu_grid.svg";

// Manage 페이지는 나중에 만들 예정이므로 임시로 생성
const Manage = () => <div className="p-8 text-center">구독 관리 페이지 준비 중...</div>;

function Navigation() {
  const location = useLocation();
  
  // 현재 위치에 따라 메뉴 아이콘 색상을 변경하는 로직
  const activeClass = (path: string) => 
    location.pathname === path ? "text-primary font-bold" : "text-gray-400";

  return (
    <nav className="flex justify-between items-center px-8 py-2 bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <img src={logo} alt="logo" className="w-18 h-12" />
        <div className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-md">checked</div>
      </div>
      <div className="flex gap-8 text-sm">
        <Link to="/" className={`flex items-center gap-1 ${activeClass('/')}`}>
          <span><img src={menu_grid} alt="logo" className="w-[22px] h-[22px]" /></span> 대시보드
        </Link>
        <Link to="/manage" className={`flex items-center gap-1 ${activeClass('/manage')}`}>
          <span><img src={menu_list} alt="logo" className="w-[22px] h-[22px]" /></span> 구독 관리
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