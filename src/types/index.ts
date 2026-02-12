export type Category =
  | '쇼핑'
  | '콘텐츠'
  | '생활'
  | '교육'
  | '렌탈'
  | '기타';

export interface Subscription {
  id: string;
  name: string;
  price: number;       // 전체 요금
  billingDate: number; // 결제일 (1~31)
  category: '쇼핑' | '콘텐츠' | '생활' | '교육' | '렌탈' | '기타';  
  sharedPeople: number; // 공유 인원
  usageLevel: number;   // 이용률 (0~100)
}