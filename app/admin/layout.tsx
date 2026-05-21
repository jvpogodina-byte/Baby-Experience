import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <>
      <div className="admin-nav-wrap">
        <div className="container admin-nav">
          <Link href="/admin">Обзор</Link>
          <Link href="/admin/analytics">Аналитика</Link>
          <Link href="/admin/categories">Категории</Link>
          <Link href="/admin/items">Вещи</Link>
          <Link href="/admin/comments">Комментарии</Link>
        </div>
      </div>
      {children}
    </>
  );
}
