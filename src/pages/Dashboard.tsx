import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { Subscription } from '../types';


// 임시 Mock 데이터
const MOCK_DATA: Subscription[] = [
  { id: '1', name: 'Netflix', price: 17000, billingDate: 15, category: 'OTT', sharedPeople: 4, usageLevel: 40 },
  { id: '2', name: 'Disney+', price: 10900, billingDate: 20, category: 'OTT', sharedPeople: 2, usageLevel: 25 },
  { id: '3', name: 'Spotify', price: 10900, billingDate: 15, category: '음악', sharedPeople: 1, usageLevel: 95 },
  { id: '4', name: 'Wave', price: 13900, billingDate: 7, category: 'OTT', sharedPeople: 1, usageLevel: 30 },
];

const COLORS = ['#14B8A6', '#2DD4BF', '#99F6E4', '#CCFBF1'];

const Dashboard = () => {
  // 1. 월 총액 계산 (실질 지출액 합계)
  const monthlyTotal = useMemo(() =>
    MOCK_DATA.reduce((acc, sub) => acc + (sub.price / sub.sharedPeople), 0)
    , []);

  // 2. 카테고리별 데이터 변환 (차트용)
  const chartData = useMemo(() => {
    const categories = MOCK_DATA.reduce<Record<string, number>>((acc, sub) => {
      acc[sub.category] = (acc[sub.category] || 0) + (sub.price / sub.sharedPeople);
      return acc;
    }, {});

    return Object.keys(categories).map(key => ({
      name: key,
      value: categories[key]
    }));
  }, []);

  // 3. 엣지케이스: OTT 중복 구독 체크
  const ottCount = MOCK_DATA.filter(s => s.category === 'OTT').length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      {/* 경고 배너 */}
      {ottCount >= 3 && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center gap-3 text-orange-700 shadow-sm">
          <span className="text-xl">⚠️</span>
          <p>잠깐! OTT를 {ottCount}개나 구독중이시네요. <br/>하나를 줄이면 연간 약 110,400원을 아낄 수 있어요!</p>
        </div>
      )}

      {/* 요약 카드 */}
      <div className="bg-teal-600 p-8 rounded-3xl text-white shadow-lg">
        <h2 className="text-lg opacity-90">영님은 이번 달</h2>
        <div className="text-4xl font-bold my-2">
          {monthlyTotal.toLocaleString()}원 <span className="text-xl font-normal opacity-80">을 구독 중이에요!</span>
        </div>
        <p className="text-teal-100 mt-2 italic">↳ 연간 환산: {(monthlyTotal * 12).toLocaleString()}원</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 차트 섹션 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4">카테고리별 지출</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} outerRadius={80} dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 결제 예정 목록 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4">곧 결제될 서비스 목록</h3>
          <div className="space-y-4">
            {MOCK_DATA.map(sub => (
              <div key={sub.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div>
                  <div className="font-semibold">{sub.name}</div>
                  <div className="text-xs text-teal-600">{sub.billingDate}일 결제</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">{(sub.price / sub.sharedPeople).toLocaleString()}원</div>
                  <div className="text-xs text-gray-400">D-7 (예시)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 가성비 알림 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-red-500 font-bold">
          <span>🚨</span> 이 서비스, 정말 쓰고 계신가요?
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_DATA.filter(s => s.usageLevel <= 30).map(sub => (
            <div key={sub.id} className="bg-red-50 p-4 rounded-2xl border border-red-100">
              <div className="font-bold text-red-800">{sub.name}</div>
              <div className="text-sm text-red-600 opacity-80">이용률 {sub.usageLevel}%</div>
              <div className="text-xs text-red-500 mt-1 font-medium">해지하면 연간 {((sub.price / sub.sharedPeople) * 12).toLocaleString()}원 절약</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;