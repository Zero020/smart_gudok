export interface Subscription {
  id: string;
  name: string;
  price: number;       // 전체 요금
  billingDate: number; // 결제일 (1~31)
  category: 'OTT' | '음악' | '클라우드' | '생산성';
  sharedPeople: number; // 공유 인원
  usageLevel: number;   // 이용률 (0~100)
}