import { useState } from 'react';
import type { Subscription } from '../types';

export const useSubscriptions = () => {
  // useState의 인자로 함수를 전달하여 초기 렌더링 시에만 localStorage를 읽기
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const savedData = localStorage.getItem('guddok_data');
    return savedData ? JSON.parse(savedData) : [];
  });

  // 데이터 저장 로직 (상태 업데이트와 로컬 스토리지 저장을 동시에 처리)
  const saveSubscriptions = (newData: Subscription[]) => {
    setSubscriptions(newData);
    localStorage.setItem('guddok_data', JSON.stringify(newData));
  };

  const addSubscription = (sub: Subscription) => {
    const newData = [...subscriptions, sub];
    saveSubscriptions(newData);
  };

  const deleteSubscription = (id: string) => {
    const newData = subscriptions.filter((s) => s.id !== id);
    saveSubscriptions(newData);
  };

  const updateSubscription = (updatedSub: Subscription) => {
    const newData = subscriptions.map((s) => (s.id === updatedSub.id ? updatedSub : s));
    saveSubscriptions(newData);
  };

  return {
    subscriptions,
    addSubscription,
    deleteSubscription,
    updateSubscription,
  };
};