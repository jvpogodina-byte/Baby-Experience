import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SavedListsDashboard } from "@/components/saved-lists-dashboard";
import { SignOutButton } from "@/components/sign-out-button";
import { authOptions } from "@/lib/auth";
import { MVP_USER_FEATURES } from "@/lib/feature-flags";
import { getSavedListsForUser } from "@/lib/saved-lists";

export default async function DashboardPage() {
  if (!MVP_USER_FEATURES.userDashboard) {
    redirect("/");
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = session.user;
  const savedLists = await getSavedListsForUser(user.id);

  return (
    <main className="detail-hero">
      <div className="container">
        <div className="detail-header">
          <span className="eyebrow">Личный кабинет</span>
          <h1 className="section-title">Сохранённые вещи и списки</h1>
          <p className="section-copy">
            Вы вошли как {user.name || user.email}. Здесь хранятся ваши личные списки: они видны только
            вашему аккаунту.
          </p>
          <div className="badge-row">
            <span className="badge">{user.email}</span>
            <span className="badge">Роль: {user.role}</span>
            <SignOutButton />
          </div>
        </div>

        <section className="admin-panel">
          <SavedListsDashboard lists={savedLists} />
        </section>
      </div>
    </main>
  );
}
