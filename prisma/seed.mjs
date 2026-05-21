import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const { hash } = bcrypt;

const categories = [
  {
    id: "seed-category-for-baby",
    slug: "for-baby",
    name: "Для малыша",
    description: "Базовые вещи, которые закрывают ежедневные потребности новорождённого.",
    accent: "sky",
    hero: "Спокойный старт для маленького человека",
    order: 10
  },
  {
    id: "seed-category-for-home",
    slug: "for-home",
    name: "Для дома",
    description: "Организация пространства, сон и удобство в быту.",
    accent: "sage",
    hero: "Дом, где всё под рукой",
    order: 20
  },
  {
    id: "seed-category-for-walks",
    slug: "for-walks",
    name: "Для прогулок",
    description: "Снаряжение для прогулок, свежего воздуха и ритма вне дома.",
    accent: "mint",
    hero: "Город и парк в вашем темпе",
    order: 30
  },
  {
    id: "seed-category-for-travel",
    slug: "for-travel",
    name: "Для путешествий",
    description: "Вещи, которые упрощают поездки, визиты и передвижение вне дома.",
    accent: "amber",
    hero: "Мобильность без стресса",
    order: 40
  },
  {
    id: "seed-category-for-mom",
    slug: "for-mom",
    name: "Для мамы",
    description: "Уход, восстановление и комфорт в первые месяцы после родов.",
    accent: "rose",
    hero: "Мягкий слой поддержки для первых недель",
    order: 50
  },
  {
    id: "seed-category-not-needed",
    slug: "not-needed",
    name: "Это можно не покупать",
    description: "Вещи, которые я бы не относила к обязательным покупкам на старт.",
    accent: "sky",
    hero: "Без лишних покупок",
    order: 60
  },
  {
    id: "seed-category-premium",
    slug: "premium",
    name: "Если бюджет не ограничен",
    description: "Необязательные, но приятные апгрейды для большего бытового комфорта.",
    accent: "mint",
    hero: "Когда хочется больше удобства",
    order: 70
  }
];

