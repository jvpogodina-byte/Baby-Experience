import Link from "next/link";

const links = [
  { href: "/", label: "Главная" },
  { href: "/categories", label: "Подборки" }
];

export function SiteHeader() {
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">B</span>
          <span>Baby Experience</span>
        </Link>
        <nav className="nav" aria-label="Главная навигация">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
