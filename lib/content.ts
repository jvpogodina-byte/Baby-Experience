export type Category = {
  slug: string;
  name: string;
  description: string;
  accent: string;
  hero: string;
};

export type ItemExample = {
  label: string;
  kind: "link" | "image" | "both";
  url?: string;
  imageUrl?: string;
  caption?: string;
};

export type Comment = {
  author: string;
  body: string;
  createdAt: string;
};

export type Item = {
  slug: string;
  title: string;
  summary: string;
  previewImageUrl?: string;
  categorySlugs: string[];
  featured?: boolean;
  example: ItemExample;
  examples?: ItemExample[];
  comments: Comment[];
};

export const categories: Category[] = [
  {
    slug: "for-baby",
    name: "Для малыша",
    description: "Базовые вещи, которые закрывают ежедневные потребности новорождённого.",
    accent: "sky",
    hero: "Спокойный и практичный старт"
  },
  {
    slug: "for-home",
    name: "Для дома",
    description: "Организация пространства, сон и повседневный быт.",
    accent: "sage",
    hero: "Дом, где всё под рукой"
  },
  {
    slug: "for-walks",
    name: "Для прогулок",
    description: "Коляска, переноска и полезные вещи для выходов из дома.",
    accent: "mint",
    hero: "Прогулки в удобном ритме"
  },
  {
    slug: "for-travel",
    name: "Для путешествий",
    description: "Поездки, роддом и вещи, которые помогают вне дома.",
    accent: "amber",
    hero: "Мобильность без лишнего стресса"
  },
  {
    slug: "for-mom",
    name: "Для мамы",
    description: "Уход, восстановление и комфорт в первые месяцы после родов.",
    accent: "rose",
    hero: "Поддержка и удобство для мамы"
  },
  {
    slug: "not-needed",
    name: "Антипокупки",
    description: "Вещи, которые я бы не относила к обязательным покупкам на старт.",
    accent: "sky",
    hero: "Без лишних покупок"
  },
  {
    slug: "premium",
    name: "Если бюджет не ограничен",
    description: "Необязательные, но приятные апгрейды для большего бытового комфорта.",
    accent: "mint",
    hero: "Когда хочется больше удобства"
  }
];

