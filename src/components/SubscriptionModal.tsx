import { useState } from 'react';
import type { Subscription, Category } from '../types';
import { trackEvent } from '../utils/analytics';

//구독 종류 옵션
const FORM_CATEGORIES: Category[] = ['쇼핑', '콘텐츠', '생활', '교육', '렌탈', '기타'];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (sub: Subscription) => void;
    editingSub?: Subscription | null;
    subscriptions: Subscription[];
}

const SubscriptionModal = ({ isOpen, onClose, onSubmit, editingSub, subscriptions }: Props) => {
    // 초기 상태 정의
    const initialState: Omit<Subscription, 'id'> = {
        name: '',
        price: 0,
        billingDate: 1,
        category: '쇼핑',
        sharedPeople: 1,
        usageLevel: 50,
    };

    //초기값 데이터 결정
    const [formData, setFormData] = useState<Omit<Subscription, 'id'>>(
        editingSub ? { ...editingSub } : initialState
    );

    if (!isOpen) return null;

    // 인원 조절 핸들러
    const handlePeopleChange = (val: number) => {
        setFormData(prev => ({ ...prev, sharedPeople: Math.max(1, prev.sharedPeople + val) }));
    };

    const actualPrice = Math.floor(formData.price / formData.sharedPeople);

    const handleFormSubmit = () => {
        const { name, price, billingDate } = formData;

        // 필수 입력 체트
        if (!name.trim() || !price) {
            alert("서비스명과 월 요금은 필수 입력 항목입니다!");
            return;
        }

        // 결제 일자 범위 제한 (1~31)
        if (billingDate < 1 || billingDate > 31) {
            alert("결제일은 1일에서 31일 사이로 입력해주세요.");
            return;
        }
        if (price < 0) {
            alert("금액은 0원 이상이어야 합니다.");
            return;
        }

        // 서비스명 중복시 경고
        const isDuplicate = subscriptions.some(sub =>
            sub.name.toLowerCase() === name.trim().toLowerCase() && sub.id !== editingSub?.id
        );

        if (isDuplicate) {
            const proceed = window.confirm(`이미 '${name}' 서비스가 등록되어 있습니다. 추가로 등록하시겠습니까?`);
            if (!proceed) return;
        }

        trackEvent('subscription_submit', {
            category: formData.category,
            price: formData.price
        });

        onSubmit({
            ...formData,
            id: editingSub?.id || Date.now().toString()
        } as Subscription);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-[440px] rounded-[32px] p-6 md:p-10 space-y-7 shadow-2xl relative max-h-[94vh] overflow-y-auto">
                <button onClick={() => {
                    trackEvent('edit_modal_close_without_submit');
                    onClose();
                }} className="absolute right-6 top-6 text-gray-400 text-2xl">✕</button>

                <h2 className="text-2xl font-bold text-gray-900">{editingSub ? '구독 수정' : '구독 추가'}</h2>

                <div className="space-y-5">
                    {/* 서비스명 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">서비스명</label>
                        <input
                            type="text"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all"
                            placeholder="Netflex, Wave 등"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* 월 요금 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">월 요금 (원)</label>
                        <input
                            type="number"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                            value={formData.price || ''}
                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">결제일</label>
                            <input
                                type="number" min="1" max="31"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                                value={formData.billingDate}
                                onChange={e => setFormData({ ...formData, billingDate: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">카테고리</label>
                            <select
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none appearance-none cursor-pointer"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                            >
                                {FORM_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <label className="text-sm font-medium text-gray-500 block text-center font-bold">공유 인원</label>
                        <div className="flex items-center justify-between bg-white px-2">
                            <button
                                type="button"
                                onClick={() => handlePeopleChange(-1)}
                                className="w-12 h-12 flex items-center justify-center border-2 border-gray-100 rounded-xl text-2xl font-bold text-gray-400 hover:bg-gray-50 transition-colors"
                            >-</button>
                            <span className="text-3xl font-bold text-primary">{formData.sharedPeople}명</span>
                            <button
                                type="button"
                                onClick={() => handlePeopleChange(1)}
                                className="w-12 h-12 flex items-center justify-center border-2 border-gray-100 rounded-xl text-2xl font-bold text-gray-400 hover:bg-gray-50 transition-colors"
                            >+</button>
                        </div>
                    </div>

                    <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl space-y-1">
                        <span className="text-[13px] font-medium text-emerald-600/70">실질 지출 금액</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-primary">{actualPrice.toLocaleString()}원</span>
                            <span className="text-xs text-gray-400 font-medium">(원가의 1/{formData.sharedPeople})</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-500 flex justify-between">
                            <span>이용률(가성비) : {formData.usageLevel}%</span>
                        </label>
                        <input
                            type="range"
                            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                            value={formData.usageLevel}
                            onChange={e => setFormData({ ...formData, usageLevel: Number(e.target.value) })}
                        />
                        <div className="flex justify-between text-[11px] text-gray-400 font-bold">
                            <span>거의 안씀</span>
                            <span>매일 사용</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleFormSubmit}
                    className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg hover:brightness-95 transition-all shadow-lg shadow-gray-300 active:scale-[0.98]"
                >
                    {editingSub ? '수정 완료' : '등록하기'}
                </button>
            </div>
        </div>
    );
};

export default SubscriptionModal;