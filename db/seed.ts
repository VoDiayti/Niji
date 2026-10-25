/**
 * Sinh dữ liệu mẫu cho Cloudflare D1.
 * Script này KHÔNG kết nối database: nó tạo file db/seed.sql, sau đó wrangler áp dụng file đó:
 *   npm run db:seed          → D1 local (dùng với `next dev` / `npm run preview`)
 *   npm run db:seed:remote   → D1 production
 * ID các bản ghi được sinh ổn định theo tên nên chạy lại nhiều lần không tạo bản ghi trùng (INSERT OR IGNORE).
 *
 * LƯU Ý: thông tin công ty, số giấy phép, số liệu, đối tác... bên dưới là DỮ LIỆU MẪU – sửa trong Admin → Cài đặt chung.
 */
import "dotenv/config";
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { hashPassword } from "../src/lib/password";

type Value = string | number | boolean | Date | null | undefined;
type Row = Record<string, Value>;

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000);
const daysAhead = (d: number) => new Date(now.getTime() + d * 86_400_000);
const FOUNDED_YEAR = 2012;

/** ID ổn định theo nhãn (dạng cuid 25 ký tự) */
const sid = (label: string) => `c${createHash("sha256").update(`niji-seed:${label}`).digest("hex").slice(0, 24)}`;
const json = (list: string[]) => JSON.stringify(list);
const stamps = (createdAt: Date = now) => ({ createdAt, updatedAt: now });

function lit(v: Value): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "1" : "0";
  if (typeof v === "number") return String(v);
  if (v instanceof Date) return `'${v.toISOString()}'`;
  return `'${v.replace(/'/g, "''")}'`;
}

const statements: string[] = [];
function insert(table: string, rows: Row[]) {
  for (const row of rows) {
    const cols = Object.keys(row);
    statements.push(`INSERT OR IGNORE INTO "${table}" (${cols.map((c) => `"${c}"`).join(", ")}) VALUES (${cols.map((c) => lit(row[c])).join(", ")});`);
  }
}

