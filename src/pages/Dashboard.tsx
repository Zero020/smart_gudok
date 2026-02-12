import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Subscription } from '../types';
import { useSubscriptions } from '../hooks/useSubscriptions';

const COLORS = ['#14B8A6', '#2DD4BF', '#99F6E4', '#CCFBF1'];

const Dashboard = () => {
  const { subscriptions } = useSubscriptions();

  // 1. 월 총액 계산 (실제 데이터 기반)
  const monthlyTotal = useMemo(() =>
    subscriptions.reduce((acc, sub) => acc + (sub.price / sub.sharedPeople), 0)
    , [subscriptions]);

  // 2. 카테고리별 데이터 변환
  const chartData = useMemo(() => {
    const categories = subscriptions.reduce<Record<string, number>>((acc, sub) => {
      acc[sub.category] = (acc[sub.category] || 0) + (sub.price / sub.sharedPeople);
      return acc;
    }, {});

    return Object.keys(categories).map(key => ({
      name: key,
      value: categories[key]
    }));
  }, [subscriptions]);

  // 3. 엣지케이스 및 정렬 로직
  const ottCount = subscriptions.filter(s => s.category === 'OTT').length;

  // 결제일이 가까운 순으로 정렬 (오늘 날짜 기준)
  const sortedSubs = useMemo(() => {
    const today = new Date().getDate();
    return [...subscriptions].sort((a, b) => {
      const diffA = a.billingDate >= today ? a.billingDate - today : a.billingDate + 30 - today;
      const diffB = b.billingDate >= today ? b.billingDate - today : b.billingDate + 30 - today;
      return diffA - diffB;
    });
  }, [subscriptions]);

  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-gray-400 h-[80vh]">
        <div className="text-6xl mb-4">💳</div>
        <p className="text-lg">등록된 구독 서비스가 없어요.</p>
        <p className="text-sm">'구독 관리' 탭에서 첫 서비스를 등록해 보세요!</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      {/* 엣지 케이스: 중복 구독 경고 배너 */}
      {ottCount >= 3 && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center gap-3 text-orange-700 shadow-sm animate-pulse">
          <span className="text-xl">⚠️</span>
          <p className="text-sm font-medium">
            잠깐! OTT를 {ottCount}개나 구독중이시네요. <br/>
            불필요한 중복 구독을 정리하면 연간 약 <span className="font-bold text-orange-800">110,400원</span>을 아낄 수 있어요!
          </p>
        </div>
      )}

      {/* 메인 요약 카드 */}
      <div className="bg-teal-600 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-lg opacity-90 font-medium">영님은 이번 달</h2>
          <div className="text-4xl font-bold my-2">
            {monthlyTotal.toLocaleString()}원 <span className="text-xl font-normal opacity-80 text-teal-100">을 구독 중이에요!</span>
          </div>
          <p className="text-teal-200 mt-2 text-sm">↳ 연간 환산: {(monthlyTotal * 12).toLocaleString()}원</p>
        </div>
        {/* 디자인 포인트: 배경에 큰 원형 패턴 */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-teal-500 rounded-full opacity-20"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 차트 섹션 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h3 className="w-full font-bold text-gray-700 mb-4">카테고리별 지출</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={chartData} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 결제 예정 목록 (실제 데이터 + 정렬 반영) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4">곧 결제될 서비스 목록</h3>
          <div className="space-y-4 max-h-[260px] overflow-y-auto pr-2">
            {sortedSubs.map(sub => {
              const today = new Date().getDate();
              const dDay = sub.billingDate >= today ? sub.billingDate - today : sub.billingDate + 30 - today;
              
              return (
                <div key={sub.id} className="flex justify-between items-center p-3 hover:bg-teal-50 rounded-xl transition-all border border-transparent hover:border-teal-100">
                  <div>
                    <div className="font-semibold text-gray-800">{sub.name}</div>
                    <div className="text-xs text-teal-600 font-medium">{sub.billingDate}일 결제</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{(sub.price / sub.sharedPeople).toLocaleString()}원</div>
                    <div className="text-xs font-bold text-teal-500">{dDay === 0 ? '오늘 결제' : `${dDay}일 후`}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 하단 가성비 알림 (이용률 30% 이하인 실제 데이터) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-red-500 font-bold ml-2">
          <span className="animate-bounce">🚨</span> 이 서비스, 정말 쓰고 계신가요?
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscriptions.filter(s => s.usageLevel <= 30).length > 0 ? (
            subscriptions.filter(s => s.usageLevel <= 30).map(sub => (
              <div key={sub.id} className="bg-red-50 p-5 rounded-2xl border border-red-100 group hover:shadow-md transition-shadow">
                <div className="font-bold text-red-800 text-lg">{sub.name}</div>
                <div className="flex justify-between items-end mt-2">
                  <div className="text-sm text-red-600 font-medium italic">이용률 {sub.usageLevel}%</div>
                  <div className="text-xs text-red-500 font-bold bg-white px-2 py-1 rounded-lg">
                    해지하면 연간 {((sub.price / sub.sharedPeople) * 12).toLocaleString()}원 절약
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-6 bg-blue-50 rounded-2xl text-center text-blue-600 text-sm border border-blue-100">
              와우! 모든 서비스를 알차게 이용하고 계시네요. 🎉
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;