const items = [
  {
    id: "seed-item-postpartum-belt",
    slug: "postpartum-belt",
    title: "Послеродовой бандаж",
    summary: "Поддерживает корпус в период восстановления и помогает чувствовать больше стабильности.",
    categorySlugs: ["for-mom", "for-home"],
    featured: true,
    example: {
      id: "seed-example-postpartum-belt",
      label: "Пример модели на маркетплейсе",
      kind: "BOTH",
      url: "https://example.com/postpartum-belt",
      imageUrl:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
      caption: "Хорошо, когда есть мягкая посадка, понятный размер и регулируемая фиксация."
    },
    comments: [
      {
        id: "seed-comment-postpartum-belt-alina",
        authorId: "seed-user-alina",
        authorName: "Алина",
        body: "После родов это оказалось одной из самых полезных вещей для дома.",
        createdAt: "2026-04-12"
      }
    ]
  },
  {
    id: "seed-item-baby-nest",
    slug: "baby-nest",
    title: "Кокон для новорождённого",
    summary: "Помогает организовать удобное и более предсказуемое место для коротких дневных пауз.",
    categorySlugs: ["for-baby", "for-home", "for-travel"],
    featured: false,
    example: {
      id: "seed-example-baby-nest",
      label: "Фотография примера",
      kind: "IMAGE",
      imageUrl:
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=80",
      caption: "Обратите внимание на плотность наполнителя и съёмность чехла."
    },
    comments: [
      {
        id: "seed-comment-baby-nest-maria",
        authorId: "seed-user-maria",
        authorName: "Мария",
        body: "Очень выручает, когда нужно быстро организовать уголок для малыша.",
        createdAt: "2026-04-16"
      }
    ]
  },
  {
    id: "seed-item-diaper-bag-organizer",
    slug: "diaper-bag-organizer",
    title: "Органайзер для сумки",
    summary: "Помогает быстро собирать вещи на прогулку, в поликлинику или в поездку.",
    categorySlugs: ["for-travel", "for-walks", "for-home"],
    featured: true,
    example: {
      id: "seed-example-diaper-bag-organizer",
      label: "Ссылка на конкретный товар",
      kind: "LINK",
      url: "https://example.com/organizer",
      caption: "Ищите водоотталкивающий материал и карманы разного размера."
    },
    comments: [
      {
        id: "seed-comment-diaper-bag-organizer-ekaterina",
        authorId: "seed-user-ekaterina",
        authorName: "Екатерина",
        body: "С органайзером перестала забывать мелочи перед выходом.",
        createdAt: "2026-05-01"
      }
    ]
  },
  {
    id: "seed-item-feeding-chair-pillow",
    slug: "feeding-chair-pillow",
    title: "Подушка для кормления",
    summary: "Снимает часть нагрузки с рук и плеч во время кормления и удержания ребёнка.",
    categorySlugs: ["for-mom", "for-baby", "for-home"],
    featured: false,
    example: {
      id: "seed-example-feeding-chair-pillow",
      label: "Пример с фото",
      kind: "BOTH",
      url: "https://example.com/feeding-pillow",
      imageUrl:
        "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=80",
      caption: "Лучше выбирать модель с плотным наполнением и съёмным чехлом."
    },
    comments: []
  },
  {
    id: "seed-item-baby-crib",
    slug: "baby-crib",
    title: "Кроватка без мягких бортиков",
    summary: "Базовое безопасное спальное место без лишнего декора и мягких элементов.",
    categorySlugs: ["for-baby", "for-home"],
    featured: true,
    example: {
      id: "seed-example-baby-crib",
      label: "На что смотреть при выборе",
      kind: "LINK",
      caption: "Без мягких бортиков, лишнего текстиля и декоративных элементов."
    },
    comments: []
  },
  {
    id: "seed-item-firm-mattress",
    slug: "firm-mattress",
    title: "Жёсткий матрас",
    summary: "Надёжная база для детской кроватки на первые месяцы.",
    categorySlugs: ["for-baby", "for-home"],
    featured: false,
    example: {
      id: "seed-example-firm-mattress",
      label: "Что важно",
      kind: "LINK",
      caption: "Ищите ровную жёсткую поверхность и размер точно под кроватку."
    },
    comments: []
  },
  {
    id: "seed-item-fitted-sheets",
    slug: "fitted-sheets",
    title: "Простыни на резинке",
    summary: "Удобный повседневный текстиль, который проще быстро менять.",
    categorySlugs: ["for-baby", "for-home"],
    featured: false,
    example: {
      id: "seed-example-fitted-sheets",
      label: "Практичный вариант",
      kind: "LINK",
      caption: "Лучше брать сразу несколько штук в размер матраса."
    },
    comments: []
  },
  {
    id: "seed-item-blanket-for-stroller",
    slug: "blanket-for-stroller",
    title: "Плед для роддома и коляски",
    summary: "Универсальная вещь для выписки, дороги и прогулок, но не для сна в кроватке.",
    categorySlugs: ["for-baby", "for-travel", "for-walks"],
    featured: false,
    example: {
      id: "seed-example-blanket-for-stroller",
      label: "Когда полезен",
      kind: "LINK",
      caption: "Подойдёт для коляски и поездок, но не как постоянный текстиль для сна."
    },
    comments: []
  },
  {
    id: "seed-item-baby-bath",
    slug: "baby-bath",
    title: "Ванночка с горкой и термометром",
    summary: "Упрощает купание и помогает быстрее освоиться с температурой воды.",
    categorySlugs: ["for-baby", "for-home"],
    featured: true,
    example: {
      id: "seed-example-baby-bath",
      label: "Удачная комплектация",
      kind: "LINK",
      caption: "Горка плюс термометр закрывают базовые потребности на старте."
    },
    comments: []
  },
  {
    id: "seed-item-carrier",
    slug: "carrier",
    title: "Эргорюкзак или переноска",
    summary: "Помогает разгрузить руки и упростить перемещение по делам и дома.",
    categorySlugs: ["for-baby", "for-travel", "for-walks"],
    featured: true,
    example: {
      id: "seed-example-carrier",
      label: "Как выбрать",
      kind: "LINK",
      caption: "Смотрите на комфорт посадки для взрослого и сценарий, в котором будете использовать чаще всего."
    },
    comments: []
  },
  {
    id: "seed-item-play-mat",
    slug: "play-mat",
    title: "Толстый игровой коврик",
    summary: "Большой плотный коврик делает пол более удобным местом для игр и времени на животе.",
    categorySlugs: ["for-baby", "for-home"],
    featured: true,
    example: {
      id: "seed-example-play-mat",
      label: "Что важно",
      kind: "LINK",
      caption: "Размер лучше брать с запасом, чтобы коврик не оказался маленьким через пару недель."
    },
    comments: []
  },
  {
    id: "seed-item-playpen",
    slug: "playpen",
    title: "Манеж или походная кровать-манеж",
    summary: "Даёт отдельное безопасное пространство для ребёнка дома и в поездках.",
    categorySlugs: ["for-baby", "for-home", "for-travel"],
    featured: false,
    example: {
      id: "seed-example-playpen",
      label: "Практичный сценарий",
      kind: "LINK",
      caption: "Если места достаточно, манеж побольше обычно удобнее в ежедневном использовании."
    },
    comments: []
  },
  {
    id: "seed-item-bassinet-on-wheels",
    slug: "bassinet-on-wheels",
    title: "Кокон или кроватка на колёсиках",
    summary: "Удобный формат для первых месяцев, когда ребёнок почти всё время рядом с мамой.",
    categorySlugs: ["for-baby", "for-home"],
    featured: true,
    example: {
      id: "seed-example-bassinet-on-wheels",
      label: "На что обратить внимание",
      kind: "LINK",
      caption: "Сверьте габариты с проходами и местом в спальне, ванной и других комнатах."
    },
    comments: []
  },
  {
    id: "seed-item-bouncer",
    slug: "bouncer",
    title: "Шезлонг",
    summary: "Полезная вещь на период примерно с 3 до 6 месяцев, когда нужен короткий безопасный слот рядом со взрослым.",
    categorySlugs: ["for-baby", "for-home"],
    featured: false,
    example: {
      id: "seed-example-bouncer",
      label: "Когда пригодится",
      kind: "LINK",
      caption: "Хорош как временное место рядом со взрослым, а не как универсальная покупка на весь год."
    },
    comments: []
  },
  {
    id: "seed-item-pacifiers",
    slug: "pacifiers",
    title: "Соски разных форм",
    summary: "Лучше иметь несколько вариантов, потому что предпочтения у детей сильно отличаются.",
    categorySlugs: ["for-baby", "for-home", "for-walks"],
    featured: false,
    example: {
      id: "seed-example-pacifiers",
      label: "Рабочий подход",
      kind: "LINK",
      caption: "Начните с нескольких разных вариантов, а потом докупайте те, что реально зашли."
    },
    comments: []
  },
  {
    id: "seed-item-hooded-towels",
    slug: "hooded-towels",
    title: "Полотенца с уголком",
    summary: "Удобны после купания и помогают быстро укутать малыша.",
    categorySlugs: ["for-baby", "for-home"],
    featured: false,
    example: {
      id: "seed-example-hooded-towels",
      label: "На что смотреть",
      kind: "LINK",
      caption: "Если есть декор или вышивка, проверьте, чтобы они не царапали ребёнка с внутренней стороны."
    },
    comments: []
  },
  {
    id: "seed-item-muslin-swaddles",
    slug: "muslin-swaddles",
    title: "Муслиновые пелёнки",
    summary: "Многофункциональная базовая ткань для дома, прогулок и ухода.",
    categorySlugs: ["for-baby", "for-home", "for-travel"],
    featured: false,
    example: {
      id: "seed-example-muslin-swaddles",
      label: "Почему удобно",
      kind: "LINK",
      caption: "Полезны как подложка, накидывание, вытирание и просто расходный мягкий текстиль."
    },
    comments: []
  },
  {
    id: "seed-item-changing-station",
    slug: "changing-station",
    title: "Пеленалка и одноразовые пелёнки",
    summary: "Организуют удобное место для смены подгузника и гигиенических процедур.",
    categorySlugs: ["for-baby", "for-home"],
    featured: true,
    example: {
      id: "seed-example-changing-station",
      label: "Что включить",
      kind: "LINK",
      caption: "Рядом удобно держать пелёнки, салфетки, крем и всё для быстрой смены подгузника."
    },
    comments: []
  },
  {
    id: "seed-item-diaper-care",
    slug: "diaper-care",
    title: "Набор для смены подгузника",
    summary: "Подгузники, крем, влажные и безворсовые салфетки, пакеты для утилизации и базовая гигиена в одном сценарии.",
    categorySlugs: ["for-baby", "for-home", "for-travel"],
    featured: true,
    example: {
      id: "seed-example-diaper-care",
      label: "Что держать под рукой",
      kind: "LINK",
      caption: "Подгузники, крем под подгузник, влажные салфетки, безворсовые салфетки, пакеты и детские ватные палочки."
    },
    comments: []
  },
  {
    id: "seed-item-baby-care-kit",
    slug: "baby-care-kit",
    title: "Ножницы, мягкая расчёска и средство для мытья",
    summary: "Базовый набор для ухода, который удобно купить комплектом.",
    categorySlugs: ["for-baby", "for-home"],
    featured: false,
    example: {
      id: "seed-example-baby-care-kit",
      label: "Практичный состав",
      kind: "LINK",
      caption: "Готовый набор с ножницами и мягкой расчёской экономит время на сбор мелочей."
    },
    comments: []
  },
  {
    id: "seed-item-video-monitor",
    slug: "video-monitor",
    title: "Видеоняня с отдельным экраном",
    summary: "Позволяет следить за ребёнком без зависимости от телефона.",
    categorySlugs: ["for-baby", "for-home"],
    featured: true,
    example: {
      id: "seed-example-video-monitor",
      label: "Удачные свойства",
      kind: "LINK",
      caption: "Отдельный экран и вращающаяся камера заметно удобнее в ежедневном использовании."
    },
    comments: []
  },
  {
    id: "seed-item-walk-organizer",
    slug: "walk-organizer",
    title: "Косметичка-органайзер для прогулок",
    summary: "Компактный формат, куда удобно сложить всё для быстрой смены подгузника вне дома.",
    categorySlugs: ["for-travel", "for-walks", "for-home"],
    featured: false,
    example: {
      id: "seed-example-walk-organizer",
      label: "Что положить внутрь",
      kind: "LINK",
      caption: "Мини-набор для смены подгузника, салфетки и запасной комплект одежды."
    },
    comments: []
  },
  {
    id: "seed-item-newborn-clothes",
    slug: "newborn-clothes",
    title: "Одежда 56 размера без большого запаса",
    summary: "На первое время достаточно небольшой базы, а дальше размер проще скорректировать по ребёнку.",
    categorySlugs: ["for-baby", "for-home", "for-walks"],
    featured: false,
    example: {
      id: "seed-example-newborn-clothes",
      label: "Подход на старте",
      kind: "LINK",
      caption: "Небольшой набор на первое время обычно разумнее, чем полный гардероб заранее."
    },
    comments: []
  },
  {
    id: "seed-item-feeding-and-nose-care",
    slug: "feeding-and-nose-care",
    title: "Бутылочки, стерилизатор и базовый набор для носа",
    summary: "Практичный набор на старте: бутылочки, стерилизатор, физраствор и соплеотсос.",
    categorySlugs: ["for-baby", "for-home", "for-travel"],
    featured: true,
    example: {
      id: "seed-example-feeding-and-nose-care",
      label: "Что входит",
      kind: "LINK",
      caption: "Бутылочки, стерилизатор, физраствор и соплеотсос закрывают несколько частых бытовых сценариев."
    },
    comments: []
  },
  {
    id: "seed-item-formula-accessories",
    slug: "formula-accessories",
    title: "Термос и порционные контейнеры для смеси",
    summary: "Помогают быстрее собираться и удобнее организовать кормление вне дома.",
    categorySlugs: ["for-travel", "for-home"],
    featured: false,
    example: {
      id: "seed-example-formula-accessories",
      label: "Где особенно полезно",
      kind: "LINK",
      caption: "Пригодятся в поездках, на прогулках и когда хочется заранее всё разложить порциями."
    },
    comments: []
  },
  {
    id: "seed-item-car-seat-and-stroller",
    slug: "car-seat-and-stroller",
    title: "Автолюлька с базой и коляска",
    summary: "Ключевая транспортная связка: автолюлька, которая ставится на колёса, и коляска под сезон и возраст.",
    categorySlugs: ["for-travel", "for-walks"],
    featured: true,
    example: {
      id: "seed-example-car-seat-and-stroller",
      label: "На что опираться",
      kind: "LINK",
      caption: "Совместимость автолюльки с шасси и подходящая люлька под сезон рождения экономят много сил."
    },
    comments: []
  },
  {
    id: "seed-item-pacifier-clip",
    slug: "pacifier-clip",
    title: "Держатель для соски",
    summary: "Небольшой аксессуар, который уменьшает количество падений и поисков соски.",
    categorySlugs: ["for-baby", "for-walks", "for-travel"],
    featured: false,
    example: {
      id: "seed-example-pacifier-clip",
      label: "Простое удобство",
      kind: "LINK",
      caption: "Из маленьких покупок это одна из самых ощутимо полезных."
    },
    comments: []
  },
  {
    id: "seed-item-bottle-warmer-not-needed",
    slug: "bottle-warmer-not-needed",
    title: "Подогреватель бутылочек",
    summary: "Скорее необязательная покупка, без которой обычно можно спокойно обойтись.",
    categorySlugs: ["for-home", "not-needed"],
    featured: false,
    example: {
      id: "seed-example-bottle-warmer-not-needed",
      label: "Почему можно пропустить",
      kind: "LINK",
      caption: "Если хочется сократить список покупок, это один из первых кандидатов на исключение."
    },
    comments: []
  },
  {
    id: "seed-item-scratch-mittens-not-needed",
    slug: "scratch-mittens-not-needed",
    title: "Антицарапки",
    summary: "Не выглядят как вещь первой необходимости в базовом списке.",
    categorySlugs: ["for-baby", "for-home", "not-needed"],
    featured: false,
    example: {
      id: "seed-example-scratch-mittens-not-needed",
      label: "Статус в списке",
      kind: "LINK",
      caption: "Это скорее необязательная вещь, чем must-have."
    },
    comments: []
  },
  {
    id: "seed-item-changing-dresser-not-needed",
    slug: "changing-dresser-not-needed",
    title: "Пеленальный комод",
    summary: "Можно купить по желанию, но практическая ценность часто ниже ожиданий.",
    categorySlugs: ["for-home", "not-needed"],
    featured: false,
    example: {
      id: "seed-example-changing-dresser-not-needed",
      label: "Когда можно пропустить",
      kind: "LINK",
      caption: "Если место и бюджет хочется использовать рациональнее, без комода часто легко обойтись."
    },
    comments: []
  },
  {
    id: "seed-item-formula-machine-not-needed",
    slug: "formula-machine-not-needed",
    title: "Машинка для приготовления смеси",
    summary: "Не выглядит обязательной техникой на старте и легко попадает в список лишнего.",
    categorySlugs: ["for-home", "not-needed"],
    featured: false,
    example: {
      id: "seed-example-formula-machine-not-needed",
      label: "Как оценивать",
      kind: "LINK",
      caption: "Сначала лучше закрыть базовые сценарии, а к такой технике возвращаться только если реально почувствуете потребность."
    },
    comments: []
  },
  {
    id: "seed-item-sleep-sack-not-needed",
    slug: "sleep-sack-not-needed",
    title: "Мешок для сна",
    summary: "Спорная покупка: многое зависит от температуры дома и реального сценария использования.",
    categorySlugs: ["for-baby", "for-home", "not-needed"],
    featured: false,
    example: {
      id: "seed-example-sleep-sack-not-needed",
      label: "Почему не must-have",
      kind: "LINK",
      caption: "Удобство очень индивидуально, а безопаснее и проще иногда вообще не добавлять эту вещь в базовый список."
    },
    comments: []
  },
  {
    id: "seed-item-bottle-washer-sterilizer",
    slug: "bottle-washer-sterilizer",
    title: "Мойка и стерилизация бутылочек 2 в 1",
    summary: "Покупка не первой необходимости, но приятный апгрейд, если бюджет не ограничен.",
    categorySlugs: ["for-home", "premium"],
    featured: false,
    example: {
      id: "seed-example-bottle-washer-sterilizer",
      label: "Когда уместно",
      kind: "LINK",
      caption: "Имеет смысл как апгрейд комфорта, а не как обязательная покупка на старте."
    },
    comments: []
  },
  {
    id: "seed-item-hospital-bag-for-mom",
    slug: "hospital-bag-for-mom",
    title: "База для мамы в роддом",
    summary: "Пижамы или ночнушки, сланцы для душа и послеродовые трусы на размер больше.",
    categorySlugs: ["for-mom", "for-travel"],
    featured: true,
    example: {
      id: "seed-example-hospital-bag-for-mom",
      label: "Что включить",
      kind: "LINK",
      caption: "Пижамы или ночнушки, сланцы для душа и послеродовые трусы побольше по размеру."
    },
    comments: []
  },
  {
    id: "seed-item-night-flashlight-watch",
    slug: "night-flashlight-watch",
    title: "Часы или фитнес-браслет с фонариком",
    summary: "Небольшая вещь, которая неожиданно полезна ночью.",
    categorySlugs: ["for-mom", "for-home", "for-travel"],
    featured: false,
    example: {
      id: "seed-example-night-flashlight-watch",
      label: "Скрытая польза",
      kind: "LINK",
      caption: "Фонарик на запястье ночью часто удобнее, чем тянуться за телефоном."
    },
    comments: []
  },
  {
    id: "seed-item-outlet-covers",
    slug: "outlet-covers",
    title: "Заглушки для розеток",
    summary: "Простая вещь для дома, о которой удобно подумать заранее.",
    categorySlugs: ["for-home"],
    featured: false,
    example: {
      id: "seed-example-outlet-covers",
      label: "Категория покупки",
      kind: "LINK",
      caption: "Небольшая домашняя мелочь, которую приятно закрыть заранее."
    },
    comments: []
  }
];