export const items: Item[] = [
  {
    slug: "baby-crib",
    title: "Кроватка без мягких бортиков",
    summary: "Простая кроватка без украшательств и лишнего мягкого текстиля.",
    categorySlugs: ["for-baby", "for-home"],
    featured: true,
    example: {
      label: "Что важно при выборе",
      kind: "link",
      caption: "Простая конструкция, без мягких бортиков и лишнего декора."
    },
    comments: []
  },
  {
    slug: "firm-mattress",
    title: "Жесткий матрас",
    summary: "Базовая вещь для кроватки, на которой лучше не экономить вниманием.",
    categorySlugs: ["for-baby", "for-home"],
    example: {
      label: "На что смотреть",
      kind: "link",
      caption: "Ровная поверхность и точное совпадение по размеру с кроваткой."
    },
    comments: []
  },
  {
    slug: "fitted-sheets",
    title: "Простыни на резинке",
    summary: "Удобный текстиль, который упрощает повседневную смену белья.",
    categorySlugs: ["for-baby", "for-home"],
    example: {
      label: "Практичный набор",
      kind: "link",
      caption: "Удобно иметь сразу несколько простыней в нужном размере."
    },
    comments: []
  },
  {
    slug: "blanket-for-stroller",
    title: "Плед для роддома и коляски",
    summary: "Универсальная вещь для выписки, дороги и прогулок.",
    categorySlugs: ["for-baby", "for-travel", "for-walks"],
    example: {
      label: "Где использовать",
      kind: "link",
      caption: "Для коляски, выписки и поездок, но не как постоянный текстиль для сна."
    },
    comments: []
  },
  {
    slug: "baby-bath",
    title: "Ванночка с горкой и термометром",
    summary: "Удобный стартовый набор для купания малыша дома.",
    categorySlugs: ["for-baby", "for-home"],
    featured: true,
    example: {
      label: "Ванночка как основа",
      kind: "image",
      url: "https://www.ozon.ru/search/?text=%D0%B2%D0%B0%D0%BD%D0%BD%D0%BE%D1%87%D0%BA%D0%B0%20%D1%81%20%D0%B3%D0%BE%D1%80%D0%BA%D0%BE%D0%B9%20%D0%B8%20%D1%82%D0%B5%D1%80%D0%BC%D0%BE%D0%BC%D0%B5%D1%82%D1%80%D0%BE%D0%BC",
      imageUrl:
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=80",
      caption: "Основное фото карточки может показывать сам формат вещи."
    },
    examples: [
      {
        label: "Ванночка как основа",
        kind: "image",
        url: "https://www.ozon.ru/search/?text=%D0%B2%D0%B0%D0%BD%D0%BD%D0%BE%D1%87%D0%BA%D0%B0%20%D1%81%20%D0%B3%D0%BE%D1%80%D0%BA%D0%BE%D0%B9%20%D0%B8%20%D1%82%D0%B5%D1%80%D0%BC%D0%BE%D0%BC%D0%B5%D1%82%D1%80%D0%BE%D0%BC",
        imageUrl:
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=80",
        caption: "Основное фото карточки может показывать сам формат вещи."
      },
      {
        label: "Wildberries: ванночка с горкой",
        kind: "link",
        url: "https://www.wildberries.ru/catalog/0/search.aspx?search=%D0%B2%D0%B0%D0%BD%D0%BD%D0%BE%D1%87%D0%BA%D0%B0%20%D1%81%20%D0%B3%D0%BE%D1%80%D0%BA%D0%BE%D0%B9",
        caption: "Поисковая ссылка на варианты ванночек с горкой."
      },
      {
        label: "Дополнительный ракурс",
        kind: "image",
        imageUrl:
          "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=80",
        caption: "Во всплывающей подсказке можно показать еще один ракурс или близкую деталь."
      },
      {
        label: "Деталь для объяснения",
        kind: "image",
        imageUrl:
          "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
        caption: "Здесь удобно объяснять, что именно важно: например, горку или встроенный термометр."
      }
    ],
    comments: []
  },
  {
    slug: "carrier",
    title: "Эргорюкзак или переноска",
    summary: "Помогает освободить руки и упростить короткие выходы из дома.",
    categorySlugs: ["for-baby", "for-travel", "for-walks"],
    featured: true,
    example: {
      label: "Основное фото переноски",
      kind: "image",
      url: "https://www.ozon.ru/search/?text=%D1%8D%D1%80%D0%B3%D0%BE%D1%80%D1%8E%D0%BA%D0%B7%D0%B0%D0%BA%20%D0%B4%D0%BB%D1%8F%20%D0%BD%D0%BE%D0%B2%D0%BE%D1%80%D0%BE%D0%B6%D0%B4%D0%B5%D0%BD%D0%BD%D0%BE%D0%B3%D0%BE",
      imageUrl:
        "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=80",
      caption: "Основное превью слева показывает сам товар."
    },
    examples: [
      {
        label: "Основное фото переноски",
        kind: "image",
        url: "https://www.ozon.ru/search/?text=%D1%8D%D1%80%D0%B3%D0%BE%D1%80%D1%8E%D0%BA%D0%B7%D0%B0%D0%BA%20%D0%B4%D0%BB%D1%8F%20%D0%BD%D0%BE%D0%B2%D0%BE%D1%80%D0%BE%D0%B6%D0%B4%D0%B5%D0%BD%D0%BD%D0%BE%D0%B3%D0%BE",
        imageUrl:
          "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=80",
        caption: "Основное превью слева показывает сам товар."
      },
      {
        label: "Wildberries: эргорюкзак",
        kind: "link",
        url: "https://www.wildberries.ru/catalog/0/search.aspx?search=%D1%8D%D1%80%D0%B3%D0%BE%D1%80%D1%8E%D0%BA%D0%B7%D0%B0%D0%BA",
        caption: "Поисковая ссылка на варианты эргорюкзаков."
      },
      {
        label: "Дополнительное фото посадки",
        kind: "image",
        imageUrl:
          "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
        caption: "Дополнительное фото в подсказке может пояснять посадку или важную деталь."
      }
    ],
    comments: []
  },
  {
    slug: "play-mat",
    title: "Толстый игровой коврик",
    summary: "Лучше брать самый большой размер и толщину около 1 см.",
    categorySlugs: ["for-baby", "for-home"],
    featured: true,
    example: {
      label: "Игровой коврик",
      kind: "image",
      url: "https://www.ozon.ru/search/?text=%D0%B8%D0%B3%D1%80%D0%BE%D0%B2%D0%BE%D0%B9%20%D0%BA%D0%BE%D0%B2%D1%80%D0%B8%D0%BA%201%20%D1%81%D0%BC",
      imageUrl:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
      caption: "Размер и плотность важнее декоративности."
    },
    comments: []
  },
  {
    slug: "playpen",
    title: "Манеж или походная кровать-манеж",
    summary: "Отдельное безопасное пространство для дома и поездок.",
    categorySlugs: ["for-baby", "for-home", "for-travel"],
    example: {
      label: "На что смотреть",
      kind: "link",
      caption: "Если позволяет место, манеж побольше часто удобнее в ежедневном использовании."
    },
    comments: []
  },
  {
    slug: "bassinet-on-wheels",
    title: "Кокон или кроватка на колесиках",
    summary: "Полезная мобильная база на первые месяцы, когда ребенок постоянно рядом.",
    categorySlugs: ["for-baby", "for-home"],
    featured: true,
    example: {
      label: "Что проверить",
      kind: "link",
      caption: "Сверьте габариты с проходами и местом в спальне, ванной и других комнатах."
    },
    comments: []
  },
  {
    slug: "bouncer",
    title: "Шезлонг",
    summary: "Часто особенно полезен в период примерно с 3 до 6 месяцев.",
    categorySlugs: ["for-baby", "for-home"],
    example: {
      label: "Когда особенно полезен",
      kind: "link",
      caption: "Не универсальная покупка на весь год, а вещь на конкретный удобный период."
    },
    comments: []
  },
  {
    slug: "pacifiers",
    title: "Соски разных форм",
    summary: "Лучше пробовать несколько вариантов, а не покупать одну модель в большом количестве.",
    categorySlugs: ["for-baby", "for-home", "for-walks"],
    example: {
      label: "Рабочий подход",
      kind: "link",
      caption: "Сначала попробовать разные варианты, а потом докупить те, что реально подошли."
    },
    comments: []
  },
  {
    slug: "hooded-towels",
    title: "Полотенца с уголком",
    summary: "Удобны после купания, если ткань мягкая и ничего не натирает.",
    categorySlugs: ["for-baby", "for-home"],
    example: {
      label: "Что проверить",
      kind: "link",
      caption: "Декор не должен соприкасаться с кожей ребенка без мягкой подкладки."
    },
    comments: []
  },
  {
    slug: "muslin-swaddles",
    title: "Муслиновые пеленки",
    summary: "Одна из самых универсальных вещей для дома и прогулок.",
    categorySlugs: ["for-baby", "for-home", "for-travel"],
    example: {
      label: "Почему они удобны",
      kind: "link",
      caption: "Их используют как подложку, накидку, легкое укрытие и просто мягкий помощник в быту."
    },
    comments: []
  },
  {
    slug: "changing-station",
    title: "Пеленалка и одноразовые пеленки",
    summary: "Простая организация места для смены подгузника и ухода.",
    categorySlugs: ["for-baby", "for-home"],
    featured: true,
    example: {
      label: "Что держать рядом",
      kind: "link",
      caption: "Пеленки, салфетки, крем и все для быстрой смены подгузника."
    },
    comments: []
  },
  {
    slug: "diaper-care",
    title: "Набор для смены подгузника",
    summary: "Подгузники, крем, влажные и безворсовые салфетки, пакеты и ватные палочки.",
    categorySlugs: ["for-baby", "for-home", "for-travel"],
    featured: true,
    example: {
      label: "Что входит",
      kind: "link",
      caption: "Памперсы, мицеллярка, крем под подгузник, влажные и безворсовые салфетки, пакеты и ватные палочки."
    },
    comments: []
  },
  {
    slug: "baby-care-kit",
    title: "Ножницы, мягкая расческа и средство для мытья",
    summary: "Базовый уходовый набор, который часто удобнее купить комплектом.",
    categorySlugs: ["for-baby", "for-home"],
    example: {
      label: "Удобный формат",
      kind: "link",
      caption: "Готовый набор экономит время, а масло для мытья часто ощущается комфортнее в использовании."
    },
    comments: []
  },
  {
    slug: "video-monitor",
    title: "Видеоняня с отдельным экраном",
    summary: "Лучше с поворотной камерой и без привязки только к телефону.",
    categorySlugs: ["for-baby", "for-home"],
    featured: true,
    example: {
      label: "Что удобно",
      kind: "link",
      caption: "Отдельный экран и вращающаяся камера заметно улучшают ежедневный опыт."
    },
    comments: []
  },
  {
    slug: "walk-organizer",
    title: "Косметичка-органайзер для прогулок",
    summary: "Отдельный модуль, куда можно сложить все для смены подгузника вне дома.",
    categorySlugs: ["for-travel", "for-walks", "for-home"],
    example: {
      label: "Что положить внутрь",
      kind: "link",
      caption: "Мини-набор для смены подгузника, салфетки и запасная одежда."
    },
    comments: []
  },
  {
    slug: "newborn-clothes",
    title: "Одежда 56 размера без большого запаса",
    summary: "На первое время лучше взять базу, а потом скорректировать размер после рождения.",
    categorySlugs: ["for-baby", "for-home", "for-walks"],
    example: {
      label: "Подход на старте",
      kind: "link",
      caption: "Небольшой стартовый набор обычно практичнее полного гардероба заранее."
    },
    comments: []
  },
  {
    slug: "feeding-and-nose-care",
    title: "Бутылочки, стерилизатор и набор для носа",
    summary: "Бутылочки, стерилизатор, физраствор и соплеотсос лучше иметь заранее.",
    categorySlugs: ["for-baby", "for-home", "for-travel"],
    featured: true,
    example: {
      label: "Что входит",
      kind: "link",
      caption: "Бутылочки, стерилизатор, физраствор для носа и соплеотсос."
    },
    comments: []
  },
  {
    slug: "formula-accessories",
    title: "Термос и порционные контейнеры для смеси",
    summary: "Полезные аксессуары для кормления дома и вне дома.",
    categorySlugs: ["for-home", "for-travel"],
    example: {
      label: "Где особенно полезно",
      kind: "link",
      caption: "На прогулках, в поездках и когда хочется заранее все подготовить."
    },
    comments: []
  },
  {
    slug: "car-seat-and-stroller",
    title: "Автолюлька с базой и коляска",
    summary: "Автолюлька должна ставиться на колеса коляски, а коляску лучше подбирать под сезон.",
    categorySlugs: ["for-travel", "for-walks"],
    featured: true,
    example: {
      label: "На что смотреть",
      kind: "link",
      caption: "Совместимость автолюльки с колесами и подходящая люлька под сезон рождения."
    },
    comments: []
  },
  {
    slug: "pacifier-clip",
    title: "Держатель для соски",
    summary: "Небольшой аксессуар, который очень быстро начинает экономить силы.",
    categorySlugs: ["for-baby", "for-travel", "for-walks"],
    example: {
      label: "Почему удобно",
      kind: "link",
      caption: "Одна из маленьких вещей, которые оказываются неожиданно полезными каждый день."
    },
    comments: []
  },
  {
    slug: "hospital-bag-for-mom",
    title: "База для мамы в роддом",
    summary: "Пижамы или ночнушки, сланцы и послеродовые трусы на размер побольше.",
    categorySlugs: ["for-mom", "for-travel"],
    featured: true,
    example: {
      label: "Что положить",
      kind: "link",
      caption: "Пижамы или ночнушки, сланцы и послеродовые трусы побольше."
    },
    comments: []
  },
  {
    slug: "night-flashlight-watch",
    title: "Часы или фитнес-браслет с фонариком",
    summary: "Небольшая вещь, которая оказывается очень полезной ночью.",
    categorySlugs: ["for-mom", "for-home", "for-travel"],
    example: {
      label: "Где помогает",
      kind: "link",
      caption: "Ночью фонарик на запястье часто удобнее, чем искать телефон."
    },
    comments: []
  },
  {
    slug: "outlet-covers",
    title: "Заглушки для розеток",
    summary: "Простая и полезная мелочь для дома, о которой удобно подумать заранее.",
    categorySlugs: ["for-home"],
    example: {
      label: "Когда брать",
      kind: "link",
      caption: "Проще закрыть этот пункт заранее, чем вспоминать о нем позже."
    },
    comments: []
  },
  {
    slug: "things-not-needed",
    title: "Что можно не покупать",
    summary: "Подогреватель бутылочек, антицарапки, пеленальный комод, машинка для смеси и мешок для сна не выглядят обязательными.",
    categorySlugs: ["for-home", "for-baby", "not-needed"],
    featured: true,
    example: {
      label: "Что сюда входит",
      kind: "link",
      caption: "Подогреватель бутылочек, антицарапки, пеленальный комод, машинка для смеси и мешок для сна."
    },
    comments: []
  },
  {
    slug: "bottle-washer-sterilizer",
    title: "Мойка и стерилизация бутылочек 2 в 1",
    summary: "Не обязательная база, а удобный апгрейд, если бюджет не ограничен.",
    categorySlugs: ["for-home", "premium"],
    example: {
      label: "Как воспринимать",
      kind: "link",
      caption: "Скорее nice-to-have, чем обязательный пункт на старте."
    },
    comments: []
  }
];

export const featuredItems = items.filter((item) => item.featured);

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getItemBySlug(slug: string) {
  return items.find((item) => item.slug === slug);
}

export function getItemsForCategory(slug: string) {
  return items.filter((item) => item.categorySlugs.includes(slug));
}

export function getRelatedItems(itemSlug: string) {
  const current = getItemBySlug(itemSlug);
  if (!current) return [];

  return items
    .filter((item) => item.slug !== itemSlug)
    .map((item) => ({
      item,
      score: item.categorySlugs.filter((slug) => current.categorySlugs.includes(slug)).length
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ item }) => item);
}
