export type TrackedRoute = {
  path: string;
  routeType: "home" | "categories" | "category" | "item" | "other";
  routeSlug?: string;
  routeLabel?: string;
};

export function getTrackedRoute(pathname: string): TrackedRoute | null {
  if (!pathname.startsWith("/")) {
    return null;
  }

  if (pathname === "/") {
    return {
      path: pathname,
      routeType: "home",
      routeLabel: "Главная"
    };
  }

  if (pathname === "/categories") {
    return {
      path: pathname,
      routeType: "categories",
      routeLabel: "Подборки"
    };
  }

  const categoryMatch = pathname.match(/^\/categories\/([^/]+)$/);
  if (categoryMatch) {
    return {
      path: pathname,
      routeType: "category",
      routeSlug: categoryMatch[1],
      routeLabel: categoryMatch[1]
    };
  }

  const itemMatch = pathname.match(/^\/items\/([^/]+)$/);
  if (itemMatch) {
    return {
      path: pathname,
      routeType: "item",
      routeSlug: itemMatch[1],
      routeLabel: itemMatch[1]
    };
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api") || pathname.startsWith("/login") || pathname.startsWith("/dashboard")) {
    return null;
  }

  return {
    path: pathname,
    routeType: "other",
    routeLabel: pathname
  };
}