const savedList = {
  id: "seed-saved-list-starter",
  userId: "seed-user-alina",
  name: "Стартовый список",
  description: "Пример сохранённой подборки для проверки SavedList и SavedItem.",
  itemSlugs: ["postpartum-belt", "diaper-bag-organizer"]
};

function requireMappedId(map, key, label) {
  const id = map.get(key);

  if (!id) {
    throw new Error(`Seed data error: ${label} "${key}" was not found.`);
  }

  return id;
}

async function seedAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("Skipped admin user seed: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create one.");
    return;
  }

  const passwordHash = await hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      name: "Admin",
      passwordHash,
      role: "ADMIN"
    },
    create: {
      id: "seed-user-admin",
      email,
      name: "Admin",
      passwordHash,
      role: "ADMIN"
    }
  });
}

async function seedCommentAuthors() {
  const authors = new Map();

  for (const item of items) {
    for (const comment of item.comments) {
      authors.set(comment.authorId, comment.authorName);
    }
  }

  for (const [id, name] of authors) {
    await prisma.user.upsert({
      where: { id },
      update: { name },
      create: { id, name, role: "USER" }
    });
  }
}

async function seedCategories() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        accent: category.accent,
        hero: category.hero,
        order: category.order
      },
      create: category
    });
  }
}

