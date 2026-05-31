const SORT_FIELD_MAP: Record<string, string> = {
  created_date: "createdAt",
  published_date: "publishedDate",
  rating: "rating",
  title: "title",
  price: "price",
  stock: "stock",
};

export function parseSort(sort?: string): Record<string, "asc" | "desc"> {
  if (!sort) return { createdAt: "desc" };
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;
  const prismaField = SORT_FIELD_MAP[field] || field;
  return { [prismaField]: desc ? "desc" : "asc" };
}
