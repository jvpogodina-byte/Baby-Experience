import Link from "next/link";

export default function NotFound() {
  return (
    <main className="detail-hero">
      <div className="container" style={{ maxWidth: "760px" }}>
        <section className="auth-card">
          <span className="eyebrow">Не найдено</span>
          <h1 className="section-title">Такой страницы пока нет</h1>
          <p>Проверьте адрес или вернитесь на главную, чтобы открыть каталог вещей.</p>
          <Link className="button" href="/">
            На главную
          </Link>
        </section>
      </div>
    </main>
  );
}