async function main() {
  // ---------- CÀI ĐẶT CHUNG ----------
  insert("Setting", [
    {
      id: 1,
      companyName: "Công ty TNHH Nhân lực Quốc tế NIJI",
      shortName: "NIJI",
      slogan: "Vững bước tương lai – Vươn tầm quốc tế",
      logo: "/logo-full.svg",
      licenseNumber: "1234/LĐTBXH-GP",
      licenseIssuer: "Cục Quản lý lao động ngoài nước",
      taxCode: "0100000000",
      hotline: "0909 000 000",
      zalo: "0909000000",
      email: "tuvan@niji-xkld.vn",
      address: "Tầng 5, Tòa nhà ABC, 123 Nguyễn Trãi, P. Thanh Xuân, TP. Hà Nội",
      mapEmbedUrl: "https://www.google.com/maps?q=Nguy%E1%BB%85n+Tr%C3%A3i,+Thanh+Xu%C3%A2n,+H%C3%A0+N%E1%BB%99i&output=embed",
      workingHours: "Thứ 2 – Thứ 7: 8:00 – 17:30",
      facebook: "https://www.facebook.com/",
      youtube: "https://www.youtube.com/",
      tiktok: "https://www.tiktok.com/",
      messenger: "https://m.me/",
      foundedYear: FOUNDED_YEAR,
      statWorkers: 8500,
      statYears: now.getFullYear() - FOUNDED_YEAR,
      statPartners: 120,
      statMarkets: 6,
      aboutShort:
        "NIJI là doanh nghiệp được cấp phép hoạt động dịch vụ đưa người lao động Việt Nam đi làm việc ở nước ngoài theo hợp đồng. Hơn một thập kỷ qua, chúng tôi đã đồng hành cùng hàng nghìn lao động và thực tập sinh sang Nhật Bản, Hàn Quốc, Đài Loan, Đức và châu Âu với chi phí minh bạch, đào tạo bài bản và hỗ trợ toàn diện trước – trong – sau xuất cảnh.",
      vision: "Trở thành đơn vị cung ứng nhân lực Việt Nam ra nước ngoài uy tín hàng đầu, được người lao động và đối tác quốc tế tin chọn.",
      mission:
        "Mang đến cho người lao động Việt Nam cơ hội việc làm thu nhập cao, môi trường an toàn và lộ trình phát triển nghề nghiệp rõ ràng; đồng thời cung cấp cho đối tác nguồn nhân lực được đào tạo kỹ lưỡng, kỷ luật và tận tâm.",
      aboutContent: `<h2>Lịch sử hình thành và phát triển</h2>
<ul>
  <li><strong>2012</strong> – Thành lập công ty, được cấp giấy phép hoạt động dịch vụ đưa người lao động đi làm việc ở nước ngoài.</li>
  <li><strong>2014</strong> – Xuất cảnh lứa thực tập sinh đầu tiên sang Nhật Bản; khánh thành trung tâm đào tạo tiếng Nhật.</li>
  <li><strong>2017</strong> – Mở rộng thị trường Đài Loan và Hàn Quốc (chương trình EPS).</li>
  <li><strong>2020</strong> – Triển khai chương trình điều dưỡng và du học nghề CHLB Đức.</li>
  <li><strong>2023</strong> – Cán mốc 5.000 lao động xuất cảnh; mở thêm văn phòng tại TP. Hồ Chí Minh.</li>
  <li><strong>2026</strong> – Hơn 8.500 lao động đã xuất cảnh, hợp tác với hơn 120 nghiệp đoàn và doanh nghiệp tiếp nhận.</li>
</ul>
<h2>Giấy phép hoạt động</h2>
<p>Công ty được cấp Giấy phép số <strong>1234/LĐTBXH-GP</strong> về hoạt động dịch vụ đưa người lao động Việt Nam đi làm việc ở nước ngoài theo hợp đồng. Mọi hợp đồng, mức phí và quyền lợi của người lao động đều được công khai, minh bạch và tuân thủ Luật Người lao động Việt Nam đi làm việc ở nước ngoài theo hợp đồng.</p>
<h2>Đội ngũ</h2>
<p>Hơn 80 cán bộ, giáo viên và tư vấn viên giàu kinh nghiệm, trong đó nhiều người từng là thực tập sinh, kỹ sư tại Nhật Bản, Hàn Quốc – thấu hiểu khó khăn của người lao động và hỗ trợ sát sao từ khi đăng ký đến khi về nước.</p>
<h2>Cơ sở đào tạo</h2>
<p>Trung tâm đào tạo rộng 3.000 m² với 20 phòng học, khu ký túc xá 300 chỗ, xưởng thực hành kỹ năng (cơ khí, xây dựng, điều dưỡng) và phòng mô phỏng phỏng vấn trực tuyến với nghiệp đoàn.</p>`,
      metaTitle: "NIJI – Xuất khẩu lao động Nhật Bản, Hàn Quốc, Đài Loan, Đức uy tín",
      metaDescription:
        "Công ty xuất khẩu lao động NIJI – tuyển dụng đơn hàng Nhật Bản, Hàn Quốc, Đài Loan, Đức, châu Âu. Chi phí minh bạch, đào tạo bài bản, hỗ trợ trọn gói.",
      ogImage: "/og-default.jpg",
      jobTableTitle: "Việc làm tại Nhật Bản & các thị trường",
      jobTableEnabled: true,
      updatedAt: now,
    },
  ]);

  // ---------- TÀI KHOẢN ----------
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";
  const adminId = sid(`user:${adminEmail}`);
  const editorId = sid("user:bientap@niji-xkld.vn");
  insert("User", [
    { id: adminId, email: adminEmail, name: "Quản trị viên", passwordHash: await hashPassword(adminPassword), role: "ADMIN", isActive: true, ...stamps() },
    { id: editorId, email: "bientap@niji-xkld.vn", name: "Biên tập viên", passwordHash: await hashPassword("Editor@12345"), role: "EDITOR", isActive: true, ...stamps() },
  ]);

  // ---------- CHUYÊN MỤC & THẺ ----------
  const categories = [
    ["tin-tuc-xkld", "Tin tức XKLĐ", "Thông tin thị trường, chính sách và cơ hội việc làm ngoài nước"],
    ["kinh-nghiem", "Kinh nghiệm", "Kinh nghiệm thi tuyển, học tiếng, sinh sống và làm việc"],
    ["chinh-sach", "Chính sách – Pháp luật", "Quy định pháp luật, visa và quyền lợi người lao động"],
    ["hoat-dong-cong-ty", "Hoạt động công ty", "Lễ xuất cảnh, khai giảng, phỏng vấn và sự kiện"],
  ] as const;
  const cat = (slug: string) => sid(`category:${slug}`);
  insert("Category", categories.map(([slug, name, description], i) => ({ id: cat(slug), name, slug, description, order: i + 1, isActive: true, ...stamps() })));

  const tags = [
    ["nhat-ban", "Nhật Bản"], ["han-quoc", "Hàn Quốc"], ["dai-loan", "Đài Loan"], ["duc", "Đức"], ["chau-au", "Châu Âu"],
    ["chi-phi", "Chi phí"], ["thu-tuc", "Thủ tục"], ["visa", "Visa"], ["ky-nang-dac-dinh", "Kỹ năng đặc định"], ["dieu-duong", "Điều dưỡng"], ["eps", "EPS"],
  ] as const;
  const tag = (slug: string) => sid(`tag:${slug}`);
  insert("Tag", tags.map(([slug, name]) => ({ id: tag(slug), name, slug, createdAt: now })));

  // ---------- THỊ TRƯỜNG ----------
  const market = (slug: string) => sid(`market:${slug}`);
  insert("Market", [
    {
      id: market("nhat-ban"), name: "Nhật Bản", slug: "nhat-ban", countryCode: "JP", image: "/images/nhat-ban-shibuya.jpg", order: 1, isFeatured: true, isActive: true,
      summary: "Thị trường lớn nhất, thu nhập ổn định, môi trường kỷ luật và nhiều cơ hội gia hạn lên tới 5 năm hoặc chuyển sang visa Kỹ năng đặc định.",
      salaryRange: "28 – 40 triệu VNĐ/tháng (chưa tính tăng ca)",
      cost: "Theo quy định của pháp luật, tối đa tương đương 1 tháng lương cho mỗi năm hợp đồng; được công khai chi tiết trong hợp đồng",
      duration: "3 năm (gia hạn lên 5 năm hoặc chuyển Kỹ năng đặc định)",
      industries: json(["Cơ khí – chế tạo", "Điện tử – lắp ráp", "Xây dựng", "Chế biến thực phẩm", "Nông nghiệp", "Điều dưỡng – hộ lý", "Dệt may"]),
      highlights: json(["Thu nhập 28 – 40 triệu/tháng, tăng ca theo luật", "Đào tạo tiếng Nhật N5 – N4 trước xuất cảnh", "Hơn 60 nghiệp đoàn đối tác tại Tokyo, Osaka, Aichi, Fukuoka", "Lộ trình gia hạn 5 năm & Kỹ năng đặc định rõ ràng"]),
      description: `<h2>Tổng quan thị trường Nhật Bản</h2><p>Nhật Bản là thị trường tiếp nhận nhiều lao động Việt Nam nhất với các chương trình <strong>Thực tập sinh kỹ năng</strong> và <strong>Kỹ năng đặc định (Tokutei Ginou)</strong>. Người lao động được làm việc trong môi trường chuyên nghiệp, an toàn, hưởng đầy đủ bảo hiểm và chế độ như lao động bản địa.</p><h2>Lộ trình tham gia</h2><ol><li>Đăng ký tư vấn, kiểm tra sức khỏe sơ bộ và chọn đơn hàng phù hợp.</li><li>Học tiếng Nhật và kỹ năng tại trung tâm đào tạo (3 – 6 tháng).</li><li>Thi tuyển với nghiệp đoàn/công ty tiếp nhận (trực tiếp hoặc online).</li><li>Hoàn thiện hồ sơ xin tư cách lưu trú, visa và xuất cảnh.</li></ol><h2>Chi phí và quyền lợi</h2><p>Chi phí được niêm yết công khai theo từng đơn hàng. Người lao động được hỗ trợ vay vốn ngân hàng, được tư vấn miễn phí và hoàn tiền theo quy định nếu không trúng tuyển.</p>`,
      requirements: `<ul><li>Nam/nữ từ 18 – 35 tuổi (tùy đơn hàng), tốt nghiệp THCS trở lên.</li><li>Sức khỏe tốt, không mắc các bệnh thuộc danh mục cấm xuất cảnh, không xăm hình lớn.</li><li>Không có tiền án tiền sự, chưa từng cư trú bất hợp pháp tại Nhật.</li><li>Có ý thức kỷ luật, chịu khó, sẵn sàng học tiếng Nhật.</li></ul>`,
      metaTitle: "Xuất khẩu lao động Nhật Bản 2026 – Điều kiện, chi phí, mức lương",
      metaDescription: "Thông tin đầy đủ về xuất khẩu lao động Nhật Bản: điều kiện, chi phí, mức lương 28–40 triệu, ngành nghề phổ biến và lộ trình tham gia.",
      ...stamps(),
    },
    {
      id: market("han-quoc"), name: "Hàn Quốc", slug: "han-quoc", countryCode: "KR", image: "/images/han-quoc-seoul.jpg", order: 2, isFeatured: true, isActive: true,
      summary: "Chương trình EPS (visa E-9) do Chính phủ hai nước phối hợp – chi phí thấp, lương cao, hợp đồng 4 năm 10 tháng.",
      salaryRange: "35 – 50 triệu VNĐ/tháng",
      cost: "Chi phí thấp theo chương trình phi lợi nhuận EPS (chủ yếu là lệ phí thi tiếng, khám sức khỏe, vé máy bay)",
      duration: "4 năm 10 tháng (có thể quay lại theo diện lao động trung thành)",
      industries: json(["Sản xuất chế tạo", "Nông nghiệp – chăn nuôi", "Ngư nghiệp", "Xây dựng", "Đóng tàu"]),
      highlights: json(["Lương cơ bản cao, tăng ca nhiều", "Chi phí thấp nhất trong các thị trường", "Được bảo hiểm và hưởng trợ cấp thôi việc", "Nhu cầu tuyển lớn ngành sản xuất chế tạo"]),
      description: `<h2>Chương trình EPS Hàn Quốc</h2><p>EPS là chương trình cấp phép việc làm cho lao động nước ngoài của Chính phủ Hàn Quốc. Người lao động cần vượt qua <strong>kỳ thi tiếng Hàn EPS-TOPIK</strong> và kiểm tra tay nghề, sau đó được giới thiệu với chủ sử dụng lao động Hàn Quốc.</p><h2>Ưu điểm</h2><ul><li>Lương tối thiểu theo luật Hàn Quốc, tăng ca và làm thêm được trả cao.</li><li>Được tham gia 4 loại bảo hiểm và nhận trợ cấp thôi việc khi về nước.</li><li>Chi phí tham gia thấp, không mất phí môi giới.</li></ul>`,
      requirements: `<ul><li>Từ 18 – 39 tuổi, không có tiền án tiền sự.</li><li>Không thuộc diện bị cấm xuất cảnh, không có người thân cư trú bất hợp pháp tại Hàn Quốc.</li><li>Đạt kỳ thi tiếng Hàn EPS-TOPIK và kiểm tra tay nghề.</li><li>Đủ sức khỏe đi làm việc ở nước ngoài.</li></ul>`,
      metaTitle: "Xuất khẩu lao động Hàn Quốc EPS 2026 – Điều kiện, chi phí, mức lương",
      metaDescription: "Chương trình EPS Hàn Quốc: điều kiện 18–39 tuổi, chi phí thấp, lương 35–50 triệu/tháng, các ngành sản xuất, nông nghiệp, ngư nghiệp, xây dựng.",
      ...stamps(),
    },
    {
      id: market("dai-loan"), name: "Đài Loan", slug: "dai-loan", countryCode: "TW", image: "/images/dai-loan-taipei.jpg", order: 3, isFeatured: true, isActive: true,
      summary: "Thị trường dễ tham gia, chi phí hợp lý, không yêu cầu cao về tiếng, xuất cảnh nhanh – phù hợp lao động phổ thông.",
      salaryRange: "22 – 30 triệu VNĐ/tháng",
      cost: "Thấp hơn Nhật Bản, công khai theo từng đơn hàng",
      duration: "3 năm, gia hạn tối đa 12 năm",
      industries: json(["Điện tử", "Cơ khí", "Dệt may", "Chế biến thực phẩm", "Xây dựng", "Hộ lý – giúp việc gia đình"]),
      highlights: json(["Xuất cảnh nhanh (2 – 3 tháng)", "Không yêu cầu cao về ngoại ngữ", "Tăng ca nhiều, thu nhập thực tế cao", "Văn hóa gần gũi với Việt Nam"]),
      description: `<h2>Tổng quan thị trường Đài Loan</h2><p>Đài Loan có nhu cầu lớn về lao động trong các nhà máy điện tử, cơ khí, dệt may và lĩnh vực chăm sóc. Thời gian học tập trước xuất cảnh ngắn, chi phí hợp lý, thích hợp với người lao động muốn đi nhanh và có thu nhập ngay.</p><h2>Chế độ</h2><ul><li>Lương cơ bản theo quy định của Đài Loan, tăng ca tính 1,33 – 1,66 lần.</li><li>Được tham gia bảo hiểm lao động và bảo hiểm y tế.</li><li>Chủ sử dụng cung cấp ký túc xá, hỗ trợ ăn ở.</li></ul>`,
      requirements: `<ul><li>Nam/nữ 18 – 40 tuổi, tốt nghiệp THCS trở lên.</li><li>Sức khỏe tốt, không xăm hình lớn (tùy đơn hàng).</li><li>Chưa từng làm việc bất hợp pháp tại Đài Loan.</li></ul>`,
      metaTitle: "Xuất khẩu lao động Đài Loan 2026 – Chi phí thấp, xuất cảnh nhanh",
      metaDescription: "Xuất khẩu lao động Đài Loan: điều kiện 18–40 tuổi, chi phí hợp lý, lương 22–30 triệu/tháng, ngành điện tử, cơ khí, dệt may, hộ lý.",
      ...stamps(),
    },
    {
      id: market("duc"), name: "CHLB Đức", slug: "duc", countryCode: "DE", image: "/images/duc-berlin.jpg", order: 4, isFeatured: true, isActive: true,
      summary: "Du học nghề có lương và điều dưỡng viên tại Đức – lộ trình định cư lâu dài tại châu Âu với mức lương 2.300 – 3.500 EUR/tháng.",
      salaryRange: "1.200 – 1.400 EUR/tháng khi học nghề; 2.300 – 3.500 EUR/tháng sau tốt nghiệp",
      cost: "Chủ yếu là học phí tiếng Đức (B1/B2) và phí hồ sơ; học viên được trả lương trong suốt thời gian học nghề",
      duration: "Học nghề 3 năm, sau đó làm việc dài hạn và xin định cư",
      industries: json(["Điều dưỡng", "Nhà hàng – khách sạn", "Cơ điện tử", "Đầu bếp", "Xây dựng", "Logistics"]),
      highlights: json(["Được trả lương ngay khi học nghề", "Bằng nghề Đức được công nhận toàn châu Âu", "Cơ hội định cư, bảo lãnh người thân", "Hỗ trợ học tiếng Đức từ A1 đến B2"]),
      description: `<h2>Chương trình du học nghề và điều dưỡng Đức</h2><p>Nước Đức đang thiếu hụt nhân lực trầm trọng trong ngành điều dưỡng, nhà hàng – khách sạn và kỹ thuật. Người tham gia được học nghề 3 năm với <strong>lương học nghề 1.200 – 1.400 EUR/tháng</strong>, sau tốt nghiệp ký hợp đồng dài hạn và có thể xin định cư vĩnh viễn.</p><h2>Lộ trình</h2><ol><li>Học tiếng Đức tại Việt Nam đến trình độ B1 (8 – 12 tháng).</li><li>Phỏng vấn với cơ sở tiếp nhận tại Đức, ký hợp đồng học nghề.</li><li>Xin visa và sang Đức, học B2 và học nghề 3 năm.</li><li>Tốt nghiệp, làm việc chính thức với mức lương 2.300 – 3.500 EUR/tháng.</li></ol>`,
      requirements: `<ul><li>Từ 18 – 32 tuổi, tốt nghiệp THPT trở lên.</li><li>Đạt trình độ tiếng Đức B1 trước khi xuất cảnh (trung tâm hỗ trợ đào tạo).</li><li>Sức khỏe tốt, không có tiền án tiền sự.</li><li>Ưu tiên ứng viên đã học hoặc làm trong ngành y, điều dưỡng, nhà hàng.</li></ul>`,
      metaTitle: "Du học nghề & Điều dưỡng Đức 2026 – Học có lương, định cư lâu dài",
      metaDescription: "Chương trình du học nghề và điều dưỡng CHLB Đức: học nghề có lương 1.200–1.400 EUR, sau tốt nghiệp 2.300–3.500 EUR/tháng, cơ hội định cư.",
      ...stamps(),
    },
    {
      id: market("chau-au"), name: "Châu Âu (Ba Lan, Hungary, Rumani)", slug: "chau-au", countryCode: "EU", image: "/images/duc-pho-co.jpg", order: 5, isFeatured: false, isActive: true,
      summary: "Các nước Đông Âu có nhu cầu lớn về lao động xây dựng, cơ khí hàn, chế biến thực phẩm với điều kiện tham gia dễ, không yêu cầu ngoại ngữ.",
      salaryRange: "25 – 35 triệu VNĐ/tháng",
      cost: "Công khai theo từng đơn hàng; hỗ trợ trả góp",
      duration: "2 năm, gia hạn theo nhu cầu của chủ sử dụng",
      industries: json(["Xây dựng", "Cơ khí hàn", "Chế biến thực phẩm", "Lắp ráp điện tử", "Nông nghiệp", "Đóng gói – kho vận"]),
      highlights: json(["Không yêu cầu ngoại ngữ", "Độ tuổi tuyển rộng đến 45", "Môi trường sống châu Âu, cơ hội sang các nước Schengen", "Chủ lo chỗ ở, hỗ trợ ăn trưa"]),
      description: `<h2>Thị trường châu Âu</h2><p>Ba Lan, Hungary, Rumani và một số nước Đông Âu đang thiếu lao động phổ thông và lao động kỹ thuật. Thời gian hợp đồng linh hoạt, thủ tục visa lao động rõ ràng, phù hợp với người lao động lớn tuổi hơn hoặc chưa có ngoại ngữ.</p>`,
      requirements: `<ul><li>Nam/nữ 20 – 45 tuổi, sức khỏe tốt.</li><li>Có kinh nghiệm ngành nghề là lợi thế (hàn, xây dựng, may).</li><li>Không có tiền án tiền sự.</li></ul>`,
      metaTitle: "Xuất khẩu lao động châu Âu 2026 – Ba Lan, Hungary, Rumani",
      metaDescription: "Đơn hàng xuất khẩu lao động châu Âu: Ba Lan, Hungary, Rumani – không yêu cầu ngoại ngữ, tuổi đến 45, lương 25–35 triệu/tháng.",
      ...stamps(),
    },
    {
      id: market("uc"), name: "Úc (Australia)", slug: "uc", countryCode: "AU", image: "/images/nong-nghiep.jpg", order: 6, isFeatured: false, isActive: true,
      summary: "Chương trình lao động nông nghiệp Úc (PALM) với mức thu nhập cao nhất trong các thị trường, làm việc tại các trang trại và nhà máy chế biến.",
      salaryRange: "50 – 70 triệu VNĐ/tháng",
      cost: "Theo thỏa thuận chương trình; được hỗ trợ vé máy bay và chi phí ban đầu",
      duration: "1 – 4 năm",
      industries: json(["Nông nghiệp – thu hoạch", "Chế biến thịt", "Chăn nuôi", "Khách sạn vùng xa"]),
      highlights: json(["Thu nhập cao, tính theo giờ", "Được bảo vệ theo luật lao động Úc", "Ưu tiên lao động có kinh nghiệm nông nghiệp", "Tiếng Anh giao tiếp cơ bản"]),
      description: `<h2>Chương trình lao động Úc</h2><p>Úc mở cửa tiếp nhận lao động Việt Nam trong lĩnh vực nông nghiệp thông qua chương trình PALM. Người lao động làm việc tại các trang trại, nhà máy chế biến với mức lương theo giờ của Úc và được hưởng đầy đủ quyền lợi theo luật.</p>`,
      requirements: `<ul><li>Từ 21 – 45 tuổi, sức khỏe tốt, chịu được công việc ngoài trời.</li><li>Tiếng Anh giao tiếp cơ bản.</li><li>Ưu tiên có kinh nghiệm làm nông nghiệp, chăn nuôi.</li></ul>`,
      metaTitle: "Xuất khẩu lao động Úc 2026 – Nông nghiệp thu nhập cao",
      metaDescription: "Chương trình lao động nông nghiệp Úc: tuổi 21–45, thu nhập 50–70 triệu/tháng, làm việc tại trang trại và nhà máy chế biến.",
      ...stamps(),
    },
  ]);

  // ---------- CHƯƠNG TRÌNH (tab bảng đơn hàng trang chủ) ----------
  const jobProgram = (slug: string) => sid(`job-program:${slug}`);
  insert("JobProgram", [
    ["thuc-tap-sinh-nhat-ban", "Thực tập sinh Nhật Bản", "Chương trình thực tập sinh kỹ năng 3 – 5 năm tại Nhật Bản"],
    ["ky-nang-dac-dinh", "Kỹ năng đặc định", "Visa Tokutei Ginou – làm việc tới 5 năm, lương ngang người Nhật"],
    ["dieu-duong", "Điều dưỡng", "Điều dưỡng, hộ lý tại Nhật Bản và CHLB Đức"],
    ["ky-su", "Kỹ sư", "Kỹ sư, kỹ thuật viên có bằng cấp làm việc dài hạn"],
    ["eps-han-quoc", "EPS Hàn Quốc", "Chương trình cấp phép việc làm EPS của Chính phủ Hàn Quốc"],
    ["dai-loan", "Đài Loan", "Đơn hàng nhà máy, hộ lý tại Đài Loan"],
    ["chau-au-uc", "Châu Âu & Úc", "Ba Lan, Hungary, Rumani, Úc"],
  ].map(([slug, name, description], i) => ({ id: jobProgram(slug), name, slug, description, order: i + 1, isActive: true, ...stamps() })));
  const PROGRAM_OF_JOB: Record<string, string> = {
    "tuyen-30-nam-co-khi-che-tao-osaka": "thuc-tap-sinh-nhat-ban",
    "tuyen-20-nu-dien-tu-aichi": "thuc-tap-sinh-nhat-ban",
    "tuyen-15-che-bien-thuc-pham-hokkaido": "thuc-tap-sinh-nhat-ban",
    "tuyen-25-nam-xay-dung-cot-thep-tokyo": "thuc-tap-sinh-nhat-ban",
    "dieu-duong-ky-nang-dac-dinh-fukuoka": "ky-nang-dac-dinh",
    "eps-han-quoc-40-nam-san-xuat-gyeonggi": "eps-han-quoc",
    "eps-han-quoc-20-nu-nong-nghiep-jeolla": "eps-han-quoc",
    "tuyen-50-dien-tu-dao-vien-dai-loan": "dai-loan",
    "tuyen-20-nam-co-khi-dai-trung": "dai-loan",
    "dieu-duong-duc-hoc-nghe-co-luong-bayern": "dieu-duong",
    "tuyen-30-nam-xay-dung-warsaw-ba-lan": "chau-au-uc",
    "nong-nghiep-uc-palm-20-lao-dong-queensland": "chau-au-uc",
    "tuyen-10-nu-det-may-dai-loan-da-dong": "dai-loan",
  };

  // ---------- ĐƠN HÀNG ----------
  const benefits = `<ul><li>Ký túc xá đầy đủ tiện nghi, hỗ trợ chi phí ăn ở.</li><li>Tham gia đầy đủ bảo hiểm theo luật nước sở tại.</li><li>Tăng ca theo quy định, thưởng theo năng suất.</li><li>Được hỗ trợ thủ tục gia hạn hoặc chuyển đổi visa khi hết hợp đồng.</li></ul>`;
  const job = (slug: string) => sid(`job:${slug}`);
  const jobs: Row[] = [
    { slug: "tuyen-30-nam-co-khi-che-tao-osaka", title: "Tuyển 30 nam cơ khí chế tạo – Osaka, Nhật Bản", marketId: market("nhat-ban"), industry: "Cơ khí – chế tạo", quantity: 30, gender: "MALE", ageMin: 19, ageMax: 32, salaryText: "180.000 Yên/tháng (~31 triệu VNĐ) chưa tính tăng ca", salaryVnd: 31_000_000, cost: "Công khai khi tư vấn, hỗ trợ vay ngân hàng", location: "Osaka, Nhật Bản", deadline: daysAhead(25), interviewDate: daysAhead(30), departureNote: "Dự kiến xuất cảnh sau 5 – 6 tháng kể từ khi trúng tuyển", description: `<p>Công việc gia công kim loại, vận hành máy tiện – phay CNC, lắp ráp chi tiết máy tại nhà máy cơ khí lớn ở Osaka. Môi trường sạch sẽ, có máy lạnh, làm việc 8 tiếng/ngày, 5 ngày/tuần.</p><h3>Nội dung công việc</h3><ul><li>Vận hành máy gia công CNC theo bản vẽ.</li><li>Kiểm tra kích thước, chất lượng sản phẩm.</li><li>Bảo dưỡng máy móc định kỳ.</li></ul>`, requirements: `<ul><li>Nam 19 – 32 tuổi, cao từ 1m62, tốt nghiệp THCS trở lên.</li><li>Thị lực tốt, không mù màu, không xăm hình.</li><li>Ưu tiên có kinh nghiệm cơ khí hoặc tốt nghiệp trung cấp nghề.</li></ul>`, image: "/images/co-khi-han.jpg", isFeatured: true, status: "OPEN" },
    { slug: "tuyen-20-nu-dien-tu-aichi", title: "Tuyển 20 nữ điện tử lắp ráp linh kiện – Aichi, Nhật Bản", marketId: market("nhat-ban"), industry: "Điện tử – lắp ráp", quantity: 20, gender: "FEMALE", ageMin: 18, ageMax: 30, salaryText: "168.000 Yên/tháng (~29 triệu VNĐ)", salaryVnd: 29_000_000, cost: "Công khai khi tư vấn", location: "Aichi, Nhật Bản", deadline: daysAhead(18), interviewDate: daysAhead(22), departureNote: "Dự kiến xuất cảnh tháng 4/2027", description: `<p>Lắp ráp, kiểm tra linh kiện điện tử cho ô tô tại nhà máy thuộc tỉnh Aichi – trung tâm công nghiệp ô tô Nhật Bản. Công việc nhẹ nhàng, ngồi trong dây chuyền, tăng ca đều.</p>`, requirements: `<ul><li>Nữ 18 – 30 tuổi, cao từ 1m50, thị lực tốt.</li><li>Khéo tay, cẩn thận, chịu được công việc lặp lại.</li><li>Tốt nghiệp THCS trở lên.</li></ul>`, image: "/images/dien-tu-nha-may.jpg", isFeatured: true, status: "OPEN" },
    { slug: "tuyen-15-che-bien-thuc-pham-hokkaido", title: "Tuyển 15 nam/nữ chế biến thực phẩm – Hokkaido, Nhật Bản", marketId: market("nhat-ban"), industry: "Chế biến thực phẩm", quantity: 15, gender: "ANY", ageMin: 18, ageMax: 35, salaryText: "160.000 Yên/tháng (~27 triệu VNĐ)", salaryVnd: 27_000_000, cost: "Công khai khi tư vấn", location: "Hokkaido, Nhật Bản", deadline: daysAhead(40), interviewDate: daysAhead(45), departureNote: "Dự kiến xuất cảnh tháng 5/2027", description: `<p>Chế biến hải sản, đóng gói sản phẩm đông lạnh trong nhà máy hiện đại tại Hokkaido. Công việc phù hợp cả nam và nữ, không yêu cầu kinh nghiệm.</p>`, requirements: `<ul><li>Nam/nữ 18 – 35 tuổi, sức khỏe tốt, không dị ứng hải sản.</li><li>Không xăm hình, chịu được môi trường lạnh.</li></ul>`, image: "/images/nhat-ban-den-long.jpg", isFeatured: false, status: "OPEN" },
    { slug: "tuyen-25-nam-xay-dung-cot-thep-tokyo", title: "Tuyển 25 nam xây dựng cốt thép – Tokyo, Nhật Bản", marketId: market("nhat-ban"), industry: "Xây dựng", quantity: 25, gender: "MALE", ageMin: 20, ageMax: 35, salaryText: "195.000 Yên/tháng (~33 triệu VNĐ)", salaryVnd: 33_000_000, cost: "Công khai khi tư vấn", location: "Tokyo, Nhật Bản", deadline: daysAhead(12), interviewDate: daysAhead(15), departureNote: "Xuất cảnh nhanh sau 4 tháng", description: `<p>Thi công cốt thép, giàn giáo cho các công trình nhà cao tầng tại Tokyo. Lương cao, tăng ca nhiều, phù hợp nam giới có sức khỏe tốt.</p>`, requirements: `<ul><li>Nam 20 – 35 tuổi, cao từ 1m65, nặng từ 55kg.</li><li>Không sợ độ cao, sức khỏe tốt.</li><li>Ưu tiên đã làm xây dựng tại Việt Nam.</li></ul>`, image: "/images/xay-dung-cong-nhan.jpg", isFeatured: false, status: "OPEN" },
    { slug: "dieu-duong-ky-nang-dac-dinh-fukuoka", title: "Điều dưỡng Kỹ năng đặc định – Fukuoka, Nhật Bản", marketId: market("nhat-ban"), industry: "Điều dưỡng – hộ lý", quantity: 10, gender: "ANY", ageMin: 20, ageMax: 35, salaryText: "200.000 Yên/tháng (~34 triệu VNĐ) + phụ cấp ca đêm", salaryVnd: 34_000_000, cost: "Miễn phí đào tạo tiếng Nhật chuyên ngành", location: "Fukuoka, Nhật Bản", deadline: daysAhead(50), interviewDate: daysAhead(55), departureNote: "Yêu cầu N4 và chứng chỉ kỹ năng điều dưỡng", description: `<p>Chăm sóc người cao tuổi tại viện dưỡng lão hiện đại ở Fukuoka theo visa Kỹ năng đặc định số 1 (có thể lên số 2 và bảo lãnh gia đình). Công việc ổn định, được đào tạo bài bản, lương tăng theo thâm niên.</p>`, requirements: `<ul><li>Nam/nữ 20 – 35 tuổi, tốt nghiệp THPT trở lên.</li><li>Có N4 hoặc cam kết học đạt N4 trước xuất cảnh.</li><li>Ưu tiên tốt nghiệp trung cấp/cao đẳng điều dưỡng.</li></ul>`, image: "/images/dieu-duong.jpg", isFeatured: true, status: "OPEN" },
    { slug: "eps-han-quoc-40-nam-san-xuat-gyeonggi", title: "EPS Hàn Quốc: 40 nam sản xuất chế tạo – Gyeonggi", marketId: market("han-quoc"), industry: "Sản xuất chế tạo", quantity: 40, gender: "MALE", ageMin: 18, ageMax: 39, salaryText: "2.060.000 Won/tháng (~38 triệu VNĐ) + tăng ca", salaryVnd: 38_000_000, cost: "Chi phí thấp theo chương trình EPS", location: "Gyeonggi-do, Hàn Quốc", deadline: daysAhead(35), interviewDate: null, departureNote: "Cần đạt kỳ thi EPS-TOPIK ngành sản xuất", description: `<p>Làm việc tại các nhà máy sản xuất linh kiện, nhựa, kim loại ở tỉnh Gyeonggi (giáp Seoul). Lương cơ bản theo luật Hàn Quốc, tăng ca nhiều, ký túc xá miễn phí.</p>`, requirements: `<ul><li>Nam 18 – 39 tuổi, không có tiền án tiền sự.</li><li>Đăng ký thi tiếng Hàn EPS-TOPIK ngành sản xuất chế tạo.</li><li>Không có người thân cư trú bất hợp pháp tại Hàn Quốc.</li></ul>`, image: "/images/han-quoc-seoul.jpg", isFeatured: true, status: "OPEN" },
    { slug: "eps-han-quoc-20-nu-nong-nghiep-jeolla", title: "EPS Hàn Quốc: 20 nữ nông nghiệp – Jeolla", marketId: market("han-quoc"), industry: "Nông nghiệp – chăn nuôi", quantity: 20, gender: "FEMALE", ageMin: 18, ageMax: 39, salaryText: "1.950.000 Won/tháng (~36 triệu VNĐ)", salaryVnd: 36_000_000, cost: "Chi phí thấp theo chương trình EPS", location: "Jeollanam-do, Hàn Quốc", deadline: daysAhead(60), interviewDate: null, departureNote: "Dự kiến xuất cảnh quý III/2027", description: `<p>Trồng trọt, thu hoạch rau củ trong nhà kính và trang trại tại Jeolla. Công việc phù hợp nữ giới, chủ trang trại hỗ trợ chỗ ở.</p>`, requirements: `<ul><li>Nữ 18 – 39 tuổi, sức khỏe tốt.</li><li>Đạt kỳ thi EPS-TOPIK ngành nông nghiệp.</li></ul>`, image: "/images/nong-nghiep.jpg", isFeatured: false, status: "OPEN" },
    { slug: "tuyen-50-dien-tu-dao-vien-dai-loan", title: "Tuyển 50 nam/nữ điện tử – Đào Viên, Đài Loan", marketId: market("dai-loan"), industry: "Điện tử", quantity: 50, gender: "ANY", ageMin: 18, ageMax: 40, salaryText: "28.590 Đài tệ/tháng (~23 triệu VNĐ) + tăng ca", salaryVnd: 23_000_000, cost: "Công khai khi tư vấn, hỗ trợ trả góp", location: "Đào Viên, Đài Loan", deadline: daysAhead(20), interviewDate: daysAhead(24), departureNote: "Xuất cảnh sau 2 – 3 tháng", description: `<p>Lắp ráp bảng mạch, kiểm tra sản phẩm điện tử tại nhà máy lớn ở Đào Viên. Tăng ca 60 – 80 giờ/tháng, ký túc xá trong khuôn viên nhà máy.</p>`, requirements: `<ul><li>Nam/nữ 18 – 40 tuổi, thị lực tốt.</li><li>Tốt nghiệp THCS trở lên, không xăm hình lớn.</li></ul>`, image: "/images/dai-loan-taipei.jpg", isFeatured: true, status: "OPEN" },
    { slug: "tuyen-20-nam-co-khi-dai-trung", title: "Tuyển 20 nam cơ khí – Đài Trung, Đài Loan", marketId: market("dai-loan"), industry: "Cơ khí", quantity: 20, gender: "MALE", ageMin: 20, ageMax: 38, salaryText: "30.000 Đài tệ/tháng (~25 triệu VNĐ) + tăng ca", salaryVnd: 25_000_000, cost: "Công khai khi tư vấn", location: "Đài Trung, Đài Loan", deadline: daysAhead(28), interviewDate: daysAhead(32), departureNote: "Xuất cảnh sau 3 tháng", description: `<p>Vận hành máy tiện, máy dập, hàn chi tiết kim loại tại xưởng cơ khí ở Đài Trung. Ưu tiên lao động có tay nghề.</p>`, requirements: `<ul><li>Nam 20 – 38 tuổi, sức khỏe tốt.</li><li>Có kinh nghiệm cơ khí là lợi thế.</li></ul>`, image: "/images/co-khi-han.jpg", isFeatured: false, status: "OPEN" },
    { slug: "dieu-duong-duc-hoc-nghe-co-luong-bayern", title: "Điều dưỡng Đức – Học nghề có lương tại Bayern", marketId: market("duc"), industry: "Điều dưỡng", quantity: 15, gender: "ANY", ageMin: 18, ageMax: 32, salaryText: "1.300 EUR/tháng khi học nghề; 3.000+ EUR/tháng sau tốt nghiệp", salaryVnd: 36_000_000, cost: "Học phí tiếng Đức và phí hồ sơ, có chính sách học bổng", location: "Bayern, CHLB Đức", deadline: daysAhead(90), interviewDate: daysAhead(70), departureNote: "Khai giảng lớp tiếng Đức hằng tháng", description: `<p>Học nghề điều dưỡng 3 năm tại các viện dưỡng lão và bệnh viện ở bang Bayern – bang giàu nhất nước Đức. Sau tốt nghiệp được cấp bằng điều dưỡng Đức, ký hợp đồng vô thời hạn và có thể xin định cư.</p>`, requirements: `<ul><li>Nam/nữ 18 – 32 tuổi, tốt nghiệp THPT.</li><li>Đạt tiếng Đức B1 trước xuất cảnh (hỗ trợ đào tạo).</li><li>Yêu nghề, kiên nhẫn, có trách nhiệm.</li></ul>`, image: "/images/duc-berlin.jpg", isFeatured: true, status: "OPEN" },
    { slug: "tuyen-30-nam-xay-dung-warsaw-ba-lan", title: "Tuyển 30 nam xây dựng – Warsaw, Ba Lan", marketId: market("chau-au"), industry: "Xây dựng", quantity: 30, gender: "MALE", ageMin: 20, ageMax: 45, salaryText: "5.500 PLN/tháng (~34 triệu VNĐ)", salaryVnd: 34_000_000, cost: "Công khai khi tư vấn", location: "Warsaw, Ba Lan", deadline: daysAhead(45), interviewDate: daysAhead(48), departureNote: "Xuất cảnh sau 4 – 5 tháng (chờ visa)", description: `<p>Thi công xây dựng dân dụng, lắp đặt cốp pha, hoàn thiện công trình tại Warsaw. Không yêu cầu ngoại ngữ, chủ bố trí chỗ ở.</p>`, requirements: `<ul><li>Nam 20 – 45 tuổi, sức khỏe tốt.</li><li>Ưu tiên có kinh nghiệm xây dựng.</li></ul>`, image: "/images/xay-dung-cong-truong.jpg", isFeatured: false, status: "OPEN" },
    { slug: "nong-nghiep-uc-palm-20-lao-dong-queensland", title: "Nông nghiệp Úc (PALM): 20 lao động thu hoạch trái cây – Queensland", marketId: market("uc"), industry: "Nông nghiệp – thu hoạch", quantity: 20, gender: "ANY", ageMin: 21, ageMax: 45, salaryText: "25 AUD/giờ (~60 triệu VNĐ/tháng)", salaryVnd: 60_000_000, cost: "Theo chương trình, hỗ trợ vé máy bay", location: "Queensland, Úc", deadline: daysAhead(75), interviewDate: daysAhead(80), departureNote: "Yêu cầu tiếng Anh giao tiếp cơ bản", description: `<p>Thu hoạch, đóng gói trái cây tại các trang trại lớn ở Queensland theo chương trình lao động PALM của Chính phủ Úc. Lương theo giờ, được bảo vệ đầy đủ theo luật lao động Úc.</p>`, requirements: `<ul><li>Nam/nữ 21 – 45 tuổi, sức khỏe tốt, chịu được nắng nóng.</li><li>Tiếng Anh giao tiếp cơ bản.</li></ul>`, image: "/images/nong-nghiep.jpg", isFeatured: false, status: "OPEN" },
    { slug: "tuyen-10-nu-det-may-dai-loan-da-dong", title: "Tuyển 10 nữ dệt may – Chương Hóa, Đài Loan", marketId: market("dai-loan"), industry: "Dệt may", quantity: 10, gender: "FEMALE", ageMin: 18, ageMax: 38, salaryText: "28.590 Đài tệ/tháng (~23 triệu VNĐ)", salaryVnd: 23_000_000, cost: "Công khai khi tư vấn", location: "Chương Hóa, Đài Loan", deadline: daysAgo(10), interviewDate: daysAgo(5), departureNote: "Đơn hàng đã đủ người", description: `<p>May công nghiệp, hoàn thiện sản phẩm dệt may xuất khẩu. Đơn hàng đã kết thúc tuyển dụng.</p>`, requirements: `<ul><li>Nữ 18 – 38 tuổi, biết may công nghiệp.</li></ul>`, image: "/images/dien-tu-nha-may.jpg", isFeatured: false, status: "CLOSED" },
  ];
  insert("JobOrder", jobs.map((j) => ({ id: job(String(j.slug)), ...j, programId: jobProgram(PROGRAM_OF_JOB[String(j.slug)]), benefits, viewCount: 0, ...stamps() })));
  // Đơn hàng đã có từ trước (INSERT OR IGNORE bỏ qua) → gán chương trình nếu còn trống
  for (const j of jobs) {
    statements.push(`UPDATE "JobOrder" SET "programId" = ${lit(jobProgram(PROGRAM_OF_JOB[String(j.slug)]))} WHERE "id" = ${lit(job(String(j.slug)))} AND "programId" IS NULL;`);
  }

  // ---------- BÀI VIẾT ----------
  const post = (slug: string) => sid(`post:${slug}`);
  const posts: Array<Record<string, Value | readonly string[]> & { slug: string; tags: readonly string[]; publishedAt: Date | null }> = [
    { slug: "chi-phi-di-xuat-khau-lao-dong-nhat-ban-2026", title: "Chi phí đi xuất khẩu lao động Nhật Bản 2026: Cập nhật mới nhất", categoryId: cat("kinh-nghiem"), tags: ["nhat-ban", "chi-phi"], coverImage: "/images/nhat-ban-kyoto.jpg", isFeatured: true, publishedAt: daysAgo(3), authorId: adminId, status: "PUBLISHED",
      excerpt: "Tổng hợp các khoản chi phí khi đi Nhật theo diện thực tập sinh và kỹ năng đặc định, mức trần theo quy định và những khoản người lao động không phải trả.",
      metaTitle: "Chi phí đi xuất khẩu lao động Nhật Bản 2026 mới nhất", metaDescription: "Chi tiết các khoản chi phí đi Nhật 2026: phí dịch vụ, đào tạo, khám sức khỏe, vé máy bay và những khoản bị cấm thu theo quy định.",
      content: `<p>Chi phí luôn là câu hỏi đầu tiên của người lao động khi tìm hiểu về xuất khẩu lao động Nhật Bản. Bài viết này tổng hợp <strong>các khoản chi phí theo quy định mới nhất</strong> để bạn chủ động chuẩn bị tài chính và tránh bị thu phí sai quy định.</p><h2>1. Các khoản chi phí chính</h2><table><thead><tr><th>Khoản mục</th><th>Mức tham khảo</th><th>Ghi chú</th></tr></thead><tbody><tr><td>Phí dịch vụ</td><td>Tối đa 1 tháng lương/năm hợp đồng</td><td>Không quá 3 tháng lương cho hợp đồng 3 năm</td></tr><tr><td>Đào tạo tiếng Nhật & kỹ năng</td><td>5 – 10 triệu VNĐ</td><td>Tùy thời lượng khóa học</td></tr><tr><td>Khám sức khỏe</td><td>700.000 – 1.500.000 VNĐ</td><td>Tại bệnh viện được chỉ định</td></tr><tr><td>Hộ chiếu, lý lịch tư pháp</td><td>~500.000 VNĐ</td><td>Người lao động tự làm</td></tr><tr><td>Ký túc xá, ăn ở khi học</td><td>Theo thực tế</td><td>Nhiều công ty hỗ trợ</td></tr></tbody></table><h2>2. Những khoản người lao động KHÔNG phải trả</h2><ul><li>Tiền môi giới cho nghiệp đoàn Nhật Bản.</li><li>Tiền "đặt cọc chống trốn" dưới mọi hình thức.</li><li>Các khoản phí ngoài hợp đồng không có hóa đơn, chứng từ.</li></ul><h2>3. Lời khuyên</h2><p>Hãy yêu cầu công ty cung cấp <strong>bảng kê chi phí chi tiết</strong> và chỉ nộp tiền khi có phiếu thu. Nếu không trúng tuyển, bạn được hoàn lại các khoản đã nộp theo quy định. Liên hệ hotline để được tư vấn chi phí cụ thể cho từng đơn hàng.</p>` },
    { slug: "kinh-nghiem-phong-van-don-hang-nhat-ban", title: "Kinh nghiệm phỏng vấn đơn hàng Nhật Bản: 10 câu hỏi thường gặp", categoryId: cat("kinh-nghiem"), tags: ["nhat-ban", "thu-tuc"], coverImage: "/images/hop-doi-ngu.jpg", isFeatured: false, publishedAt: daysAgo(7), authorId: editorId, status: "PUBLISHED",
      excerpt: "Nghiệp đoàn Nhật thường hỏi gì khi phỏng vấn? Cách trả lời ghi điểm và những lỗi khiến ứng viên bị loại ngay từ vòng đầu.", metaTitle: null, metaDescription: null,
      content: `<p>Vòng phỏng vấn với nghiệp đoàn và công ty tiếp nhận là bước quyết định bạn có được sang Nhật hay không. Dưới đây là <strong>10 câu hỏi phổ biến nhất</strong> và gợi ý cách trả lời.</p><h2>Các câu hỏi thường gặp</h2><ol><li><strong>Hãy giới thiệu về bản thân.</strong> – Nói ngắn gọn tên, tuổi, quê quán, gia đình và lý do muốn sang Nhật (bằng tiếng Nhật nếu có thể).</li><li><strong>Vì sao bạn muốn đi Nhật?</strong> – Nhấn mạnh mong muốn học kỹ năng, kỷ luật và tích lũy vốn cho tương lai.</li><li><strong>Bạn có kinh nghiệm gì liên quan đến công việc?</strong></li><li><strong>Bạn có chịu được công việc nặng, tăng ca không?</strong></li><li><strong>Nếu bị đồng nghiệp người Nhật nhắc nhở, bạn sẽ làm gì?</strong></li><li><strong>Bạn dự định làm gì sau khi về nước?</strong></li><li><strong>Gia đình có ủng hộ bạn không?</strong></li><li><strong>Bạn có từng xin việc ở công ty khác không?</strong></li><li><strong>Điểm mạnh và điểm yếu của bạn?</strong></li><li><strong>Bạn có câu hỏi gì cho chúng tôi không?</strong></li></ol><h2>Những lỗi cần tránh</h2><ul><li>Đến muộn, trang phục không gọn gàng.</li><li>Trả lời quá dài, lan man hoặc nói dối về kinh nghiệm.</li><li>Không chào hỏi, không cúi đầu theo phong cách Nhật.</li></ul><blockquote>Hãy tham gia các buổi phỏng vấn thử tại trung tâm để làm quen với không khí thật và được giáo viên sửa lỗi trực tiếp.</blockquote>` },
    { slug: "visa-ky-nang-dac-dinh-tokutei-ginou-la-gi", title: "Visa Kỹ năng đặc định (Tokutei Ginou) là gì? Điều kiện và lộ trình", categoryId: cat("chinh-sach"), tags: ["nhat-ban", "visa", "ky-nang-dac-dinh"], coverImage: "/images/nhat-ban-shibuya.jpg", isFeatured: true, publishedAt: daysAgo(12), authorId: adminId, status: "PUBLISHED",
      excerpt: "Kỹ năng đặc định cho phép làm việc tới 5 năm, lương ngang người Nhật và có thể bảo lãnh gia đình ở loại 2. Ai đủ điều kiện và cần chuẩn bị gì?", metaTitle: null, metaDescription: null,
      content: `<p><strong>Kỹ năng đặc định (特定技能 – Tokutei Ginou)</strong> là loại visa lao động do Nhật Bản ban hành nhằm tiếp nhận lao động nước ngoài có tay nghề trong các ngành thiếu nhân lực.</p><h2>Hai loại visa Kỹ năng đặc định</h2><ul><li><strong>Loại 1:</strong> tối đa 5 năm, 16 ngành nghề, không bảo lãnh gia đình.</li><li><strong>Loại 2:</strong> không giới hạn thời gian, được bảo lãnh vợ/chồng và con, là bước đệm để xin vĩnh trú.</li></ul><h2>Điều kiện</h2><ol><li>Từ 18 tuổi trở lên.</li><li>Đạt kỳ thi kỹ năng ngành nghề và kỳ thi tiếng Nhật (JLPT N4 hoặc JFT-Basic A2).</li><li>Thực tập sinh đã hoàn thành 3 năm được miễn thi.</li></ol><h2>Các ngành phổ biến</h2><p>Điều dưỡng, xây dựng, chế biến thực phẩm, nhà hàng, nông nghiệp, sản xuất chế tạo, vệ sinh tòa nhà, ô tô, hàng không, lưu trú, ngư nghiệp, đóng tàu.</p><h2>Lộ trình với NIJI</h2><p>Chúng tôi tổ chức lớp ôn thi kỹ năng và tiếng Nhật, kết nối trực tiếp với doanh nghiệp tiếp nhận để người lao động ký hợp đồng với mức lương tương đương người Nhật cùng vị trí.</p>` },
    { slug: "le-xuat-canh-thang-9-2026-45-thuc-tap-sinh-sang-nhat", title: "Lễ xuất cảnh tháng 9/2026: 45 thực tập sinh lên đường sang Nhật Bản", categoryId: cat("hoat-dong-cong-ty"), tags: ["nhat-ban"], coverImage: "/images/hero-xuat-canh.jpg", isFeatured: false, publishedAt: daysAgo(20), authorId: editorId, status: "PUBLISHED",
      excerpt: "Sáng 25/9, 45 thực tập sinh ngành cơ khí, điện tử và chế biến thực phẩm đã xuất cảnh sang các tỉnh Aichi, Osaka và Hokkaido.", metaTitle: null, metaDescription: null,
      content: `<p>Sáng ngày 25/9/2026, tại sân bay quốc tế Nội Bài, công ty đã tổ chức lễ tiễn 45 thực tập sinh lên đường sang Nhật Bản làm việc theo các đơn hàng cơ khí, điện tử và chế biến thực phẩm.</p><h2>Hành trang trước giờ bay</h2><p>Trước khi xuất cảnh, các bạn đã hoàn thành khóa đào tạo tiếng Nhật 6 tháng, đạt trình độ N4 và được rèn luyện kỹ năng sống, văn hóa làm việc tại Nhật. Đại diện công ty gửi lời chúc các bạn chân cứng đá mềm, giữ gìn sức khỏe và luôn nhớ rằng công ty đồng hành suốt thời gian làm việc.</p><h2>Hỗ trợ sau xuất cảnh</h2><ul><li>Cán bộ đại diện tại Nhật đón tại sân bay và hướng dẫn nhập trại.</li><li>Đường dây nóng hỗ trợ 24/7 bằng tiếng Việt.</li><li>Thăm hỏi định kỳ tại nơi làm việc.</li></ul>` },
    { slug: "chuong-trinh-eps-han-quoc-2026-lich-thi-va-nganh-tuyen", title: "Chương trình EPS Hàn Quốc 2026: Lịch thi tiếng Hàn và ngành tuyển", categoryId: cat("tin-tuc-xkld"), tags: ["han-quoc", "eps"], coverImage: "/images/han-quoc-seoul.jpg", isFeatured: true, publishedAt: daysAgo(15), authorId: adminId, status: "PUBLISHED",
      excerpt: "Thông tin các đợt thi EPS-TOPIK năm 2026 cho ngành sản xuất chế tạo, nông nghiệp, ngư nghiệp và xây dựng cùng chỉ tiêu dự kiến.", metaTitle: null, metaDescription: null,
      content: `<p>Năm 2026, chương trình EPS tiếp tục tuyển lao động Việt Nam trong 5 ngành: sản xuất chế tạo, nông nghiệp, ngư nghiệp, xây dựng và đóng tàu. Người lao động cần đăng ký và vượt qua kỳ thi tiếng Hàn EPS-TOPIK do cơ quan chức năng hai nước tổ chức.</p><h2>Điều kiện đăng ký thi</h2><ul><li>Từ 18 – 39 tuổi, không có tiền án tiền sự.</li><li>Không thuộc diện cấm xuất cảnh; không có người thân đang cư trú bất hợp pháp tại Hàn Quốc.</li><li>Chưa từng bị trục xuất khỏi Hàn Quốc.</li></ul><h2>Cấu trúc kỳ thi</h2><p>Kỳ thi gồm hai vòng: <strong>thi tiếng Hàn trên máy tính</strong> (nghe – đọc) và <strong>kiểm tra tay nghề, thể lực</strong>. Thí sinh đạt cả hai vòng được đưa vào danh sách giới thiệu cho chủ sử dụng lao động Hàn Quốc lựa chọn.</p><h2>Lớp ôn thi tại NIJI</h2><p>Trung tâm mở lớp tiếng Hàn EPS-TOPIK 4 tháng với giáo viên từng làm việc tại Hàn Quốc, cam kết hỗ trợ đến khi đạt. Liên hệ hotline để nhận lịch khai giảng.</p>` },
    { slug: "dieu-duong-duc-lo-trinh-du-hoc-nghe-co-luong", title: "Điều dưỡng Đức: Lộ trình du học nghề có lương và cơ hội định cư", categoryId: cat("tin-tuc-xkld"), tags: ["duc", "dieu-duong"], coverImage: "/images/dieu-duong.jpg", isFeatured: false, publishedAt: daysAgo(25), authorId: editorId, status: "PUBLISHED",
      excerpt: "Vừa học vừa làm với lương 1.200 – 1.400 EUR/tháng, sau 3 năm nhận bằng điều dưỡng được công nhận toàn châu Âu.", metaTitle: null, metaDescription: null,
      content: `<p>Đức đang thiếu hàng trăm nghìn điều dưỡng viên và mở rộng cửa cho ứng viên Việt Nam thông qua chương trình du học nghề (Ausbildung). Đây là con đường hợp pháp, chi phí thấp để sang Đức làm việc và định cư lâu dài.</p><h2>Lộ trình 4 bước</h2><ol><li><strong>Học tiếng Đức tại Việt Nam</strong> đến trình độ B1 (8 – 12 tháng).</li><li><strong>Phỏng vấn</strong> với cơ sở tiếp nhận tại Đức và ký hợp đồng học nghề.</li><li><strong>Xin visa</strong> và sang Đức học B2 + học nghề 3 năm, lương học nghề 1.200 – 1.400 EUR/tháng.</li><li><strong>Tốt nghiệp</strong>, làm việc chính thức với mức lương 2.300 – 3.500 EUR/tháng, sau 2 – 4 năm có thể xin định cư.</li></ol><h2>Ai phù hợp?</h2><ul><li>Từ 18 – 32 tuổi, tốt nghiệp THPT.</li><li>Yêu thích công việc chăm sóc, kiên nhẫn, chịu khó học ngoại ngữ.</li></ul>` },
    { slug: "dai-loan-tang-luong-co-ban-tu-1-1-2026", title: "Đài Loan tăng lương cơ bản từ 1/1/2026: Người lao động được lợi gì?", categoryId: cat("tin-tuc-xkld"), tags: ["dai-loan"], coverImage: "/images/dai-loan-taipei.jpg", isFeatured: false, publishedAt: daysAgo(30), authorId: adminId, status: "PUBLISHED",
      excerpt: "Lương cơ bản tại Đài Loan tiếp tục được điều chỉnh tăng, kéo theo thu nhập tăng ca và các khoản bảo hiểm của lao động nước ngoài cùng tăng.", metaTitle: null, metaDescription: null,
      content: `<p>Từ ngày 1/1/2026, mức lương cơ bản tại Đài Loan được điều chỉnh tăng theo lộ trình hằng năm của chính quyền. Toàn bộ lao động nước ngoài, trong đó có lao động Việt Nam, được áp dụng mức mới.</p><h2>Tác động đến thu nhập</h2><ul><li>Lương cơ bản tăng kéo theo đơn giá tăng ca (1,33 – 1,66 lần) tăng tương ứng.</li><li>Mức đóng và quyền lợi bảo hiểm lao động, bảo hiểm y tế được tính trên lương mới.</li><li>Thu nhập thực nhận của lao động nhà máy phổ biến ở mức 22 – 30 triệu VNĐ/tháng.</li></ul><h2>Lưu ý cho người lao động</h2><p>Hãy kiểm tra phiếu lương hằng tháng, đối chiếu với mức lương cơ bản mới. Nếu phát hiện chủ sử dụng không áp dụng, liên hệ ngay cán bộ quản lý của công ty để được hỗ trợ.</p>` },
    { slug: "khai-giang-lop-tieng-nhat-k45", title: "Khai giảng lớp tiếng Nhật K45 – 60 học viên bắt đầu hành trình mới", categoryId: cat("hoat-dong-cong-ty"), tags: ["nhat-ban"], coverImage: "/images/lop-hoc-laptop.jpg", isFeatured: false, publishedAt: daysAgo(40), authorId: editorId, status: "PUBLISHED",
      excerpt: "Lớp K45 quy tụ 60 học viên đến từ 18 tỉnh thành, bắt đầu khóa đào tạo tiếng Nhật và kỹ năng 6 tháng trước khi thi tuyển đơn hàng.", metaTitle: null, metaDescription: null,
      content: `<p>Sáng thứ Hai đầu tuần, trung tâm đào tạo đã tổ chức lễ khai giảng lớp tiếng Nhật K45 với 60 học viên. Các bạn sẽ học tiếng Nhật từ bảng chữ cái đến trình độ N4, kết hợp rèn luyện thể lực, kỷ luật và văn hóa doanh nghiệp Nhật Bản.</p><h2>Chương trình đào tạo</h2><ul><li>Tiếng Nhật 6 tiếng/ngày với giáo viên Việt Nam và giáo viên bản ngữ.</li><li>Kỹ năng an toàn lao động, 5S, Horenso.</li><li>Phỏng vấn thử hằng tuần.</li></ul><p>Chúc các bạn học tập tốt và sớm trúng tuyển đơn hàng mơ ước!</p>` },
    { slug: "lich-phong-van-don-hang-thang-toi", title: "Lịch phỏng vấn đơn hàng tháng tới: 6 đơn Nhật Bản, 2 đơn Đài Loan", categoryId: cat("tin-tuc-xkld"), tags: ["nhat-ban", "dai-loan"], coverImage: "/images/tu-van-vien.jpg", isFeatured: false, publishedAt: daysAhead(3), authorId: adminId, status: "SCHEDULED",
      excerpt: "Cập nhật lịch thi tuyển các đơn hàng cơ khí, điện tử, xây dựng và chế biến thực phẩm trong tháng tới.", metaTitle: null, metaDescription: null,
      content: `<p>Bài viết này được hẹn giờ đăng tự động. Nội dung lịch phỏng vấn sẽ hiển thị khi đến thời điểm xuất bản.</p>` },
    { slug: "huong-dan-chuan-bi-ho-so-xuat-khau-lao-dong", title: "Hướng dẫn chuẩn bị hồ sơ xuất khẩu lao động (bản nháp)", categoryId: cat("kinh-nghiem"), tags: ["thu-tuc"], coverImage: null, isFeatured: false, publishedAt: null, authorId: editorId, status: "DRAFT",
      excerpt: "Danh sách giấy tờ cần chuẩn bị khi đăng ký đi làm việc ở nước ngoài.", metaTitle: null, metaDescription: null,
      content: `<p>Bản nháp – đang biên tập.</p>` },
  ];
  insert(
    "Post",
    posts.map((p) => {
      const row: Row = { id: post(p.slug), ...(p as unknown as Row), ogImage: null, viewCount: 0, ...stamps(p.publishedAt ?? now) };
      delete row.tags; // quan hệ nhiều-nhiều được chèn riêng vào bảng _PostToTag
      return row;
    })
  );
  insert("_PostToTag", posts.flatMap((p) => p.tags.map((t) => ({ A: post(p.slug), B: tag(t) }))));

  // ---------- CẢM NHẬN, FAQ, ĐỐI TÁC, BANNER ----------
  insert("Testimonial", [
    { name: "Nguyễn Văn Hùng", position: "Thực tập sinh cơ khí – Osaka, Nhật Bản", content: "Mình được công ty đào tạo tiếng Nhật rất kỹ nên sang bên này hòa nhập nhanh. Lương tháng đầu đã gửi về cho bố mẹ được 25 triệu. Cảm ơn các thầy cô và anh chị tư vấn đã hỗ trợ tận tình.", rating: 5, order: 1 },
    { name: "Trần Thị Mai", position: "Lao động điện tử – Đào Viên, Đài Loan", content: "Thủ tục nhanh gọn, chi phí đúng như tư vấn ban đầu, không phát sinh. Sau 2 tháng học mình đã xuất cảnh. Công ty còn có cán bộ bên Đài Loan hỗ trợ khi mình gặp khó khăn.", rating: 5, order: 2 },
    { name: "Lê Minh Tuấn", position: "Lao động EPS – Gyeonggi, Hàn Quốc", content: "Mình thi EPS lần đầu không đỗ, được trung tâm ôn luyện lại miễn phí và đỗ ngay lần hai. Giờ thu nhập mỗi tháng hơn 40 triệu, cuộc sống gia đình ổn định hơn nhiều.", rating: 5, order: 3 },
    { name: "Phạm Thu Hà", position: "Học viên điều dưỡng – Bayern, Đức", content: "Học tiếng Đức khá vất vả nhưng giáo viên rất nhiệt tình. Sang Đức mình vừa học vừa làm, được trả lương 1.300 EUR mỗi tháng và sắp tốt nghiệp để làm điều dưỡng chính thức.", rating: 5, order: 4 },
    { name: "Hoàng Văn Nam", position: "Thực tập sinh xây dựng – Tokyo, Nhật Bản", content: "Công việc tuy vất vả nhưng thu nhập tốt, tăng ca nhiều. Công ty thường xuyên gọi điện hỏi thăm, có vấn đề gì là được giải quyết ngay nên gia đình rất yên tâm.", rating: 4, order: 5 },
    { name: "Vũ Thị Lan", position: "Kỹ năng đặc định điều dưỡng – Fukuoka, Nhật Bản", content: "Từ thực tập sinh mình được công ty hỗ trợ chuyển sang visa Kỹ năng đặc định, lương tăng gần gấp đôi và được ở lại Nhật thêm 5 năm. Rất biết ơn công ty.", rating: 5, order: 6 },
  ].map((t) => ({ id: sid(`testimonial:${t.order}`), ...t, avatar: null, isActive: true, ...stamps() })));

  insert("Faq", [
    { order: 1, question: "Điều kiện để đi xuất khẩu lao động là gì?", answer: "Thông thường người lao động cần từ 18 tuổi trở lên (tùy thị trường tối đa 35 – 45 tuổi), tốt nghiệp THCS trở lên, sức khỏe tốt theo quy định, không có tiền án tiền sự và chưa từng cư trú bất hợp pháp ở nước ngoài. Mỗi đơn hàng có thêm yêu cầu riêng về giới tính, chiều cao, kinh nghiệm." },
    { order: 2, question: "Chi phí đi xuất khẩu lao động bao nhiêu? Có được hỗ trợ vay vốn không?", answer: "Chi phí phụ thuộc thị trường và đơn hàng, được công khai chi tiết trước khi ký hợp đồng và tuân thủ mức trần theo quy định pháp luật. Công ty liên kết với các ngân hàng để hỗ trợ người lao động vay vốn ưu đãi, đồng thời có chính sách trả góp cho một số đơn hàng." },
    { order: 3, question: "Thời gian từ khi đăng ký đến khi xuất cảnh là bao lâu?", answer: "Đài Loan: 2 – 3 tháng. Nhật Bản: 4 – 6 tháng (gồm thời gian học tiếng). Hàn Quốc EPS: phụ thuộc lịch thi và việc chủ sử dụng lựa chọn, thường 6 – 12 tháng. Đức: 10 – 14 tháng do cần đạt tiếng Đức B1." },
    { order: 4, question: "Không biết ngoại ngữ có đi được không?", answer: "Có. Công ty có trung tâm đào tạo tiếng Nhật, Hàn, Đức, Trung từ đầu. Với Đài Loan và châu Âu, hầu hết đơn hàng không yêu cầu ngoại ngữ, chỉ học giao tiếp cơ bản trước khi xuất cảnh." },
    { order: 5, question: "Có hình xăm có đi được Nhật Bản không?", answer: "Phần lớn đơn hàng Nhật Bản không nhận lao động có hình xăm lớn hoặc ở vị trí dễ thấy. Một số đơn hàng chấp nhận hình xăm nhỏ đã xóa mờ. Thị trường Đài Loan, châu Âu linh hoạt hơn. Hãy liên hệ tư vấn viên để được kiểm tra cụ thể." },
    { order: 6, question: "Mức lương thực nhận hằng tháng là bao nhiêu?", answer: "Sau khi trừ thuế, bảo hiểm và tiền ký túc xá, lao động tại Nhật nhận khoảng 25 – 35 triệu VNĐ/tháng (chưa tăng ca), Hàn Quốc 35 – 50 triệu, Đài Loan 20 – 28 triệu, Đức sau tốt nghiệp 55 – 80 triệu. Thu nhập tăng thêm đáng kể nếu tăng ca." },
    { order: 7, question: "Nếu không trúng tuyển đơn hàng thì sao?", answer: "Người lao động được tiếp tục thi tuyển các đơn hàng khác phù hợp mà không mất thêm phí. Nếu không muốn tiếp tục, công ty hoàn trả các khoản đã nộp theo quy định trong hợp đồng và pháp luật." },
    { order: 8, question: "Hết hợp đồng có được gia hạn hoặc quay lại làm việc không?", answer: "Nhật Bản: thực tập sinh hoàn thành 3 năm có thể gia hạn 2 năm hoặc chuyển sang visa Kỹ năng đặc định tối đa 5 năm. Đài Loan: gia hạn tối đa 12 năm. Hàn Quốc: lao động mẫu mực có thể quay lại theo diện tái nhập cảnh. Đức: làm việc dài hạn và xin định cư." },
    { order: 9, question: "Công ty hỗ trợ gì sau khi người lao động xuất cảnh?", answer: "Công ty có cán bộ đại diện tại nước sở tại đón tại sân bay, hướng dẫn nhập trại, thăm hỏi định kỳ tại nơi làm việc và đường dây nóng tiếng Việt 24/7 để giải quyết các vấn đề về công việc, sinh hoạt, chế độ." },
    { order: 10, question: "Làm thế nào để đăng ký?", answer: "Bạn có thể điền form đăng ký tư vấn trên website, gọi hotline, nhắn Zalo hoặc đến trực tiếp văn phòng công ty. Tư vấn viên sẽ liên hệ trong vòng 24 giờ để kiểm tra điều kiện và giới thiệu đơn hàng phù hợp." },
  ].map((f) => ({ id: sid(`faq:${f.order}`), ...f, isActive: true, ...stamps() })));

  insert("Partner", [
    "Nghiệp đoàn Hokuto Kyodo Kumiai", "Sakura Seisakusho Co., Ltd.", "Taiyo Foods Group", "Hanwa Precision Industry",
    "Kyungsung Tech Co., Ltd.", "Taoyuan Electronics Corp.", "Pflege Partner GmbH", "Warsaw Build Sp. z o.o.",
  ].map((name, i) => ({ id: sid(`partner:${i + 1}`), name, logo: null, website: "https://example.com", order: i + 1, isActive: true, ...stamps() })));

  insert("Banner", [
    { order: 1, title: "Vững bước tương lai – Vươn tầm quốc tế", subtitle: "Hơn 8.500 lao động đã xuất cảnh sang Nhật Bản, Hàn Quốc, Đài Loan, Đức và châu Âu cùng NIJI. Chi phí minh bạch – Đào tạo bài bản – Hỗ trợ trọn gói.", image: "/images/hero-xuat-canh.jpg", ctaText: "Đăng ký tư vấn", ctaLink: "/dang-ky-tu-van", ctaText2: "Xem đơn hàng", ctaLink2: "/don-hang" },
    { order: 2, title: "Tuyển gấp 30 nam cơ khí – Osaka, Nhật Bản", subtitle: "Lương 180.000 Yên/tháng, phỏng vấn trong tháng này. Không yêu cầu kinh nghiệm, đào tạo tiếng Nhật miễn phí 1 tháng đầu.", image: "/images/co-khi-han.jpg", ctaText: "Ứng tuyển ngay", ctaLink: "/don-hang/tuyen-30-nam-co-khi-che-tao-osaka", ctaText2: "Xem đơn hàng khác", ctaLink2: "/don-hang" },
    { order: 3, title: "Điều dưỡng Đức – Học nghề có lương, định cư lâu dài", subtitle: "Lương học nghề 1.200 – 1.400 EUR/tháng, sau tốt nghiệp 2.300 – 3.500 EUR. Khai giảng lớp tiếng Đức hằng tháng.", image: "/images/dieu-duong.jpg", ctaText: "Tìm hiểu chương trình", ctaLink: "/thi-truong/duc", ctaText2: "Đăng ký tư vấn", ctaLink2: "/dang-ky-tu-van" },
  ].map((b) => ({ id: sid(`banner:${b.order}`), ...b, isActive: true, ...stamps() })));

  // ---------- DU HỌC – ĐÀO TẠO ----------
  insert("TrainingProgram", [
    { slug: "du-hoc-nghe-duc-dieu-duong", title: "Du học nghề Đức – Ngành Điều dưỡng", type: "STUDY_ABROAD", image: "/images/dieu-duong.jpg", duration: "3 năm học nghề (có lương)", tuition: "Học phí tiếng Đức tại Việt Nam; học nghề tại Đức miễn phí", order: 1, summary: "Học nghề điều dưỡng 3 năm tại Đức với lương 1.200 – 1.400 EUR/tháng, sau tốt nghiệp làm việc chính thức và có cơ hội định cư.", content: `<h2>Chương trình</h2><p>Học viên học tiếng Đức đến B1 tại Việt Nam, sau đó sang Đức học B2 và theo học nghề điều dưỡng 3 năm tại bệnh viện, viện dưỡng lão. Trong thời gian học được trả lương, có bảo hiểm và chỗ ở.</p><h2>Quyền lợi</h2><ul><li>Bằng nghề được công nhận toàn châu Âu.</li><li>Lương sau tốt nghiệp 2.300 – 3.500 EUR/tháng.</li><li>Cơ hội định cư và bảo lãnh người thân.</li></ul>` },
    { slug: "du-hoc-nghe-duc-nha-hang-khach-san", title: "Du học nghề Đức – Nhà hàng khách sạn", type: "STUDY_ABROAD", image: "/images/hoi-thao.jpg", duration: "3 năm học nghề (có lương)", tuition: "Học phí tiếng Đức tại Việt Nam", order: 2, summary: "Đào tạo nghề nhà hàng – khách sạn tại các chuỗi khách sạn 4–5 sao của Đức, lương học nghề từ 1.000 EUR/tháng.", content: `<h2>Chương trình</h2><p>Học nghề chuyên viên khách sạn, đầu bếp hoặc phục vụ nhà hàng tại Đức trong 3 năm. Được trả lương, hỗ trợ chỗ ở và ăn uống trong ca làm việc.</p>` },
    { slug: "khoa-tieng-nhat-n5-n4-cap-toc", title: "Khóa tiếng Nhật N5 – N4 cấp tốc (4 tháng)", type: "LANGUAGE", image: "/images/lop-hoc-laptop.jpg", duration: "4 tháng, học toàn thời gian", tuition: "Miễn phí cho học viên đăng ký đơn hàng Nhật Bản", order: 3, summary: "Khóa học dành cho học viên chuẩn bị thi tuyển đơn hàng Nhật Bản: tiếng Nhật, kỹ năng phỏng vấn, văn hóa doanh nghiệp.", content: `<h2>Nội dung</h2><ul><li>Tiếng Nhật từ bảng chữ cái đến N4: 6 tiếng/ngày.</li><li>Luyện phỏng vấn, giới thiệu bản thân, tác phong Nhật Bản.</li><li>Giáo viên bản ngữ, ký túc xá trong trung tâm.</li></ul>` },
    { slug: "khoa-tieng-han-eps-topik", title: "Khóa tiếng Hàn EPS-TOPIK", type: "LANGUAGE", image: "/images/dao-tao-may-tinh.jpg", duration: "4 tháng", tuition: "Liên hệ", order: 4, summary: "Ôn luyện thi tiếng Hàn EPS-TOPIK ngành sản xuất chế tạo, nông nghiệp, ngư nghiệp với giáo viên từng làm việc tại Hàn Quốc.", content: `<h2>Nội dung</h2><ul><li>Ngữ pháp, từ vựng theo giáo trình EPS chính thức.</li><li>Luyện nghe – đọc trên máy tính mô phỏng kỳ thi thật.</li><li>Cam kết hỗ trợ ôn lại miễn phí nếu chưa đạt.</li></ul>` },
    { slug: "dao-tao-ky-nang-nghe-co-khi-xay-dung", title: "Đào tạo kỹ năng nghề cơ khí – xây dựng", type: "VOCATIONAL", image: "/images/co-khi-han.jpg", duration: "1 – 2 tháng", tuition: "Miễn phí cho học viên đã trúng tuyển", order: 5, summary: "Thực hành hàn, tiện, đọc bản vẽ và an toàn lao động tại xưởng của trung tâm để sẵn sàng làm việc ngay khi sang nước ngoài.", content: `<h2>Nội dung</h2><ul><li>Thực hành hàn CO2, hàn TIG, vận hành máy tiện cơ bản.</li><li>Đọc bản vẽ kỹ thuật, 5S, an toàn lao động.</li><li>Thực hành giàn giáo, cốt thép cho ngành xây dựng.</li></ul>` },
  ].map((p) => ({ id: sid(`program:${p.slug}`), ...p, isActive: true, ...stamps() })));

  // ---------- ĐĂNG KÝ MẪU ----------
  insert("Lead", [
    { type: "CONSULTATION", fullName: "Nguyễn Văn An", phone: "0912345678", email: null, birthYear: 2001, hometown: "Nghệ An", marketId: market("nhat-ban"), jobOrderId: null, message: "Em muốn hỏi về đơn hàng cơ khí Nhật Bản, chi phí và thời gian xuất cảnh.", status: "NEW", adminNote: null, source: "/", createdAt: daysAgo(0.2) },
    { type: "APPLICATION", fullName: "Trần Văn Bình", phone: "0987654321", email: null, birthYear: 1998, hometown: "Thanh Hóa", marketId: market("nhat-ban"), jobOrderId: job("tuyen-30-nam-co-khi-che-tao-osaka"), message: "Em đã có 2 năm kinh nghiệm hàn, muốn ứng tuyển đơn Osaka.", status: "CONTACTED", adminNote: "Đã gọi, hẹn đến văn phòng khám sức khỏe thứ 5.", source: "/don-hang/tuyen-30-nam-co-khi-che-tao-osaka", createdAt: daysAgo(1) },
    { type: "CONSULTATION", fullName: "Lê Thị Hoa", phone: "0905123456", email: null, birthYear: 2003, hometown: "Hà Tĩnh", marketId: market("dai-loan"), jobOrderId: null, message: "Chị cho em hỏi đơn điện tử Đài Loan còn tuyển không ạ?", status: "NEW", adminNote: null, source: "/thi-truong/dai-loan", createdAt: daysAgo(2) },
    { type: "CONTACT", fullName: "Phạm Minh Đức", phone: "0933222111", email: "ducpm@example.com", birthYear: null, hometown: null, marketId: null, jobOrderId: null, message: "Tôi là đại diện trường nghề, muốn hợp tác tuyển sinh chương trình điều dưỡng Đức.", status: "CONTACTED", adminNote: null, source: "/lien-he", createdAt: daysAgo(4) },
    { type: "CONSULTATION", fullName: "Hoàng Thị Thu", phone: "0966778899", email: null, birthYear: 1995, hometown: "Bắc Giang", marketId: market("han-quoc"), jobOrderId: null, message: "Muốn đăng ký thi EPS đợt tới.", status: "PASSED", adminNote: "Đã đỗ EPS-TOPIK, chờ chủ chọn.", source: "/", createdAt: daysAgo(12) },
    { type: "CONSULTATION", fullName: "Đỗ Văn Long", phone: "0944556677", email: null, birthYear: 1990, hometown: "Nam Định", marketId: market("chau-au"), jobOrderId: null, message: "Hỏi đơn xây dựng Ba Lan.", status: "CANCELLED", adminNote: "Khách không nghe máy sau 3 lần gọi.", source: "/don-hang", createdAt: daysAgo(20) },
  ].map((l, i) => ({ id: sid(`lead:${i + 1}`), ...l, ipAddress: null, updatedAt: now })));

  const sql = `-- File sinh tự động bởi db/seed.ts (${now.toISOString()}). Không sửa tay.\n${statements.join("\n")}\n`;
  writeFileSync("db/seed.sql", sql, "utf8");
  console.log(`Đã sinh db/seed.sql (${statements.length} câu lệnh). Tài khoản admin: ${adminEmail} / ${adminPassword}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
