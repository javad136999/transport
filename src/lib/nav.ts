export type NavItem = { label: string; href: string };

export function withActive(items: NavItem[], currentPath: string) {
  return items.map((i) => ({ ...i, active: i.href === currentPath }));
}

export const ADMIN_NAV: NavItem[] = [
  { label: "داشبورد", href: "/dashboard" },
  { label: "نقشه زنده", href: "/dashboard/map" },
  { label: "پتروشیمی‌ها", href: "/dashboard/organizations" },
  { label: "مأموریت‌ها", href: "/dashboard/missions" },
  { label: "تانکرها", href: "/dashboard/vehicles" },
  { label: "رانندگان", href: "/dashboard/drivers" },
  { label: "هشدارها", href: "/dashboard/alerts" },
  { label: "موارد مشکوک", href: "/dashboard/suspicious" },
  { label: "گزارش‌ساز", href: "/dashboard/reports" },
  { label: "اشتراک‌ها", href: "/dashboard/subscriptions" },
  { label: "پرداخت‌ها", href: "/dashboard/payments" },
  { label: "کاربران", href: "/dashboard/users" },
  { label: "Audit Log", href: "/dashboard/audit" },
  { label: "تنظیمات", href: "/dashboard/settings" },
];

export const PETRO_NAV: NavItem[] = [
  { label: "داشبورد", href: "/petro/dashboard" },
  { label: "مأموریت جدید", href: "/petro/missions/new" },
  { label: "مأموریت‌ها", href: "/petro/missions" },
  { label: "رانندگان مجاز", href: "/petro/drivers" },
  { label: "تانکرهای مجاز", href: "/petro/vehicles" },
  { label: "مقاصد مجاز", href: "/petro/destinations" },
  { label: "هشدارها", href: "/petro/alerts" },
  { label: "گزارش‌ها", href: "/petro/reports" },
  { label: "اشتراک", href: "/petro/subscription" },
];

export const TRANSPORT_NAV: NavItem[] = [
  { label: "داشبورد", href: "/transport/dashboard" },
  { label: "رانندگان ما", href: "/transport/drivers" },
  { label: "تانکرهای ما", href: "/transport/vehicles" },
  { label: "مأموریت‌ها", href: "/transport/missions" },
];

export const DESTINATION_NAV: NavItem[] = [
  { label: "داشبورد", href: "/destination/dashboard" },
  { label: "مأموریت‌های ورودی", href: "/destination/inbound" },
  { label: "تخلیه‌ها", href: "/destination/unloading" },
  { label: "سوابق", href: "/destination/history" },
];

export const OBSERVER_NAV: NavItem[] = [
  { label: "داشبورد نظارتی", href: "/observer/dashboard" },
  { label: "پتروشیمی‌ها", href: "/observer/organizations" },
  { label: "مأموریت‌ها", href: "/observer/missions" },
  { label: "هشدارها", href: "/observer/alerts" },
  { label: "گزارش‌ها", href: "/observer/reports" },
];

export const DRIVER_BOTTOM_NAV: NavItem[] = [
  { label: "خانه", href: "/driver" },
  { label: "سوابق", href: "/driver/history" },
  { label: "مدارک", href: "/driver/documents" },
  { label: "پروفایل", href: "/driver/profile" },
];

export const PATROL_BOTTOM_NAV: NavItem[] = [
  { label: "استعلام", href: "/patrol/inquiry" },
  { label: "گزارش‌های من", href: "/patrol/reports" },
  { label: "مغایرت‌ها", href: "/patrol/discrepancies" },
  { label: "پروفایل", href: "/patrol/profile" },
];
