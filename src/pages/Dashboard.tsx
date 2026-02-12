import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Subscription } from '../types'; // 1. 타입 사용 확인
import { useSubscriptions } from '../hooks/useSubscriptions';

const COLORS = ['#14B8A6', '#2DD4BF', '#99F6E4', '#CCFBF1', '#FDBA74', '#F9A8D4'];

const Dashboard = () => {
  const { subscriptions } = useSubscriptions();

  // 1. 월 총액 계산
  const monthlyTotal = useMemo(() =>
    subscriptions.reduce((acc, sub) => acc + (sub.price / (sub.sharedPeople || 1)), 0)
    , [subscriptions]);

  // 2. 카테고리별 데이터 변환
  const chartData = useMemo(() => {
    const categories = subscriptions.reduce<Record<string, number>>((acc, sub) => {
      // 카테고리명이 정확히 일치하도록 정리
      const cat = sub.category || '기타';
      acc[cat] = (acc[cat] || 0) + (sub.price / (sub.sharedPeople || 1));
      return acc;
    }, {});

    return Object.keys(categories).map(key => ({
      name: key,
      value: categories[key]
    }));
  }, [subscriptions]);

  // 3. 정렬 로직 (오늘 날짜 기준)
  const sortedSubs = useMemo(() => {
    const today = new Date().getDate();
    return [...subscriptions].sort((a, b) => {
      const getDiff = (date: number) => (date >= today ? date - today : date + 30 - today);
      return getDiff(a.billingDate) - getDiff(b.billingDate);
    });
  }, [subscriptions]);

  // 'Subscription' 미사용 경고 해결을 위한 명시적 타입 할당 (sortedSubs에 타입 부여)
  const typedSortedSubs: Subscription[] = sortedSubs;

  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-gray-400 h-[80vh]">
        <div className="text-6xl mb-4">💳</div>
        <p className="text-lg font-bold">등록된 구독 서비스가 없어요.</p>
        <p className="text-sm">'구독 관리' 탭에서 첫 서비스를 등록해 보세요!</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      {/* 엣지 케이스: 중복 구독 경고 배너 */}
      {subscriptions.filter(s => s.category === '콘텐츠').length >= 3 && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center gap-3 text-orange-700 shadow-sm animate-pulse">
          <span className="text-xl">⚠️</span>
          <p className="text-sm font-medium">
            잠깐! 콘텐츠 구독을 3개나 이용 중이시네요. <br />
            하나만 정리해도 연간 약 <span className="font-bold text-orange-800 text-base">110,400원</span>을 아낄 수 있어요!
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
          <p className="text-teal-200 mt-2 text-sm font-medium">↳ 연간 환산: {(monthlyTotal * 12).toLocaleString()}원</p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-teal-500 rounded-full opacity-20"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 차트 섹션 - 원형 차트 및 범례 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h3 className="w-full font-bold text-gray-700 mb-4 ml-2">카테고리별 지출 비율</h3>
          <div className="w-full h-64"> {/* 부모 컨테이너에 w-full 확보 */}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" align="center" />
                <Tooltip
                  formatter={(value) =>
                    `${Number(value ?? 0).toLocaleString()}원`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 결제 예정 목록 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4 ml-2">곧 결제될 구독</h3>
          <div className="space-y-4 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
            {typedSortedSubs.map(sub => {
              const today = new Date().getDate();
              const dDay = sub.billingDate >= today ? sub.billingDate - today : sub.billingDate + 30 - today;

              return (
                <div key={sub.id} className="flex justify-between items-center p-4 hover:bg-teal-50 rounded-2xl transition-all border border-transparent hover:border-teal-100 bg-gray-50/50">
                  <div>
                    <div className="font-bold text-gray-800">{sub.name}</div>
                    <div className="text-[11px] text-teal-600 font-bold bg-white px-2 py-0.5 rounded-lg border border-teal-100 inline-block mt-1">
                      {sub.billingDate}일 결제
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-gray-900">{(sub.price / sub.sharedPeople).toLocaleString()}원</div>
                    <div className={`text-xs font-bold mt-1 ${dDay === 0 ? 'text-red-500' : 'text-teal-500'}`}>
                      {dDay === 0 ? '오늘 결제 🔥' : `${dDay}일 후`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 가성비 알림 섹션 */}
      <div className="pt-4 space-y-4">
        <div className="flex items-center gap-2 text-red-500 font-bold ml-2">
          <span className="animate-bounce font-serif">🚨</span> 이 서비스, 정말 쓰고 계신가요?
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscriptions.filter(s => s.usageLevel <= 30).length > 0 ? (
            subscriptions.filter(s => s.usageLevel <= 30).map(sub => (
              <div key={sub.id} className="bg-red-50 p-5 rounded-3xl border border-red-100 group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="font-bold text-red-800 text-xl">{sub.name}</div>
                  <div className="text-[11px] font-bold text-red-500 bg-white px-2 py-1 rounded-full border border-red-200">
                    이용률 {sub.usageLevel}%
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-red-400 font-medium">낮은 가성비 탐지</span>
                  <div className="text-sm text-red-600 font-black">
                    연간 <span className="underline decoration-red-300 underline-offset-4">{((sub.price / sub.sharedPeople) * 12).toLocaleString()}원</span> 절약 가능
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-10 bg-white rounded-3xl text-center text-gray-400 border-2 border-dashed border-gray-100">
              모든 서비스를 알차게 구독 중입니다!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;