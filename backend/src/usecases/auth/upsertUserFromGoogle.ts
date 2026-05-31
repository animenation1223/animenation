import { prisma } from "../../infra/prisma";

export async function upsertUserFromGoogle(input: { email: string; name?: string | null; pictureUrl?: string | null }) {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const isAdmin = adminEmail && input.email.toLowerCase() === adminEmail;

  const user = await prisma.user.upsert({
    where: { email: input.email.toLowerCase() },
    update: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.pictureUrl ? { pictureUrl: input.pictureUrl } : {}),
      ...(isAdmin ? { role: "admin" } : {}),
    },
    create: {
      email: input.email.toLowerCase(),
      name: input.name || null,
      pictureUrl: input.pictureUrl || null,
      role: isAdmin ? "admin" : "user",
      loyalty: {
        create: {
          points: 0,
          referralCode: `AV${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        },
      },
    },
  });

  return user;
}

