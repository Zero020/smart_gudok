import { useState } from 'react';
import { useSubscriptions } from '../hooks/useSubscriptions';
import SubscriptionModal from '../components/SubscriptionModal';
import type { Subscription } from '../types';
import icon_trash from "..//assets/icon_trash.svg";
import icon_edit from "..//assets/icon_edit.svg";
import { trackEvent } from '../utils/analytics';

// 카테고리 목록(필터용)
const CATEGORIES = ['전체', '쇼핑', '콘텐츠', '생활', '교육', '렌탈', '기타'];

const Manage = () => {
  const { subscriptions, addSubscription, deleteSubscription, updateSubscription } = useSubscriptions();
  const [filter, setFilter] = useState('전체');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  // 필터링 로직
  const filteredSubs = subscriptions.filter(sub =>
    filter === '전체' ? true : sub.category === filter
  );

  //등록/수정 모달 핸들러
  const handleOpenAdd = () => {
    trackEvent('add_subscription_click');
    setEditingSub(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setIsModalOpen(true);
  };

  const handleSubmit = (sub: Subscription) => {
    if (editingSub) updateSubscription(sub);
    else addSubscription(sub);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    // 브라우저 기본 확인 창 호출
    const isConfirmed = window.confirm(`'${name}' 구독을 정말 삭제하시겠습니까?`);

    if (isConfirmed) {
      trackEvent('delete_subscription');
      deleteSubscription(id);
    }
  };

  // 이용률 바 색상 결정 로직
  const getUsageColor = (level: number) => {
    if (level <= 40) return 'bg-red-400';    // 40% 이하: 빨강(거의 안씀)
    if (level <= 70) return 'bg-yellow-400'; // 70% 이하: 노랑(보통)
    return 'bg-primary';                    // 100%까지: 청록/민트 (자주 사용)
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 bg-gray-50 min-h-screen">
      {/* 헤더 섹션 */}
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-gray-900">구독 관리</h2>
        <p className="text-gray-400 text-xl font-semibold">
          총 {subscriptions.length}개의 구독 - 월 {subscriptions.reduce((acc, s) => acc + (s.price / s.sharedPeople), 0).toLocaleString()}원
        </p>
      </div>

      {/* 필터 및 추가 버튼 */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => {
                trackEvent('category_filter_change', { category: cat });
                setFilter(cat);
              }}
              className={`hover:scale-102 cursor-pointer px-6 py-2 rounded-lg text-sm font-medium transition-all border ${filter === cat
                ? 'bg-primary text-white stroke-1'
                : 'bg-white text-gray-400 hover:border-[rgba(16,170,144,0.5)] border-gray-300'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-primary text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-gray-200 hover:scale-105 transition-all"
        >
          <span className="text-lg">+</span> 구독 추가
        </button>
      </div>

      {/* 구독 카드 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubs.map(sub => (
          <div key={sub.id} className="bg-white p-7 rounded-xl shadow-sm border border-gray-50 flex flex-col justify-between hover:shadow-md transition-shadow relative">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="bg-teal-50 text-primary text-xs px-2.5 py-1 rounded-lg font-bold">
                  {sub.category}
                </span>
                <div className="flex gap-3">
                  <button onClick={() => handleOpenEdit(sub)} className="opacity-40 hover:opacity-100 transition-opacity">
                    <img src={icon_edit} alt="edit" className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(sub.id, sub.name)} className="opacity-40 hover:opacity-100 transition-opacity">
                    <img src={icon_trash} alt="delete" className="w-5 h-5" />
                    {/* 아이콘 파일이 없다면 '🗑' 로 대체 가능 */}
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-gray-800 mb-1">{sub.name}</h3>

              <div className="flex items-baseline gap-2 mt-4 justify-between">
                <span className="text-3xl font-black text-primary">
                  {(sub.price / sub.sharedPeople).toLocaleString()}원
                </span>
                <span className="text-[13px] text-gray-400 font-medium">{sub.sharedPeople}명 공유</span>
              </div>

              <div className="text-[13px] text-gray-400 mt-1 flex justify-between">
                <span>전체 {sub.price.toLocaleString()}원</span>
                <span className="font-bold">매달 {sub.billingDate}일 결제</span>
              </div>
            </div>

            {/* 이용률 프로그레스 바*/}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[13px] text-gray-400 font-medium">이용률</span>
                <span className="text-[13px] text-gray-400 font-bold">{sub.usageLevel}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getUsageColor(sub.usageLevel)}`}
                  style={{ width: `${sub.usageLevel}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <SubscriptionModal
        key={isModalOpen ? (editingSub?.id || 'new') : 'closed'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        editingSub={editingSub}
        subscriptions={subscriptions}
      />
    </div>
  );
};

export default Manage;