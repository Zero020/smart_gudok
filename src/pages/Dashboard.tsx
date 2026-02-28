import { useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Subscription } from '../types';
import { useSubscriptions } from '../hooks/useSubscriptions';
import icon_alert from "..//assets/icon_alert.svg";
import icon_alert_yellow from "..//assets/icon_alert_yellow.svg";
import icon_down from "..//assets/icon_down.svg";
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';

const COLORS = ['#14B8A6', '#2DD4BF', '#85CFC2', '#4BB09F', '#1C8674', '#B9E4DD'];

const Dashboard = () => {
  useEffect(() => {
    trackEvent('home_view');
  }, []);

  const { subscriptions } = useSubscriptions();
  const navigate = useNavigate();
  // 1. 월 총액 계산
  const monthlyTotal = useMemo(() =>
    subscriptions.reduce((acc, sub) => acc + (sub.price / (sub.sharedPeople || 1)), 0)
    , [subscriptions]);

  const duplicateInfo = useMemo(() => {
    const counts: Record<string, number> = {};
    subscriptions.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });

    // 2개 이상 구독 중인 카테고리들 중 가장 많이 구독하는 것 찾기
    const maxCategory = Object.entries(counts)
      .filter(([, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])[0];

    if (!maxCategory) return null;

    const [catName, count] = maxCategory;
    const targetSubs = subscriptions.filter(s => s.category === catName);

    // 가장 비싼 것 하나 제외하고 나머지 월 합계 -> 연간 절약액
    const sortedPrices = targetSubs
      .map(s => s.price / (s.sharedPeople || 1))
      .sort((a, b) => b - a);
    const savings = sortedPrices.slice(1).reduce((acc, curr) => acc + curr, 0) * 12;

    return { catName, count, savings };
  }, [subscriptions]);

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
      {duplicateInfo && (
        <div onClick={() => {
          trackEvent('duplicate_banner_click', {
            category: duplicateInfo.catName,
          });
          trackEvent('banner_to_manage_move');
          navigate('/manage', {
            state: { filterCategory: duplicateInfo.catName }
          });
        }}
          className="cursor-pointer animate-pulse bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center gap-3 text-[#F6B74E] shadow-sm">
          <span className="text-xl"><img src={icon_alert_yellow} alt="alert" className="w-5 h-5" /></span>
          <p className="text-sm font-bold">
            잠깐! {duplicateInfo.catName}구독을 {duplicateInfo.count}개나 이용 중이시네요. <br />
            <span className="font-medium text-[#958F84] text-[13px]">불필요한 중복을 정리하면 연간 최대 {duplicateInfo.savings.toLocaleString()}원을 아낄 수 있어요!</span>
          </p>
        </div>
      )}

      {/* 메인 요약 카드 */}
      <div className="bg-gradient-to-b from-[#13B69A] to-[#0E9D87] 
drop-shadow-[0_5px_20px_rgba(0,0,0,0.15)] p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl opacity-90 font-bold">영님은 이번 달</h2>
          <div className="text-4xl font-bold my-2">
            {monthlyTotal.toLocaleString()}원 <span className="text-xl font-normal opacity-60 text-white
">을 구독 중이에요!</span>
          </div>
          <p className="flex items-center gap-2 text-white  opacity-60 mt-2 text-sm font-medium">
            <img src={icon_down} alt="alert" className="w-5 h-5" />
            연간 환산: {(monthlyTotal * 12).toLocaleString()}원
          </p>        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-teal-500 rounded-full opacity-20"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 차트 섹션 - 원형 차트 및 범례 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h3 className="w-full font-bold text-gray-700 mb-4 ml-2">카테고리별 지출 비율</h3>
          <div className="w-full h-64">
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4 ml-2">곧 결제될 구독</h3>
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
            {typedSortedSubs.map(sub => {
              const today = new Date().getDate();
              const dDay = sub.billingDate >= today ? sub.billingDate - today : sub.billingDate + 30 - today;

              return (
                <div key={sub.id} className="flex justify-between items-center py-3 px-4 hover:bg-teal-50 rounded-2xl transition-all border border-transparent hover:border-teal-100 bg-gray-50/50">
                  <div>
                    <div className="font-normal text-gray-800">{sub.name}</div>
                    <div className="text-[13px] text-primary font-normal py-0.5 inline-block mt-1">
                      {sub.billingDate}일 결제
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-gray-900 font-normal">{(sub.price / sub.sharedPeople).toLocaleString()}원</div>
                    <div className={`text-[13px] font-normal mt-1 ${dDay === 0 ? 'text-red-500' : 'text-primary'}`}>
                      {dDay === 0 ? '오늘 결제 ♨' : `${dDay}일 후`}
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
        <div className="flex items-center gap-2 text-red-500 font-normal ml-2">
          <span className="animate-bounce font-serif"><img src={icon_alert} alt="logo" className="w-5 h-5" /></span> 이 서비스, 정말 쓰고 계신가요?
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subscriptions.filter(s => s.usageLevel <= 30).length > 0 ? (
            subscriptions.filter(s => s.usageLevel <= 30).map(sub => (
              <div key={sub.id} className="bg-red-50 p-5 rounded-2xl border border-red-100 group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="font-normal text-black-800 text-l ">{sub.name}</div>
                  <div className="text-[11px] font-normal text-red-500 bg-white px-2 py-1 rounded-full border border-red-200">
                    이용률 {sub.usageLevel}%
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-red-400 font-black">
                    <p>  <span className="text-black font-normal">해지하면 연간 </span>
                      {((sub.price / sub.sharedPeople) * 12).toLocaleString()}원<span className="text-black font-normal"> 절약 가능</span></p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-10 rounded-2xl text-left text-gray-400 border-2 border-dashed border-gray-100">
              와우, 모든 서비스를 알차게 구독 중이시군요!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;