// UI Component: HomeHero
import type { FC } from 'react';

export const HomeHero: FC = () => (
  <section className="rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-400 text-white p-8 shadow mb-8 flex flex-col items-center">
    <h1 className="text-4xl font-bold mb-2">Chào mừng đến với E-Commerce!</h1>
    <p className="text-lg mb-4">Nền tảng thương mại điện tử hiện đại, AI, microservices, mở rộng dễ dàng.</p>
    <a href="/products" className="px-6 py-2 rounded-full bg-white text-indigo-600 font-semibold shadow hover:bg-gray-100 transition">Khám phá ngay</a>
  </section>
);
