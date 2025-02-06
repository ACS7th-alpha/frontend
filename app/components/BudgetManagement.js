'use client';
import React, { useState } from 'react';

export default function BudgetManagement({ onBack }) {
  const [budget, setBudget] = useState(990000);
  const [categories, setCategories] = useState([
    { name: '기저귀/물티슈', spent: 240000, budget: 200000 },
    { name: '생활/위생용품', spent: 240000, budget: 200000 },
    { name: '수유/이유용품', spent: 240000, budget: 200000 },
  ]);

  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remainingBudget = budget - totalSpent;
  const usagePercentage = ((totalSpent / budget) * 100).toFixed(0);

  return (
    <div className="p-10 max-w-4xl mx-auto">
      {/* 뒤로 가기 버튼 */}
      <button onClick={onBack} className="bg-gray-300 p-2 rounded mb-6">
        뒤로 가기
      </button>

      {/* 📅 월 타이틀 */}
      <h2 className="text-3xl font-bold text-center mb-6">📅 2025년 02월</h2>

      {/* ✅ 당월 예산 입력 필드 (분리된 영역) */}
      <div className="bg-gray-100 p-5 rounded-lg shadow flex items-center space-x-4">
        <span className="font-semibold text-lg w-1/4 text-left">
          💰 당월 예산:
        </span>
        <input
          type="text"
          className="border rounded px-3 py-1 text-right w-1/6 text-lg font-semibold"
          value={budget.toLocaleString()}
          onChange={(e) => setBudget(Number(e.target.value.replace(/,/g, '')))}
        />
        <span className="ml-2 font-semibold text-lg">원</span>
      </div>

      {/* ✅ 예산 상태 바 (분리된 영역) */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">예산 사용 현황</h3>

        {/* 예산 막대 바 */}
        <div className="relative bg-gray-300 h-6 rounded-lg">
          <div
            className="absolute h-full bg-blue-400 rounded-lg"
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>

        {/* 예산 사용 금액 및 잔액 */}
        <div className="flex justify-between text-sm text-gray-700 mt-2">
          <span className="text-blue-600 font-semibold">
            {totalSpent.toLocaleString()}원
          </span>
          <span className="text-gray-700">{`${usagePercentage}%`}</span>
          <span
            className={`font-semibold ${
              remainingBudget < 0 ? 'text-red-500' : 'text-gray-700'
            }`}
          >
            {remainingBudget.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* ✅ 카테고리별 예산 사용 */}
      <div className="mt-8 space-y-6">
        {categories.map((item, index) => (
          <div
            key={index}
            className="p-5 bg-gray-100 rounded-lg shadow flex items-center space-x-4"
          >
            {/* 카테고리 이름 */}
            <span className="w-1/4 font-bold text-lg text-left">
              {item.name}
            </span>

            {/* 사용 금액 입력 */}
            <input
              type="text"
              className="border rounded px-3 py-1 text-right w-1/6 text-lg font-semibold"
              defaultValue={item.spent.toLocaleString()}
            />

            {/* 예산 막대 그래프 */}
            <div className="relative bg-gray-300 h-6 flex-1 mx-4 rounded">
              <div
                className={`absolute h-full ${
                  item.spent > item.budget ? 'bg-red-400' : 'bg-gray-400'
                } rounded`}
                style={{ width: `${(item.spent / item.budget) * 100}%` }}
              ></div>
            </div>

            {/* 예산 값 입력 */}
            <input
              type="text"
              className="border rounded px-3 py-1 text-right w-1/6 text-lg font-semibold"
              defaultValue={item.budget.toLocaleString()}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
