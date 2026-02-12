import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Manage from './pages/Management';
import logo from "./assets/mainLogo.svg";
import menu_list from "./assets/menu_list.svg";
import menu_grid from "./assets/menu_grid.svg";


function Navigation() {
  const location = useLocation();
  
  // 현재 위치에 따라 텍스트와 아이콘의 활성화 상태를 결정
  const isActive = (path: string) => location.pathname === path;
  const activeClass = (path: string) => 
    isActive(path) ? "text-primary font-bold" : "text-gray-400";

  return (
    <nav className="flex justify-between items-center px-8 py-2 bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <img src={logo} alt="logo" className="w-18 h-12" />
        <div className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">checked</div>
      </div>
      <div className="flex gap-8 text-sm">
        <Link to="/" className={`flex items-center gap-1.5 transition-colors ${activeClass('/')}`}>
          <img 
            src={menu_grid} 
            alt="dashboard" 
            className={`w-[22px] h-[22px] ${isActive('/') ? '' : 'opacity-40'}`} 
          />
          대시보드
        </Link>
        <Link to="/manage" className={`flex items-center gap-1.5 transition-colors ${activeClass('/manage')}`}>
          <img 
            src={menu_list} 
            alt="manage" 
            className={`w-[22px] h-[22px] ${isActive('/manage') ? '' : 'opacity-40'}`} 
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