import { useSubscriptions } from '../hooks/useSubscriptions';

const Manage = () => {
  const { subscriptions, deleteSubscription } = useSubscriptions();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold">구독 관리</h2>
          <p className="text-gray-500 text-sm">총 {subscriptions.length}개의 구독 - 월 { /*합계*/ }원</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-dark transition-colors">
          + 구독 추가
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative group">
            <div className="flex justify-between items-start mb-2">
              <span className="bg-teal-50 text-teal-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{sub.category}</span>
              <button 
                onClick={() => deleteSubscription(sub.id)}
                className="text-gray-300 hover:text-red-500 transition-colors"
              >
                🗑️
              </button>
            </div>
            <h3 className="text-lg font-bold mb-4">{sub.name}</h3>
            <div className="text-2xl font-black text-primary mb-1">
              {(sub.price / sub.sharedPeople).toLocaleString()}원
            </div>
            <div className="text-[10px] text-gray-400">전체 {sub.price.toLocaleString()}원 / {sub.sharedPeople}명 공유</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Manage;