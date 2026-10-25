/**
 * Schema Drizzle cho Cloudflare D1 (SQLite).
 * Tên bảng/cột khớp 100% với DDL trong migrations/0001_init.sql (tạo bởi phiên bản Prisma trước đây)
 * nên dữ liệu đang có trên D1 dùng được ngay. Sửa schema → `npm run db:migration -- ten-thay-doi`.
 */
import { relations, sql } from "drizzle-orm";
import { customType, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createId } from "./id";
import {
  GENDER_VALUES, JOB_STATUS_VALUES, LEAD_STATUS_VALUES, LEAD_TYPE_VALUES, POST_STATUS_VALUES, PROGRAM_TYPE_VALUES, ROLE_VALUES,
} from "./enums";

/** DATETIME lưu dạng chuỗi ISO-8601 (UTC). Đọc được cả dạng CURRENT_TIMESTAMP "YYYY-MM-DD HH:MM:SS" và số mili-giây. */
export const datetime = customType<{ data: Date; driverData: string | number }>({
  dataType: () => "datetime",
  toDriver: (value: Date) => value.toISOString(),
  fromDriver: (value) => {
    if (typeof value === "number") return new Date(value);
    const s = String(value);
    return new Date(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s) ? `${s.replace(" ", "T")}Z` : s);
  },
});