async function getCategoryIdsBySlug() {
  const seededCategories = await prisma.category.findMany({
    where: {
      slug: {
        in: categories.map((category) => category.slug)
      }
    },
    select: {
      id: true,
      slug: true
    }
  });

  return new Map(seededCategories.map((category) => [category.slug, category.id]));
}

async function getItemIdsBySlug(slugs) {
  const seededItems = await prisma.item.findMany({
    where: {
      slug: {
        in: slugs
      }
    },
    select: {
      id: true,
      slug: true
    }
  });

  return new Map(seededItems.map((item) => [item.slug, item.id]));
}

async function seedItems() {
  const categoryIdsBySlug = await getCategoryIdsBySlug();

  for (const item of items) {
    const itemRecord = await prisma.item.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        summary: item.summary,
        previewImageUrl: item.previewImageUrl ?? item.example.imageUrl ?? null,
        featured: item.featured,
        status: "PUBLISHED"
      },
      create: {
        id: item.id,
        slug: item.slug,
        title: item.title,
        summary: item.summary,
        previewImageUrl: item.previewImageUrl ?? item.example.imageUrl ?? null,
        featured: item.featured,
        status: "PUBLISHED"
      }
    });

    await prisma.itemCategory.deleteMany({
      where: { itemId: itemRecord.id }
    });

    await prisma.itemCategory.createMany({
      data: item.categorySlugs.map((categorySlug) => ({
        itemId: itemRecord.id,
        categoryId: requireMappedId(categoryIdsBySlug, categorySlug, "category")
      })),
      skipDuplicates: true
    });

    await prisma.itemExample.upsert({
      where: { id: item.example.id },
      update: {
        itemId: itemRecord.id,
        kind: item.example.kind,
        label: item.example.label,
        url: item.example.url ?? null,
        imageUrl: item.example.imageUrl ?? null,
        caption: item.example.caption ?? null
      },
      create: {
        id: item.example.id,
        itemId: itemRecord.id,
        kind: item.example.kind,
        label: item.example.label,
        url: item.example.url ?? null,
        imageUrl: item.example.imageUrl ?? null,
        caption: item.example.caption ?? null
      }
    });

    if (item.example.imageUrl) {
      await prisma.mediaAsset.upsert({
        where: { id: `seed-media-${item.slug}` },
        update: {
          url: item.example.imageUrl,
          alt: item.title,
          kind: "IMAGE"
        },
        create: {
          id: `seed-media-${item.slug}`,
          url: item.example.imageUrl,
          alt: item.title,
          kind: "IMAGE"
        }
      });
    }

    for (const comment of item.comments) {
      await prisma.comment.upsert({
        where: { id: comment.id },
        update: {
          itemId: itemRecord.id,
          userId: comment.authorId,
          body: comment.body,
          isHidden: false
        },
        create: {
          id: comment.id,
          itemId: itemRecord.id,
          userId: comment.authorId,
          body: comment.body,
          isHidden: false,
          createdAt: new Date(`${comment.createdAt}T12:00:00.000Z`)
        }
      });
    }
  }
}

async function seedSavedList() {
  const itemIdsBySlug = await getItemIdsBySlug(savedList.itemSlugs);

  await prisma.savedList.upsert({
    where: { id: savedList.id },
    update: {
      userId: savedList.userId,
      name: savedList.name,
      description: savedList.description,
      isPublic: false
    },
    create: {
      id: savedList.id,
      userId: savedList.userId,
      name: savedList.name,
      description: savedList.description,
      isPublic: false
    }
  });

  await prisma.savedItem.deleteMany({
    where: { listId: savedList.id }
  });

  await prisma.savedItem.createMany({
    data: savedList.itemSlugs.map((slug) => ({
      listId: savedList.id,
      itemId: requireMappedId(itemIdsBySlug, slug, "item")
    })),
    skipDuplicates: true
  });
}

async function main() {
  await seedAdminUser();
  await seedCommentAuthors();
  await seedCategories();
  await seedItems();
  await seedSavedList();

  console.log(`Seeded ${categories.length} categories and ${items.length} published items.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
