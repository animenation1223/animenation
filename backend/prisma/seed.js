"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const PRODUCTS = [
    {
        title: "Gojo Infinity Minimalist Oversized Tee",
        description: "Infinity is not a barrier — it's a statement. 240 GSM ring-spun cotton. Pre-shrunk. DTG printed.",
        price: 899,
        comparePrice: 1199,
        category: "oversized-tshirts",
        animeSeries: "jujutsu-kaisen",
        tags: ["trending", "bestseller", "new-arrival"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        gsm: "240",
        printType: "DTG",
        stock: 47,
        rating: 4.8,
        reviewCount: 312,
    },
    {
        title: "Demon Slayer Rengoku Flame Pillar Hoodie",
        description: "320 GSM heavyweight fleece with Flame Breathing domain art across the back.",
        price: 1799,
        comparePrice: 2299,
        category: "hoodies",
        animeSeries: "demon-slayer",
        tags: ["limited", "trending", "bestseller"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        gsm: "320",
        printType: "DTG",
        stock: 38,
        rating: 4.9,
        reviewCount: 189,
    },
    {
        title: "Naruto Shadow Clone Technique Poster — A3",
        description: "A3 premium matte print. Museum-quality wall art.",
        price: 499,
        comparePrice: 699,
        category: "posters",
        animeSeries: "naruto",
        tags: ["bestseller", "new-arrival"],
        stock: 120,
        rating: 4.7,
        reviewCount: 94,
    },
    {
        title: "Attack on Titan Survey Corps Heavyweight Tee",
        description: "Survey Corps emblem in distressed field-worn print style. 240 GSM cotton.",
        price: 799,
        comparePrice: 999,
        category: "t-shirts",
        animeSeries: "attack-on-titan",
        tags: ["bestseller", "trending"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        gsm: "240",
        printType: "DTG",
        stock: 65,
        rating: 4.7,
        reviewCount: 228,
    },
    {
        title: "Chainsaw Man — Pochita Embroidered Hoodie",
        description: "Chest-embroidered Pochita on 320 GSM fleece.",
        price: 1999,
        comparePrice: 2599,
        category: "hoodies",
        animeSeries: "chainsaw-man",
        tags: ["limited", "new-arrival"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        gsm: "320",
        printType: "Embroidery",
        stock: 22,
        rating: 4.9,
        reviewCount: 76,
    },
    {
        title: "Jujutsu Kaisen Domain Expansion Sticker Pack",
        description: "5 premium die-cut vinyl stickers. UV-protected. Waterproof.",
        price: 299,
        comparePrice: 399,
        category: "stickers",
        animeSeries: "jujutsu-kaisen",
        tags: ["bestseller", "trending"],
        stock: 210,
        rating: 4.8,
        reviewCount: 441,
    },
    {
        title: "One Piece — Thousand Sunny Keychain (Metal)",
        description: "Die-cast metal keychain with lion figurehead detail.",
        price: 349,
        comparePrice: 499,
        category: "keychains",
        animeSeries: "one-piece",
        tags: ["bestseller", "new-arrival"],
        stock: 88,
        rating: 4.6,
        reviewCount: 167,
    },
    {
        title: "Dragon Ball Super — Ultra Instinct Goku XL Desk Mat",
        description: "800×400mm extended desk mat with anti-slip rubber base.",
        price: 649,
        comparePrice: 899,
        category: "mouse-pads",
        animeSeries: "dragon-ball",
        tags: ["trending", "bestseller"],
        stock: 55,
        rating: 4.8,
        reviewCount: 103,
    },
    {
        title: "Spy x Family — Anya Heh Face Phone Cover",
        description: "Premium polycarbonate case. Slim-fit. Raised camera lip.",
        price: 449,
        comparePrice: 599,
        category: "phone-covers",
        animeSeries: "spy-x-family",
        tags: ["trending", "new-arrival", "bestseller"],
        stock: 132,
        rating: 4.9,
        reviewCount: 519,
    },
    {
        title: "Bleach — Ichigo Bankai Silhouette Oversized Tee",
        description: "High-contrast washed-art Bankai silhouette. 240 GSM cotton.",
        price: 899,
        comparePrice: 1199,
        category: "oversized-tshirts",
        animeSeries: "bleach",
        tags: ["trending", "new-arrival"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        gsm: "240",
        printType: "Screen Print",
        stock: 43,
        rating: 4.7,
        reviewCount: 88,
    },
];
const PINCODES = [
    { pincode: "400001", courier: "Delhivery", etaDays: 3 },
    { pincode: "110001", courier: "BlueDart", etaDays: 2 },
    { pincode: "560001", courier: "Shiprocket", etaDays: 4 },
    { pincode: "600001", courier: "DTDC", etaDays: 5 },
    { pincode: "700001", courier: "Delhivery", etaDays: 4 },
    { pincode: "500001", courier: "BlueDart", etaDays: 3 },
    { pincode: "302001", courier: "Shiprocket", etaDays: 5 },
    { pincode: "380001", courier: "Delhivery", etaDays: 3 },
];
async function main() {
    console.log("Seeding AnimeNation database...");
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@animenation.local").toLowerCase();
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: { role: "admin" },
        create: {
            email: adminEmail,
            name: "Admin",
            role: "admin",
            loyalty: {
                create: {
                    points: 5000,
                    referralCode: "ANADMIN01",
                },
            },
        },
    });
    for (const p of PRODUCTS) {
        const existing = await prisma.product.findFirst({ where: { title: p.title } });
        if (!existing) {
            await prisma.product.create({ data: { ...p, isActive: true, images: [] } });
        }
    }
    const coupons = [
        { code: "OTAKU10", type: client_1.CouponType.percent, discount: 10, minOrder: 0 },
        { code: "ANIME20", type: client_1.CouponType.percent, discount: 20, minOrder: 999 },
        { code: "NEWAV15", type: client_1.CouponType.percent, discount: 15, minOrder: 500 },
        { code: "FLAT100", type: client_1.CouponType.flat, discount: 100, minOrder: 1500, active: false },
    ];
    for (const c of coupons) {
        await prisma.coupon.upsert({
            where: { code: c.code },
            update: {},
            create: {
                ...c,
                active: c.active ?? true,
                expiresAt: new Date("2026-12-31"),
            },
        });
    }
    const banners = [
        {
            title: "New Season Drop",
            subtitle: "JJK · Demon Slayer · Chainsaw Man",
            cta: "Shop Now",
            link: "/products",
            gradient: "from-primary/80 to-accent/60",
            sortOrder: 0,
        },
        {
            title: "Free Shipping",
            subtitle: "On orders above ₹999",
            cta: "Browse Hoodies",
            link: "/products?category=hoodies",
            gradient: "from-accent/70 to-primary/50",
            sortOrder: 1,
        },
    ];
    if ((await prisma.banner.count()) === 0) {
        await prisma.banner.createMany({ data: banners });
    }
    for (const p of PINCODES) {
        await prisma.pincodeServiceability.upsert({
            where: { pincode: p.pincode },
            update: p,
            create: { ...p, cod: true },
        });
    }
    const blogCount = await prisma.blogPost.count();
    if (blogCount === 0) {
        await prisma.blogPost.createMany({
            data: [
                {
                    title: "Top 10 Anime Hoodies for 2026",
                    slug: "top-anime-hoodies-2026",
                    excerpt: "From JJK domains to Demon Slayer flames — our curated hoodie list.",
                    category: "guides",
                    tags: ["hoodies", "trending"],
                    author: "AnimeNation Team",
                    isPublished: true,
                    publishedDate: new Date(),
                    readTime: 6,
                    featured: true,
                },
                {
                    title: "How to Style Oversized Anime Tees",
                    slug: "style-oversized-anime-tees",
                    excerpt: "Streetwear tips for otaku fits that actually look intentional.",
                    category: "style",
                    tags: ["fashion", "tees"],
                    author: "AnimeNation Team",
                    isPublished: true,
                    publishedDate: new Date(Date.now() - 86400000),
                    readTime: 4,
                },
                {
                    title: "Collector's Guide: Limited Drops",
                    slug: "collectors-guide-limited-drops",
                    excerpt: "Never miss a limited run again — notifications, sizing, and resale ethics.",
                    category: "collecting",
                    tags: ["limited"],
                    author: "AnimeNation Team",
                    isPublished: true,
                    publishedDate: new Date(Date.now() - 172800000),
                    readTime: 8,
                },
            ],
        });
    }
    console.log("Seed complete.");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map