const now = () => new Date();
const id = () => text("id").primaryKey().$defaultFn(createId);
const createdAt = () => datetime("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`).$defaultFn(now);
const updatedAt = () => datetime("updatedAt").notNull().$defaultFn(now).$onUpdateFn(now);

// ---------- TÀI KHOẢN ----------

export const users = sqliteTable(
  "User",
  {
    id: id(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("passwordHash").notNull(),
    role: text("role", { enum: ROLE_VALUES }).notNull().default("EDITOR"),
    isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
    lastLoginAt: datetime("lastLoginAt"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("User_email_key").on(t.email)]
);

// ---------- BÀI VIẾT ----------

export const categories = sqliteTable(
  "Category",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    order: integer("order").notNull().default(0),
    isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("Category_slug_key").on(t.slug)]
);

export const tags = sqliteTable(
  "Tag",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("Tag_slug_key").on(t.slug)]
);

export const posts = sqliteTable(
  "Post",
  {
    id: id(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    /** HTML từ trình soạn thảo */
    content: text("content").notNull().default(""),
    coverImage: text("coverImage"),
    status: text("status", { enum: POST_STATUS_VALUES }).notNull().default("DRAFT"),
    /** Thời điểm xuất bản; bài hẹn giờ là thời điểm sẽ hiển thị */
    publishedAt: datetime("publishedAt"),
    isFeatured: integer("isFeatured", { mode: "boolean" }).notNull().default(false),
    viewCount: integer("viewCount").notNull().default(0),
    metaTitle: text("metaTitle"),
    metaDescription: text("metaDescription"),
    ogImage: text("ogImage"),
    categoryId: text("categoryId").references(() => categories.id, { onDelete: "set null", onUpdate: "cascade" }),
    authorId: text("authorId").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("Post_slug_key").on(t.slug),
    index("Post_status_publishedAt_idx").on(t.status, t.publishedAt),
    index("Post_categoryId_idx").on(t.categoryId),
  ]
);

/** Bảng nối bài viết – thẻ (nhiều-nhiều). Cột A = Post.id, B = Tag.id (giữ tên cột cũ). */
export const postTags = sqliteTable(
  "_PostToTag",
  {
    postId: text("A").notNull().references(() => posts.id, { onDelete: "cascade", onUpdate: "cascade" }),
    tagId: text("B").notNull().references(() => tags.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (t) => [uniqueIndex("_PostToTag_AB_unique").on(t.postId, t.tagId), index("_PostToTag_B_index").on(t.tagId)]
);

// ---------- THỊ TRƯỜNG & ĐƠN HÀNG ----------

export const markets = sqliteTable(
  "Market",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    countryCode: text("countryCode"),
    image: text("image"),
    summary: text("summary"),
    description: text("description").notNull().default(""),
    requirements: text("requirements"),
    salaryRange: text("salaryRange"),
    cost: text("cost"),
    duration: text("duration"),
    /** Mảng JSON dạng chuỗi, đọc bằng parseStringList() */
    industries: text("industries").notNull().default("[]"),
    highlights: text("highlights").notNull().default("[]"),
    isFeatured: integer("isFeatured", { mode: "boolean" }).notNull().default(false),
    isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
    order: integer("order").notNull().default(0),
    metaTitle: text("metaTitle"),
    metaDescription: text("metaDescription"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("Market_slug_key").on(t.slug)]
);

/** Chương trình / nhóm đơn hàng – là các tab của bảng đơn hàng trên trang chủ (vd. Thực tập sinh, Kỹ năng đặc định, Điều dưỡng) */
export const jobPrograms = sqliteTable(
  "JobProgram",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    order: integer("order").notNull().default(0),
    isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("JobProgram_slug_key").on(t.slug)]
);

export const jobOrders = sqliteTable(
  "JobOrder",
  {
    id: id(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    marketId: text("marketId").notNull().references(() => markets.id, { onDelete: "restrict", onUpdate: "cascade" }),
    /** Tab chương trình trên trang chủ (JobProgram.id); null = không hiện trong bảng */
    programId: text("programId"),
    industry: text("industry").notNull(),
    quantity: integer("quantity").notNull().default(1),
    gender: text("gender", { enum: GENDER_VALUES }).notNull().default("ANY"),
    ageMin: integer("ageMin"),
    ageMax: integer("ageMax"),
    salaryText: text("salaryText"),
    /** Lương quy đổi VNĐ/tháng để lọc */
    salaryVnd: integer("salaryVnd"),
    cost: text("cost"),
    location: text("location"),
    deadline: datetime("deadline"),
    interviewDate: datetime("interviewDate"),
    departureNote: text("departureNote"),
    description: text("description").notNull().default(""),
    requirements: text("requirements"),
    benefits: text("benefits"),
    image: text("image"),
    status: text("status", { enum: JOB_STATUS_VALUES }).notNull().default("OPEN"),
    isFeatured: integer("isFeatured", { mode: "boolean" }).notNull().default(false),
    viewCount: integer("viewCount").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("JobOrder_slug_key").on(t.slug),
    index("JobOrder_status_marketId_idx").on(t.status, t.marketId),
    index("JobOrder_industry_idx").on(t.industry),
    index("JobOrder_programId_idx").on(t.programId),
  ]
);

// ---------- ĐĂNG KÝ TƯ VẤN / ỨNG TUYỂN ----------

export const leads = sqliteTable(
  "Lead",
  {
    id: id(),
    type: text("type", { enum: LEAD_TYPE_VALUES }).notNull().default("CONSULTATION"),
    fullName: text("fullName").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    birthYear: integer("birthYear"),
    hometown: text("hometown"),
    marketId: text("marketId").references(() => markets.id, { onDelete: "set null", onUpdate: "cascade" }),
    jobOrderId: text("jobOrderId").references(() => jobOrders.id, { onDelete: "set null", onUpdate: "cascade" }),
    message: text("message"),
    status: text("status", { enum: LEAD_STATUS_VALUES }).notNull().default("NEW"),
    adminNote: text("adminNote"),
    source: text("source"),
    ipAddress: text("ipAddress"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("Lead_status_createdAt_idx").on(t.status, t.createdAt)]
);

// ---------- NỘI DUNG KHÁC ----------

export const testimonials = sqliteTable("Testimonial", {
  id: id(),
  name: text("name").notNull(),
  position: text("position"),
  content: text("content").notNull(),
  avatar: text("avatar"),
  rating: integer("rating").notNull().default(5),
  order: integer("order").notNull().default(0),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const faqs = sqliteTable("Faq", {
  id: id(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  order: integer("order").notNull().default(0),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const partners = sqliteTable("Partner", {
  id: id(),
  name: text("name").notNull(),
  logo: text("logo"),
  website: text("website"),
  order: integer("order").notNull().default(0),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const banners = sqliteTable("Banner", {
  id: id(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  image: text("image").notNull(),
  ctaText: text("ctaText"),
  ctaLink: text("ctaLink"),
  ctaText2: text("ctaText2"),
  ctaLink2: text("ctaLink2"),
  order: integer("order").notNull().default(0),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const trainingPrograms = sqliteTable(
  "TrainingProgram",
  {
    id: id(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    type: text("type", { enum: PROGRAM_TYPE_VALUES }).notNull().default("LANGUAGE"),
    summary: text("summary"),
    content: text("content").notNull().default(""),
    image: text("image"),
    duration: text("duration"),
    tuition: text("tuition"),
    order: integer("order").notNull().default(0),
    isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("TrainingProgram_slug_key").on(t.slug)]
);

/** Thư viện ảnh đã upload lên R2 */
export const media = sqliteTable("Media", {
  id: id(),
  url: text("url").notNull(),
  /** Key trong bucket R2 để xóa file */
  storageKey: text("storageKey"),
  filename: text("filename").notNull(),
  mimeType: text("mimeType").notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt"),
  uploadedById: text("uploadedById").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
  createdAt: createdAt(),
});

/** Cài đặt chung – chỉ có 1 dòng (id = 1) */
export const settings = sqliteTable("Setting", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyName: text("companyName").notNull(),
  shortName: text("shortName"),
  slogan: text("slogan"),
  logo: text("logo"),
  licenseNumber: text("licenseNumber"),
  licenseIssuer: text("licenseIssuer"),
  taxCode: text("taxCode"),
  hotline: text("hotline").notNull(),
  zalo: text("zalo"),
  email: text("email"),
  address: text("address"),
  mapEmbedUrl: text("mapEmbedUrl"),
  workingHours: text("workingHours"),
  facebook: text("facebook"),
  youtube: text("youtube"),
  tiktok: text("tiktok"),
  messenger: text("messenger"),
  foundedYear: integer("foundedYear"),
  statWorkers: integer("statWorkers"),
  statYears: integer("statYears"),
  statPartners: integer("statPartners"),
  statMarkets: integer("statMarkets"),
  aboutShort: text("aboutShort"),
  aboutContent: text("aboutContent"),
  vision: text("vision"),
  mission: text("mission"),
  metaTitle: text("metaTitle"),
  metaDescription: text("metaDescription"),
  ogImage: text("ogImage"),
  /** Khối "bảng đơn hàng theo chương trình" ở trang chủ */
  jobTableTitle: text("jobTableTitle"),
  jobTableEnabled: integer("jobTableEnabled", { mode: "boolean" }).notNull().default(true),
  updatedAt: updatedAt(),
});

// ---------- QUAN HỆ (dùng cho db.query.*.findMany({ with: ... })) ----------

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  media: many(media),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  category: one(categories, { fields: [posts.categoryId], references: [categories.id] }),
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  postTags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, { fields: [postTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postTags.tagId], references: [tags.id] }),
}));

export const marketsRelations = relations(markets, ({ many }) => ({
  jobOrders: many(jobOrders),
  leads: many(leads),
}));

export const jobProgramsRelations = relations(jobPrograms, ({ many }) => ({
  jobOrders: many(jobOrders),
}));

export const jobOrdersRelations = relations(jobOrders, ({ one, many }) => ({
  market: one(markets, { fields: [jobOrders.marketId], references: [markets.id] }),
  program: one(jobPrograms, { fields: [jobOrders.programId], references: [jobPrograms.id] }),
  leads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  market: one(markets, { fields: [leads.marketId], references: [markets.id] }),
  jobOrder: one(jobOrders, { fields: [leads.jobOrderId], references: [jobOrders.id] }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  uploadedBy: one(users, { fields: [media.uploadedById], references: [users.id] }),
}));
