import type { Metadata } from "next";
import type { MaintenanceCard } from "@/lib/data";
import type { Locale } from "@/lib/locale";

type PageMeta = {
  title: string;
  description: string;
};

type MaintenanceTranslation = {
  title: string;
  interval: string;
  specs: Record<string, string>;
  steps: string[];
};

export const SITE_COPY = {
  en: {
    metadata: {
      root: {
        title: "BG5P Legacy GL — Service Reference",
        description:
          "Parts diagrams, maintenance guides, and service manuals for the 1994–1998 Subaru BG5P Legacy GL wagon — Vietnam market LHD.",
      },
      parts: {
        title: "Parts Catalog — BG5P Legacy GL",
        description:
          "262 exploded parts diagrams for the BG5P EJ20E SOHC NA, organized across 16 sections.",
      },
      maintenance: {
        title: "Maintenance Guides — BG5P Legacy GL",
        description:
          "Quick-reference specs, torque values, and step-by-step procedures for the EJ20E SOHC NA.",
      },
      manuals: {
        title: "Service Manuals — BG5P Legacy GL",
        description:
          "Factory service manual PDFs for the BG5P Legacy GL — EJ20E engine and BG chassis documentation.",
      },
      about: {
        title: "About — BG5P Legacy GL",
        description:
          "Vehicle information, chassis plate decoding, engine details, and history of the Vietnamese-market Subaru BG5P Legacy GL.",
      },
    },
    shell: {
      reference: "Reference",
      serviceReference: "Diagnostic Library",
      publicReferences: "Public references",
      askAi: "Ask BG5P AI",
      topbar: "Service reference",
      aiButton: "AI",
      openNavigation: "Open navigation",
      closeNavigation: "Close navigation",
      switchLanguage: "Switch to Vietnamese",
      chatPrompt: "Help me pick the right BG5P diagnostic path.",
      nav: {
        overview: "Overview",
        parts: "Parts Catalog",
        maintenance: "Maintenance",
        manuals: "Service Manuals",
        about: "Vehicle Profile",
      },
      navSecondary: {
        overview: "Main page",
        parts: "OEM diagrams",
        maintenance: "Specs and procedures",
        manuals: "Factory PDFs",
        about: "Vehicle info",
      },
      quickRefs: [
        {
          href: "/manuals",
          label: "EJ20E no-OBD PDFs",
          meta: "Flash codes, fuel, ignition",
        },
        {
          href: "/parts",
          label: "262 parts diagrams",
          meta: "OEM numbers and exploded views",
        },
        {
          href: "/llms.txt",
          label: "LLM sitemap",
          meta: "Deep links for assistants",
        },
      ],
    },
    home: {
      eyebrow: "BG5P · EJ20E · Vietnam LHD",
      title: "Legacy GL diagnostic reference.",
      description:
        "Factory manuals, exploded parts diagrams, maintenance procedures, and an AI assistant tuned for the pre-OBD EJ20E BG5P workflow.",
      open: "Open",
      specs: [
        { label: "Chassis", value: "BG5P" },
        { label: "Engine", value: "EJ20E 2.0L SOHC NA" },
        { label: "Drivetrain", value: "5MT full-time AWD" },
        { label: "Diagnostics", value: "SSM1 / no OBD-II" },
        { label: "Market", value: "Vietnam General Market LHD" },
      ],
      sections: [
        {
          title: "Parts Catalog",
          href: "/parts",
          value: "262",
          unit: "diagrams",
          description: "Exploded views, OEM part numbers, groups, and replacements.",
        },
        {
          title: "Maintenance",
          href: "/maintenance",
          value: "service",
          unit: "cards",
          description: "Specs, torque values, intervals, related diagrams, and PDFs.",
        },
        {
          title: "Manuals",
          href: "/manuals",
          value: "373",
          unit: "factory PDFs",
          description: "EJ20E engine, BG chassis, wiring, drivetrain, and body manuals.",
        },
      ],
      diagnosticTitle: "Diagnostic posture",
      diagnosticSubtitle: "Simple checks first. BG5P logic only.",
      diagnosticPaths: [
        "Read two-digit CEL flash codes",
        "Trace rough idle, no-start, and hot restart issues",
        "Find OEM parts before buying used replacements",
        "Open wiring, engine, and chassis PDFs directly",
      ],
      linksTitle: "Public deep links",
      linksSubtitle: "The assistant returns links owners can actually open.",
      linkLabels: {
        sitemap: "LLM sitemap",
        manuals: "Manual index",
        parts: "Diagram index",
      },
    },
    parts: {
      crumb: "Parts",
      eyebrow: "OEM exploded views",
      title: "Parts Catalog",
      description: "262 exploded parts diagrams for the BG5P EJ20E SOHC NA.",
      open: "Open",
      partsList: "Parts List",
      relatedMaintenance: "Maintenance:",
      previous: "Previous",
      next: "Next",
      previousShort: "Prev",
      nextShort: "Next",
      backTo: "Back to",
      diagramAltSeparator: "—",
    },
    maintenance: {
      eyebrow: "Service procedures",
      title: "Maintenance Guides",
      description: "Quick-reference specs and procedures for the EJ20E SOHC NA.",
      allGuides: "All maintenance guides",
      specs: "Specs",
      steps: "Steps",
      pdfs: "PDFs",
      partsDiagrams: "Parts Diagrams",
      difficulty: {
        Easy: "Easy",
        Moderate: "Moderate",
        Advanced: "Advanced",
      },
    },
    manuals: {
      eyebrow: "Factory PDF library",
      title: "Service Manuals",
      description:
        "factory PDFs covering EJ20E engine systems and BG chassis wiring, drivetrain, body, HVAC, and mechanical sections.",
      filterPlaceholder: (count: number) => `Filter ${count} documents…`,
      clearFilter: "Clear filter",
      noDocuments: (filter: string) => `No documents matching “${filter}”`,
      engineTitle: "EJ20E Engine Manuals",
      engineSubtitle: (count: number) =>
        `${count} document${count !== 1 ? "s" : ""} — EJ20 2.0L SOHC NA engine`,
      chassisTitle: "BG Chassis Manuals",
      chassisSubtitle: (count: number) =>
        `${count} documents — body, electrical, mechanical, transmission & wiring`,
      docs: (count: number) => `${count} docs`,
      sectionDescriptions: {
        "BODY SECTION":
          "Body panels, exterior trim, doors & windows, seats, interior, airbags",
        "ELECTRICAL SECTION":
          "Lighting, instrument cluster, HVAC controls, power accessories",
        "ENGINE - UNIVERSAL":
          "Engine mechanical, fuel system, exhaust, engine mounts, clutch",
        "MECHANICAL COMPONENTS SECTION":
          "Brakes, suspension, steering, wheels & axles, A/C system",
        TRANSMISSION:
          "Manual & automatic transmission, front/rear/center differentials",
        "WIRING DIAGRAM SECTION":
          "Full electrical wiring diagrams and circuit schematics",
      },
    },
    about: {
      eyebrow: "Vehicle profile",
      title: "About the BG5P Legacy GL",
      description:
        "Vehicle specifications, chassis decoding, engine details, and the history of this rare Vietnamese-market Subaru.",
      vehicleSummaryTitle: "Vehicle Summary",
      chassisTitle: "Decoded Chassis Plate",
      code: "Code",
      meaning: "Meaning",
      engineTitle: "Engine Details",
      historyTitle: "Subaru in Vietnam",
      notesTitle: "Important Notes",
      sourcesTitle: "Sources",
      vehicleSummary: [
        { label: "Model Code", value: "BG5P" },
        { label: "Generation", value: "2nd-gen Legacy Touring Wagon (1993–1998)" },
        { label: "Trim", value: "GL (base)" },
        { label: "Engine", value: "EJ20E 2.0L Flat-4 SOHC NA — 120 HP / 184 Nm" },
        { label: "Transmission", value: "5-speed manual" },
        { label: "Drivetrain", value: "Full-time AWD" },
        { label: "Steering", value: "Left-hand drive" },
        { label: "Market", value: "Vietnam — General Market LHD export" },
        { label: "Diagnostics", value: "SSM1 protocol — NO OBD-II" },
      ],
      chassisPlate: [
        { code: "BG", meaning: "Legacy Touring Wagon (2nd gen)" },
        { code: "5", meaning: "EJ20 engine series" },
        { code: "P", meaning: "General Market variant" },
        { code: "JF1BG5LJ4VG072437", meaning: "Example VIN" },
      ],
      engineParagraphs: [
        "The EJ20E is a 2.0-liter horizontally opposed (“flat-four”) engine with a single overhead camshaft (SOHC) and natural aspiration. It produces approximately 120 HP at ~5,600 rpm and 184 Nm of torque at ~4,400 rpm.",
        "The fuel system uses single-range electronic multi-point injection (EMPI). This engine is not OBD-II equipped. Diagnostics rely on the SSM1 protocol, which requires either a dedicated SSM1 scan tool or manual CEL code reading by bridging connector pins under the dash.",
      ],
      historyParagraphs: [
        "Approximately a few dozen BG5P wagons were imported to Vietnam around 1997. These were General Market left-hand-drive exports, built at Subaru’s Gunma plant in Japan.",
        "The BG5P was never officially sold in Vietnam. These were private imports, likely brought in by individuals or small dealers. Very rare today, possibly fewer than a dozen examples survive in the country.",
      ],
      notes: [
        "The USDM version of the Legacy used the EJ22 (2.2L), not the EJ20E. Engine procedures differ between these two powerplants.",
        "There is no OBD-II port on this vehicle. Diagnostics require an SSM1-compatible scan tool or manual code reading.",
        "The BG5P model code is largely undocumented in public databases. The P suffix is believed to denote the General Market variant code.",
        "BG chassis parts are generally shared across variants, but engine parts are EJ20E-specific. Always verify part numbers against the EJ20E parts catalog.",
      ],
      sources: [
        { label: "Service manuals", value: "car-inform.com" },
        { label: "BG chassis FSM", value: "1997 Subaru Legacy USDM Factory Service Manual" },
        { label: "Vehicle info", value: "Vietnamese automotive press (Thanh Nien, CarBiz.vn)" },
      ],
    },
    notFound: {
      eyebrow: "Not found",
      title: "That BG5P reference was not found.",
      description:
        "Use the main indexes to get back to manuals, parts diagrams, or maintenance procedures.",
      home: "Go to overview",
      manuals: "Open manuals",
      parts: "Open parts catalog",
    },
    components: {
      search: {
        placeholder: "Search manuals, OEM parts, diagrams, flash codes...",
        aria: "Search diagrams and parts",
        noResults: "No results",
        section: "Section",
        category: "Category",
      },
      diagramViewer: {
        zoomOut: "Zoom out",
        zoomIn: "Zoom in",
        resetZoom: "Reset zoom",
        reset: "Reset",
        hint: "Scroll to zoom · Drag to pan · Pinch on mobile",
      },
      partsTable: {
        empty: "Parts data is not listed for this diagram in the local BG5P corpus.",
        notApplicable:
          "The EPC source marks this subgroup as not applicable for the selected BG5 AT complectation.",
        noItemizedRows:
          "The EPC source has a category page for this diagram, but no itemized OEM part rows for the selected BG5 AT complectation.",
        sourceUnpublished:
          "The selected BG5 AT EPC source does not publish itemized rows for this diagram in the local corpus.",
        oemPartNumber: "OEM Part Number",
        quantity: "Qty",
        productionPeriod: "Production Period",
        models: "Models",
        notes: "Notes",
        replacements: "Replacements",
      },
    },
  },
  vi: {
    metadata: {
      root: {
        title: "BG5P Legacy GL — Tài liệu kỹ thuật",
        description:
          "Sơ đồ phụ tùng, hướng dẫn bảo dưỡng và tài liệu kỹ thuật cho Subaru BG5P Legacy GL wagon đời 1994–1998, bản thị trường Việt Nam LHD.",
      },
      parts: {
        title: "Catalogue phụ tùng — BG5P Legacy GL",
        description:
          "262 sơ đồ phụ tùng dạng nổ cho BG5P EJ20E SOHC NA, chia theo 16 nhóm.",
      },
      maintenance: {
        title: "Hướng dẫn bảo dưỡng — BG5P Legacy GL",
        description:
          "Thông số nhanh, lực siết và quy trình từng bước cho EJ20E SOHC NA.",
      },
      manuals: {
        title: "Tài liệu kỹ thuật — BG5P Legacy GL",
        description:
          "Bộ PDF tài liệu kỹ thuật cho BG5P Legacy GL, gồm động cơ EJ20E và khung gầm BG.",
      },
      about: {
        title: "Thông tin xe — BG5P Legacy GL",
        description:
          "Thông tin xe, giải mã chassis plate, chi tiết động cơ và bối cảnh Subaru BG5P Legacy GL tại Việt Nam.",
      },
    },
    shell: {
      reference: "Tài liệu",
      serviceReference: "Thư viện chẩn đoán",
      publicReferences: "Link công khai",
      askAi: "Hỏi AI BG5P",
      topbar: "Thư viện kỹ thuật",
      aiButton: "AI",
      openNavigation: "Mở điều hướng",
      closeNavigation: "Đóng điều hướng",
      switchLanguage: "Chuyển sang tiếng Anh",
      chatPrompt: "Giúp tôi chọn hướng chẩn đoán đúng cho BG5P.",
      nav: {
        overview: "Tổng quan",
        parts: "Phụ tùng",
        maintenance: "Bảo dưỡng",
        manuals: "Tài liệu kỹ thuật",
        about: "Hồ sơ xe",
      },
      navSecondary: {
        overview: "Trang chính",
        parts: "Sơ đồ và mã OEM",
        maintenance: "Thông số và quy trình",
        manuals: "PDF nhà máy",
        about: "Thông tin xe",
      },
      quickRefs: [
        {
          href: "/manuals",
          label: "PDF EJ20E no-OBD",
          meta: "Mã nháy, nhiên liệu, đánh lửa",
        },
        {
          href: "/parts",
          label: "262 sơ đồ phụ tùng",
          meta: "Mã OEM và hình nổ",
        },
        {
          href: "/llms.txt",
          label: "Sitemap LLM",
          meta: "Deeplink cho trợ lý",
        },
      ],
    },
    home: {
      eyebrow: "BG5P · EJ20E · Việt Nam LHD",
      title: "Tài liệu chẩn đoán Legacy GL.",
      description:
        "Tài liệu nhà máy, sơ đồ phụ tùng dạng nổ, quy trình bảo dưỡng và trợ lý AI được chỉnh cho luồng chẩn đoán BG5P EJ20E đời pre-OBD.",
      open: "Mở",
      specs: [
        { label: "Khung gầm", value: "BG5P" },
        { label: "Động cơ", value: "EJ20E 2.0L SOHC NA" },
        { label: "Truyền động", value: "5MT AWD toàn thời gian" },
        { label: "Chẩn đoán", value: "SSM1 / không OBD-II" },
        { label: "Thị trường", value: "Việt Nam General Market LHD" },
      ],
      sections: [
        {
          title: "Catalogue phụ tùng",
          href: "/parts",
          value: "262",
          unit: "sơ đồ",
          description: "Hình nổ, mã OEM, nhóm phụ tùng và mã thay thế.",
        },
        {
          title: "Bảo dưỡng",
          href: "/maintenance",
          value: "phiếu",
          unit: "kỹ thuật",
          description: "Thông số, lực siết, chu kỳ, sơ đồ và PDF liên quan.",
        },
        {
          title: "Tài liệu",
          href: "/manuals",
          value: "373",
          unit: "PDF nhà máy",
          description: "Động cơ EJ20E, khung gầm BG, điện, truyền động và thân xe.",
        },
      ],
      diagnosticTitle: "Cách chẩn đoán",
      diagnosticSubtitle: "Kiểm tra đơn giản trước. Bám đúng logic BG5P.",
      diagnosticPaths: [
        "Đọc mã nháy CEL hai chữ số",
        "Truy vết ga-lăng-ti rung, không nổ máy và khó nổ khi nóng",
        "Tìm mã OEM trước khi mua phụ tùng cũ",
        "Mở trực tiếp PDF điện, động cơ và khung gầm",
      ],
      linksTitle: "Deeplink công khai",
      linksSubtitle: "Trợ lý chỉ trả link mà chủ xe mở được.",
      linkLabels: {
        sitemap: "Sitemap LLM",
        manuals: "Danh mục tài liệu",
        parts: "Danh mục sơ đồ",
      },
    },
    parts: {
      crumb: "Phụ tùng",
      eyebrow: "Hình nổ OEM",
      title: "Catalogue phụ tùng",
      description: "262 sơ đồ phụ tùng dạng nổ cho BG5P EJ20E SOHC NA.",
      open: "Mở",
      partsList: "Danh sách phụ tùng",
      relatedMaintenance: "Bảo dưỡng:",
      previous: "Trước",
      next: "Tiếp",
      previousShort: "Trước",
      nextShort: "Tiếp",
      backTo: "Quay lại",
      diagramAltSeparator: "—",
    },
    maintenance: {
      eyebrow: "Quy trình bảo dưỡng",
      title: "Hướng dẫn bảo dưỡng",
      description: "Thông số nhanh và quy trình cho EJ20E SOHC NA.",
      allGuides: "Tất cả hướng dẫn bảo dưỡng",
      specs: "Thông số",
      steps: "Các bước",
      pdfs: "PDF",
      partsDiagrams: "Sơ đồ phụ tùng",
      difficulty: {
        Easy: "Dễ",
        Moderate: "Trung bình",
        Advanced: "Khó",
      },
    },
    manuals: {
      eyebrow: "Thư viện PDF nhà máy",
      title: "Tài liệu kỹ thuật",
      description:
        "PDF nhà máy cho hệ thống động cơ EJ20E và khung gầm BG: điện, truyền động, thân xe, HVAC và cơ khí.",
      filterPlaceholder: (count: number) => `Lọc ${count} tài liệu…`,
      clearFilter: "Xóa bộ lọc",
      noDocuments: (filter: string) => `Không có tài liệu khớp “${filter}”`,
      engineTitle: "Tài liệu động cơ EJ20E",
      engineSubtitle: (count: number) => `${count} tài liệu — động cơ EJ20 2.0L SOHC NA`,
      chassisTitle: "Tài liệu khung gầm BG",
      chassisSubtitle: (count: number) =>
        `${count} tài liệu — thân xe, điện, cơ khí, truyền động và dây điện`,
      docs: (count: number) => `${count} tài liệu`,
      sectionDescriptions: {
        "BODY SECTION": "Tấm thân xe, nẹp ngoài, cửa kính, ghế, nội thất, túi khí",
        "ELECTRICAL SECTION": "Đèn, đồng hồ táp-lô, điều khiển HVAC, phụ kiện điện",
        "ENGINE - UNIVERSAL": "Cơ khí động cơ, nhiên liệu, xả, chân máy, ly hợp",
        "MECHANICAL COMPONENTS SECTION":
          "Phanh, treo, lái, bánh và moay-ơ, hệ thống A/C",
        TRANSMISSION: "Hộp số sàn/tự động, vi sai trước/sau/giữa",
        "WIRING DIAGRAM SECTION": "Sơ đồ dây điện đầy đủ và mạch điện",
      },
    },
    about: {
      eyebrow: "Hồ sơ xe",
      title: "Thông tin BG5P Legacy GL",
      description:
        "Thông số xe, giải mã chassis, chi tiết động cơ và bối cảnh mẫu Subaru hiếm tại Việt Nam.",
      vehicleSummaryTitle: "Tóm tắt xe",
      chassisTitle: "Giải mã chassis plate",
      code: "Mã",
      meaning: "Ý nghĩa",
      engineTitle: "Chi tiết động cơ",
      historyTitle: "Subaru tại Việt Nam",
      notesTitle: "Lưu ý quan trọng",
      sourcesTitle: "Nguồn",
      vehicleSummary: [
        { label: "Mã model", value: "BG5P" },
        { label: "Thế hệ", value: "Legacy Touring Wagon đời 2 (1993–1998)" },
        { label: "Phiên bản", value: "GL (base)" },
        { label: "Động cơ", value: "EJ20E 2.0L Flat-4 SOHC NA — 120 HP / 184 Nm" },
        { label: "Hộp số", value: "Số sàn 5 cấp" },
        { label: "Truyền động", value: "AWD toàn thời gian" },
        { label: "Vô-lăng", value: "Tay lái trái" },
        { label: "Thị trường", value: "Việt Nam — General Market LHD export" },
        { label: "Chẩn đoán", value: "Giao thức SSM1 — không OBD-II" },
      ],
      chassisPlate: [
        { code: "BG", meaning: "Legacy Touring Wagon đời 2" },
        { code: "5", meaning: "Dòng động cơ EJ20" },
        { code: "P", meaning: "Biến thể General Market" },
        { code: "JF1BG5LJ4VG072437", meaning: "VIN ví dụ" },
      ],
      engineParagraphs: [
        "EJ20E là động cơ boxer 2.0 lít, 4 xi-lanh nằm ngang, SOHC và hút khí tự nhiên. Công suất xấp xỉ 120 HP tại ~5.600 rpm và mô-men xoắn 184 Nm tại ~4.400 rpm.",
        "Hệ thống nhiên liệu dùng phun xăng điện tử đa điểm single-range (EMPI). Động cơ này không có OBD-II. Chẩn đoán dựa trên giao thức SSM1, dùng máy SSM1 hoặc đọc mã CEL thủ công bằng cách nối chân giắc chẩn đoán.",
      ],
      historyParagraphs: [
        "Khoảng vài chục xe BG5P wagon được nhập về Việt Nam quanh năm 1997. Đây là xe xuất khẩu General Market tay lái trái, sản xuất tại nhà máy Gunma của Subaru ở Nhật.",
        "BG5P không được bán chính hãng tại Việt Nam. Các xe này nhiều khả năng là nhập tư nhân hoặc qua đại lý nhỏ. Hiện nay rất hiếm, có thể chỉ còn dưới một chục xe trong nước.",
      ],
      notes: [
        "Legacy bản USDM dùng EJ22 2.2L, không phải EJ20E. Quy trình động cơ giữa hai máy khác nhau.",
        "Xe không có cổng OBD-II. Chẩn đoán cần máy tương thích SSM1 hoặc đọc mã nháy thủ công.",
        "Mã model BG5P gần như không có trong cơ sở dữ liệu công khai. Hậu tố P được cho là mã biến thể General Market.",
        "Phụ tùng khung gầm BG thường dùng chung giữa các biến thể, nhưng phụ tùng động cơ phải đúng EJ20E. Luôn đối chiếu mã phụ tùng với catalogue EJ20E.",
      ],
      sources: [
        { label: "Tài liệu kỹ thuật", value: "car-inform.com" },
        { label: "FSM khung gầm BG", value: "1997 Subaru Legacy USDM Factory Service Manual" },
        { label: "Thông tin xe", value: "báo ô tô Việt Nam (Thanh Niên, CarBiz.vn)" },
      ],
    },
    notFound: {
      eyebrow: "Không tìm thấy",
      title: "Không tìm thấy tài liệu BG5P này.",
      description:
        "Dùng các mục chính để quay lại tài liệu, sơ đồ phụ tùng hoặc quy trình bảo dưỡng.",
      home: "Về tổng quan",
      manuals: "Mở tài liệu",
      parts: "Mở catalogue phụ tùng",
    },
    components: {
      search: {
        placeholder: "Tìm tài liệu, mã OEM, sơ đồ, mã nháy...",
        aria: "Tìm sơ đồ và phụ tùng",
        noResults: "Không có kết quả",
        section: "Nhóm",
        category: "Danh mục",
      },
      diagramViewer: {
        zoomOut: "Thu nhỏ",
        zoomIn: "Phóng to",
        resetZoom: "Đặt lại zoom",
        reset: "Đặt lại",
        hint: "Cuộn để zoom · Kéo để di chuyển · Chụm trên mobile",
      },
      partsTable: {
        empty: "Dữ liệu phụ tùng không được liệt kê cho sơ đồ này trong bộ dữ liệu BG5P cục bộ.",
        notApplicable:
          "Nguồn EPC đánh dấu phân nhóm này là không áp dụng cho cấu hình BG5 AT đã chọn.",
        noItemizedRows:
          "Nguồn EPC có trang danh mục cho sơ đồ này, nhưng không liệt kê từng mã phụ tùng OEM cho cấu hình BG5 AT đã chọn.",
        sourceUnpublished:
          "Nguồn EPC BG5 AT đã chọn không công bố từng dòng phụ tùng cho sơ đồ này trong bộ dữ liệu cục bộ.",
        oemPartNumber: "Mã phụ tùng OEM",
        quantity: "SL",
        productionPeriod: "Giai đoạn sản xuất",
        models: "Model",
        notes: "Ghi chú",
        replacements: "Mã thay thế",
      },
    },
  },
} as const;

export function getCopy(locale: Locale) {
  return SITE_COPY[locale];
}

export function getPageMetadata(locale: Locale, page: keyof typeof SITE_COPY.en.metadata): Metadata {
  return SITE_COPY[locale].metadata[page] satisfies PageMeta;
}

export function diagramCount(locale: Locale, count: number) {
  return locale === "vi"
    ? `${count} sơ đồ`
    : `${count} diagram${count !== 1 ? "s" : ""}`;
}

export function localizeDifficulty(value: string, locale: Locale) {
  const labels = SITE_COPY[locale].maintenance.difficulty as Record<string, string>;
  return labels[value] ?? value;
}

const SECTION_NAMES_VI: Record<string, string> = {
  "Engine Main": "Cụm động cơ chính",
  "Engine Auxiliaries": "Phụ trợ động cơ",
  "Engine Electrical": "Điện động cơ",
  "Manual Transmission": "Hộp số sàn",
  "Differential Propeller": "Vi sai và trục các-đăng",
  "Suspension Axle Brake": "Treo, cầu và phanh",
  Steering: "Hệ thống lái",
  "Engine Mounting Cooling": "Chân máy và làm mát",
  "Body Key Bumper": "Thân xe, khóa và cản",
  "Door Parts": "Cụm cửa",
  "Seat Instrument Panel": "Ghế và táp-lô",
  "Heater & AC": "Sưởi và A/C",
  "Body Electrical 1": "Điện thân xe 1",
  "Body Electrical 2": "Điện thân xe 2",
  "Outer Accessories": "Phụ kiện ngoài",
  "Inner Accessories": "Phụ kiện trong",
};

const TECHNICAL_NAMES_VI: Record<string, string> = {
  "BODY SECTION": "Nhóm thân xe",
  "ELECTRICAL SECTION": "Nhóm điện",
  "ENGINE - UNIVERSAL": "Động cơ - dùng chung",
  "MECHANICAL COMPONENTS SECTION": "Nhóm cơ khí",
  TRANSMISSION: "Hộp số",
  "WIRING DIAGRAM SECTION": "Nhóm sơ đồ dây điện",
  "ENGINE ASSEMBLY": "Cụm động cơ",
  "ENGINE GASKET & SEAL KIT": "Bộ gioăng và phớt động cơ",
  "SHORT BLOCK ENGINE": "Short block động cơ",
  "CYLINDER BLOCK": "Thân máy",
  "TIMING HOLE PLUG & TRANSMISSION BOLT": "Nút lỗ timing và bu-lông hộp số",
  "CYLINDER HEAD": "Quy-lát",
  "PISTON & CRANKSHAFT": "Pít-tông và trục khuỷu",
  FLYWHEEL: "Bánh đà",
  "VALVE MECHANISM": "Cơ cấu xupáp",
  "CAMSHAFT & TIMING BELT": "Trục cam và dây cam",
  "ROCKER COVER": "Nắp giàn cò",
  "TIMING BELT COVER": "Ốp dây cam",
  "OIL FILLER DUCT": "Ống châm dầu",
  "OIL PAN": "Các-te dầu",
  "OIL PUMP & FILTER": "Bơm dầu và lọc dầu",
  "WATER PUMP": "Bơm nước",
  "WATER PIPE (1)": "Ống nước (1)",
  "INTAKE MANIFOLD": "Cổ hút",
  "FUEL PIPE": "Ống nhiên liệu",
  "FUEL INJECTOR": "Kim phun nhiên liệu",
  "THROTTLE CHAMBER": "Cụm bướm ga",
  "AIR CLEANER & ELEMENT": "Hộp lọc gió và lõi lọc",
  "AIR INTAKE": "Đường nạp khí",
  "AIR DUCT": "Ống gió",
  "EMISSION CONTROL (PCV)": "Kiểm soát khí thải (PCV)",
  "SPARK PLUG & HIGH TENSION CORD": "Bugi và dây cao áp",
  "ENGINE WIRING HARNESS": "Dây điện động cơ",
  STARTER: "Máy đề",
  ALTERNATOR: "Máy phát",
  "RELAY & SENSOR (ENGINE)": "Rơ-le và cảm biến động cơ",
  "MT, CLUTCH": "MT, ly hợp",
  "MT, TRANSMISSION ASSEMBLY": "MT, cụm hộp số",
  "MT, GASKET & SEAL KIT": "MT, bộ gioăng và phớt",
  "MT, TRANSMISSION CASE": "MT, vỏ hộp số",
  "MT, MAIN SHAFT": "MT, trục chính",
  "MT, DRIVE PINION SHAFT": "MT, trục pinion chủ động",
  "MT, AUXILIARY GEAR": "MT, bánh răng phụ",
  "MT, SPEEDOMETER GEAR": "MT, bánh răng công-tơ-mét",
  "MT, TRANSMISSION HARNESS": "MT, dây điện hộp số",
  "MT, TRANSFER & EXTENSION": "MT, transfer và đuôi hộp số",
  "MT, SHIFTER FORK & SHIFTER RAIL": "MT, càng gạt và trục gạt số",
  "DIFFERENTIAL (TRANSMISSION)": "Vi sai trong hộp số",
  "DIFFERENTIAL (INDIVIDUAL)": "Vi sai rời",
  "PROPELLER SHAFT": "Trục các-đăng",
  "FRONT SUSPENSION": "Treo trước",
  "REAR SUSPENSION": "Treo sau",
  "FRONT SHOCK ABSORBER": "Giảm xóc trước",
  "REAR SHOCK ABSORBER": "Giảm xóc sau",
  "AIR SUSPENSION SYSTEM": "Hệ thống treo khí",
  "PARKING BRAKE SYSTEM": "Hệ thống phanh tay",
  "BRAKE SYSTEM (MASTER CYLINDER)": "Hệ thống phanh (xy-lanh chính)",
  "FRONT BRAKE": "Phanh trước",
  "REAR BRAKE": "Phanh sau",
  "BRAKE PIPING": "Đường ống phanh",
  "ANTILOCK BRAKE SYSTEM": "Hệ thống ABS",
  "HILL HOLDER": "Giữ dốc",
  "FRONT AXLE": "Cầu trước",
  "REAR AXLE": "Cầu sau",
  "DISK WHEEL": "Mâm xe",
  "WHEEL CAP": "Ốp mâm",
  TIRE: "Lốp",
  "STEERING COLUMN": "Trụ lái",
  "STEERING WHEEL": "Vô-lăng",
  "AIR BAG": "Túi khí",
  "POWER STEERING SYSTEM": "Hệ thống trợ lực lái",
  "POWER STEERING GEAR BOX": "Thước lái trợ lực",
  "OIL PUMP": "Bơm dầu",
  "MANUAL GEAR SHIFT SYSTEM": "Cơ cấu sang số sàn",
  "PEDAL SYSTEM (MT)": "Cụm bàn đạp (MT)",
  "ACCEL CABLE": "Dây ga",
  "SPEEDOMETER CABLE": "Dây công-tơ-mét",
  "CLUTCH CABLE": "Dây côn",
  "ENGINE MOUNTING": "Chân máy",
  "ENGINE SUPPORT": "Giá đỡ động cơ",
  "DIFFERENTIAL MOUNTING": "Giá đỡ vi sai",
  "FUEL PIPING": "Đường ống nhiên liệu",
  "FUEL TANK": "Bình xăng",
  EXHAUST: "Hệ thống xả",
  "ENGINE COOLING": "Làm mát động cơ",
  "RADIATOR PANEL": "Khung két nước",
  "WHEEL APRON": "Vè trong bánh xe",
  "FLOOR PANEL": "Sàn xe",
  "TOE BOARD & FRONT PANEL & STEERING BEAM": "Vách chân, mặt trước và dầm lái",
  "SIDE BODY OUTER": "Hông xe ngoài",
  "SIDE BODY INNER": "Hông xe trong",
  "ROOF PANEL": "Tấm nóc",
  FENDER: "Tai xe",
  MUDGUARD: "Chắn bùn",
  "FRONT HOOD & FRONT HOOD LOCK": "Nắp capo và khóa capo",
  "FUEL FLAP & OPENER": "Nắp bình xăng và mở nắp",
  "UNDER GUARD": "Tấm chắn gầm",
  "EXHAUST & MUFFLER COVER": "Ốp ống xả và bầu giảm thanh",
  "KEY KIT & KEY LOCK": "Bộ chìa và ổ khóa",
  "FRONT BUMPER": "Cản trước",
  "REAR BUMPER": "Cản sau",
  "FRONT DOOR PANEL": "Tấm cửa trước",
  "FRONT DOOR PARTS (GLASS & REGULATOR)": "Phụ tùng cửa trước (kính và bộ nâng)",
  "FRONT DOOR PARTS (LATCH & HANDLE)": "Phụ tùng cửa trước (chốt và tay nắm)",
  "REAR DOOR PANEL": "Tấm cửa sau",
  "REAR DOOR PARTS (GLASS & REGULATOR)": "Phụ tùng cửa sau (kính và bộ nâng)",
  "REAR DOOR PARTS (LATCH & HANDLE)": "Phụ tùng cửa sau (chốt và tay nắm)",
  "BACK DOOR PANEL": "Tấm cửa hậu",
  "BACK DOOR GLASS": "Kính cửa hậu",
  "BACK DOOR PARTS": "Phụ tùng cửa hậu",
  "FRONT SEAT": "Ghế trước",
  "REAR SEAT": "Ghế sau",
  "FRONT SEAT BELT": "Dây an toàn trước",
  "REAR SEAT BELT": "Dây an toàn sau",
  "WINDSHIELD GLASS": "Kính chắn gió",
  "REAR QUARTER": "Kính hông sau",
  "SUN ROOF": "Cửa sổ trời",
  "TONNEAU COVER": "Tấm che khoang hành lý",
  "INSTRUMENT PANEL": "Táp-lô",
  "HEATER SYSTEM": "Hệ thống sưởi",
  "HEATER UNIT": "Cụm sưởi",
  "HEATER BLOWER": "Quạt gió sưởi",
  "HEATER CONTROL": "Điều khiển sưởi",
  "AIR CONDITIONER SYSTEM": "Hệ thống điều hòa",
  "COOLING UNIT": "Cụm làm lạnh",
  COMPRESSOR: "Máy nén",
  "WIRING HARNESS (MAIN)": "Dây điện chính",
  "WIRING HARNESS (INSTRUMENT PANEL)": "Dây điện táp-lô",
  "CORD (ROOF)": "Dây điện nóc",
  "CORD (DOOR)": "Dây điện cửa",
  "CORD (REAR)": "Dây điện sau",
  "POWER WINDOW EQUIPMENT": "Thiết bị kính điện",
  "CORD (ANOTHER)": "Dây điện phụ",
  "BATTERY EQUIPMENT": "Thiết bị ắc-quy",
  "FUSE BOX": "Hộp cầu chì",
  "SWITCH (INSTRUMENT PANEL)": "Công tắc táp-lô",
  "SWITCH (COMBINATION)": "Công tắc tổ hợp",
  "SWITCH (POWER WINDOW)": "Công tắc kính điện",
  "ELECTRICAL PARTS (BODY)": "Phụ tùng điện thân xe",
  "HEAD LAMP": "Đèn pha",
  "LAMP (FRONT)": "Đèn trước",
  "LAMP (REAR)": "Đèn sau",
  "LAMP (LICENSE)": "Đèn biển số",
  "LAMP (FOG)": "Đèn sương mù",
  "LAMP (ROOM)": "Đèn trần",
  "LAMP (HIGH MOUNT STOP LAMP)": "Đèn phanh trên cao",
  METER: "Đồng hồ",
  "AUDIO PARTS (RADIO)": "Âm thanh (radio)",
  ANTENNA: "Ăng-ten",
  CLOCK: "Đồng hồ giờ",
  "WIPER (WINDSHIELD)": "Gạt mưa kính trước",
  "WIPER (REAR)": "Gạt mưa sau",
  "WINDSHIELD WASHER": "Rửa kính trước",
  "REAR WASHER": "Rửa kính sau",
  HORN: "Còi",
  "CRUISE CONTROL EQUIPMENT": "Thiết bị cruise control",
  PLUG: "Nút bịt",
  "WEATHER STRIP": "Gioăng cao su cửa",
  "FRONT GRILLE": "Mặt ca-lăng",
  "REAR VIEW MIRROR": "Gương chiếu hậu",
  PROTECTOR: "Ốp bảo vệ",
  MOLDING: "Nẹp",
  STRIPE: "Tem sọc",
  "LABEL (CAUTION)": "Nhãn cảnh báo",
  "LETTER MARK": "Logo chữ",
  "COWL PANEL": "Tấm chân kính",
  SPOILER: "Cánh gió",
  "ROOF RAIL": "Baga nóc",
  "CONSOLE BOX": "Hộp console",
  "ROOM INNER PARTS": "Phụ tùng nội thất khoang xe",
  COVER: "Nắp che",
  "INNER TRIM": "Ốp nội thất",
  "DOOR TRIM": "Ốp cửa",
  "ROOF TRIM": "Ốp trần",
  MAT: "Thảm",
  SILENCER: "Tấm tiêu âm",
  "FLOOR INSULATOR": "Cách âm sàn",
  "HOOD INSULATOR": "Cách nhiệt capo",
  "TOOL KIT & JACK": "Bộ đồ nghề và kích",
};

const TECH_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bSERVICE MANUALS?\b/gi, "tài liệu kỹ thuật"],
  [/\bFACTORY\b/gi, "nhà máy"],
  [/\bFUEL INJECTION\b/gi, "phun xăng"],
  [/\bFUEL SYSTEM\b/gi, "hệ thống nhiên liệu"],
  [/\bEMISSION CONTROL\b/gi, "kiểm soát khí thải"],
  [/\bSPEED CONTROL\b/gi, "điều khiển tốc độ"],
  [/\bSTARTING CHARGING\b/gi, "khởi động và sạc"],
  [/\bELECTRICAL SYSTEM\b/gi, "hệ thống điện"],
  [/\bMECHANICAL COMPONENTS\b/gi, "cụm cơ khí"],
  [/\bWIRING DIAGRAMS?\b/gi, "sơ đồ dây điện"],
  [/\bMANUALS?\b/gi, "tài liệu"],
  [/\bCOOLING\b/gi, "làm mát"],
  [/\bLUBRICATION\b/gi, "bôi trơn"],
  [/\bDIAGNOSTICS?\b/gi, "chẩn đoán"],
  [/\bIGNITION\b/gi, "đánh lửa"],
  [/\bINTAKE\b/gi, "nạp khí"],
  [/\bEXHAUST\b/gi, "xả"],
  [/\bMECHANICAL\b/gi, "cơ khí"],
  [/\bCOMPONENTS\b/gi, "cụm chi tiết"],
  [/\bSPECS?\b/gi, "thông số"],
  [/\bWIRING\b/gi, "dây điện"],
  [/\bASSEMBLY\b/gi, "cụm"],
  [/\bGASKET\b/gi, "gioăng"],
  [/\bSEAL\b/gi, "phớt"],
  [/\bKIT\b/gi, "bộ"],
  [/\bBOLT\b/gi, "bu-lông"],
  [/\bNUT\b/gi, "đai ốc"],
  [/\bWASHER\b/gi, "long đền"],
  [/\bCOVER\b/gi, "nắp che"],
  [/\bPIPE\b/gi, "ống"],
  [/\bCABLE\b/gi, "dây"],
  [/\bCORD\b/gi, "dây điện"],
  [/\bHARNESS\b/gi, "bó dây"],
  [/\bSENSOR\b/gi, "cảm biến"],
  [/\bRELAY\b/gi, "rơ-le"],
  [/\bFILTER\b/gi, "lọc"],
  [/\bPUMP\b/gi, "bơm"],
  [/\bTANK\b/gi, "bình"],
  [/\bFRONT\b/gi, "trước"],
  [/\bREAR\b/gi, "sau"],
  [/\bLEFT\b/gi, "trái"],
  [/\bRIGHT\b/gi, "phải"],
  [/\bUPPER\b/gi, "trên"],
  [/\bLOWER\b/gi, "dưới"],
  [/\bENGINE\b/gi, "động cơ"],
  [/\bTRANSMISSION\b/gi, "hộp số"],
  [/\bDIFFERENTIAL\b/gi, "vi sai"],
  [/\bSTEERING\b/gi, "lái"],
  [/\bBRAKE\b/gi, "phanh"],
  [/\bCLUTCH\b/gi, "ly hợp"],
  [/\bFUEL\b/gi, "nhiên liệu"],
  [/\bOIL\b/gi, "dầu"],
  [/\bAIR\b/gi, "khí"],
  [/\bWATER\b/gi, "nước"],
  [/\bWHEEL\b/gi, "bánh xe"],
  [/\bDOOR\b/gi, "cửa"],
  [/\bBODY\b/gi, "thân xe"],
  [/\bPANEL\b/gi, "tấm"],
  [/\bSYSTEM\b/gi, "hệ thống"],
  [/\bEQUIPMENT\b/gi, "thiết bị"],
  [/\bPARTS\b/gi, "phụ tùng"],
];

export function localizeSectionName(name: string, locale: Locale) {
  if (locale === "en") return name;
  return SECTION_NAMES_VI[name] ?? localizeTechnicalName(name, locale);
}

export function localizeTechnicalName(name: string, locale: Locale) {
  if (locale === "en") return name;
  const exact = TECHNICAL_NAMES_VI[name.toUpperCase()];
  if (exact) return exact;

  let localized = name.replace(/_/g, " ");
  for (const [pattern, replacement] of TECH_REPLACEMENTS) {
    localized = localized.replace(pattern, replacement);
  }
  return localized;
}

export function localizeManualTitle(name: string, locale: Locale) {
  if (locale === "en") return name;
  return localizeTechnicalName(name.replace(/\bno OBD\b/gi, "no-OBD"), locale);
}

export function localizePartText(value: string | null | undefined, locale: Locale) {
  if (!value) return "";
  if (locale === "en") return value;
  return localizeTechnicalName(value, locale);
}

const MAINTENANCE_VI: Record<string, MaintenanceTranslation> = {
  "oil-change": {
    title: "Thay dầu động cơ",
    interval: "Mỗi 5.000 km hoặc 6 tháng",
    specs: {
      "Oil Type": "Loại dầu",
      "Capacity (to upper level)": "Dung tích tới vạch trên",
      "Capacity (to lower level)": "Dung tích tới vạch dưới",
      "Drain Plug Torque": "Lực siết ốc xả dầu",
      "Oil Filter Thread": "Ren lọc dầu",
      "Oil Filter Type": "Loại lọc dầu",
      "Oil Filter Wrench (ST)": "Cảo lọc dầu (ST)",
      "Alt. Viscosity (hot climate)": "Độ nhớt thay thế khi khí hậu nóng",
    },
    steps: [
      "Làm nóng máy 5 phút rồi tắt máy.",
      "Đặt khay hứng dưới các-te dầu và tháo ốc xả.",
      "Để dầu xả hết hoàn toàn trong 5-10 phút.",
      "Thay gioăng ốc xả mới.",
      "Siết ốc xả dầu tới 44 Nm (33 ft-lb).",
      "Tháo lọc dầu cũ bằng ST 498547000 hoặc cảo lọc dầu.",
      "Bôi một lớp dầu mới mỏng lên gioăng lọc dầu mới.",
      "Lắp lọc mới bằng tay, sau đó vặn thêm 3/4 vòng.",
      "Châm dầu qua nắp châm tới vạch trên (4,0 L).",
      "Nổ máy 1 phút, tắt máy rồi kiểm tra lại mức dầu.",
      "Châm thêm nếu cần, giữ mức dầu giữa vạch L và F trên que thăm.",
    ],
  },
  "timing-belt": {
    title: "Thay dây cam",
    interval: "Mỗi 100.000 km hoặc 60 tháng",
    specs: {
      "Belt Tooth Length Z1": "Số răng đoạn dây Z1",
      "Belt Tooth Length Z2": "Số răng đoạn dây Z2",
      "Tensioner Adjuster Torque": "Lực siết bộ căng dây",
      "Belt Idler No. 1 Torque": "Lực siết bi tỳ số 1",
      "Belt Idler No. 2 Torque": "Lực siết bi tỳ số 2",
      "Camshaft Sprocket Torque": "Lực siết bánh răng cam",
      "Crank Pulley Bolt Torque": "Lực siết bu-lông puly trục khuỷu",
      "Belt Cover Torque": "Lực siết ốp dây cam",
      "Belt-to-Guide Clearance": "Khe hở dây cam tới tấm dẫn hướng",
      "Tensioner Rod Extension": "Độ nhô ty tăng dây",
      "Tensioner Press Pressure": "Lực ép ty tăng dây",
      "Crank Pulley Wrench (ST)": "Dụng cụ giữ puly trục khuỷu (ST)",
      "Cam Sprocket Wrench (ST1)": "Dụng cụ giữ bánh răng cam (ST1)",
      "Cam Sprocket Wrench (ST2)": "Dụng cụ giữ bánh răng cam (ST2)",
    },
    steps: [
      "Ngắt cọc âm ắc-quy.",
      "Tháo dây đai ngoài: máy phát, A/C và trợ lực lái.",
      "Tháo puly trục khuỷu bằng ST 499977300.",
      "Tháo ốp dây cam bên phải và bên trái.",
      "Tháo tấm dẫn hướng dây cam trên xe MT.",
      "Đánh dấu chiều quay dây cam nếu dùng lại.",
      "Canh dấu bánh răng trục khuỷu (a) với rãnh trên thân máy (b).",
      "Kiểm tra dấu bánh răng cam thẳng với mặt quy-lát.",
      "Tháo bi tỳ số 2 rồi bi tỳ số 1.",
      "Tháo dây cam.",
      "Tháo cụm tăng dây tự động.",
      "Ép ty tăng dây bằng lực 294 N và cài chốt chặn 2 mm.",
      "Lắp cụm tăng dây mới, siết 25 Nm.",
      "Lắp bi tỳ số 1, siết 39 Nm.",
      "Canh bánh răng cam bằng ST1 và ST2.",
      "Lắp dây cam mới đúng dấu canh và đúng chiều quay.",
      "Lắp bi tỳ số 2, siết 39 Nm.",
      "Rút chốt chặn khỏi bộ tăng dây.",
      "Lắp tấm dẫn hướng dây cam trên xe MT, kiểm tra khe hở 1,0 mm.",
      "Lắp ốp dây cam, puly trục khuỷu và dây đai ngoài.",
      "Quay động cơ 2 vòng đầy đủ và kiểm tra lại toàn bộ dấu canh.",
    ],
  },
  "coolant-flush": {
    title: "Xúc rửa nước làm mát",
    interval: "Mỗi 30.000 km hoặc 24 tháng",
    specs: {
      "Coolant Type": "Loại nước làm mát",
      "Capacity (MT, to FULL)": "Dung tích MT tới mức FULL",
      "Capacity (AT, to FULL)": "Dung tích AT tới mức FULL",
      "Reservoir Tank Capacity": "Dung tích bình phụ",
      "Thermostat Opens": "Nhiệt độ thermostat bắt đầu mở",
      "Thermostat Fully Open": "Nhiệt độ thermostat mở hết",
      "Thermostat Valve Lift": "Độ nâng van thermostat",
      "Thermostat Cover Torque": "Lực siết nắp thermostat",
      "Coolant Concentration": "Nồng độ nước làm mát",
      "Radiator Cap Pressure": "Áp suất nắp két nước",
      "Water Pump Bolt Torque": "Lực siết bu-lông bơm nước",
    },
    steps: [
      "Để động cơ nguội hẳn; két nước có áp suất khi nóng.",
      "Nâng xe và tháo tấm che gầm.",
      "Đặt khay hứng dưới két nước, mở van xả.",
      "Mở nắp két nước để xả nhanh hơn.",
      "Xả hết nước làm mát khỏi két nước và thân máy.",
      "Đóng van xả, đổ nước sạch vào két.",
      "Nổ máy 2.000-3.000 rpm trong ít nhất 5 phút để xúc rửa.",
      "Xả nước xúc rửa, lặp lại nếu nước còn bẩn.",
      "Đóng van xả, châm nước làm mát Subaru pha đúng tỷ lệ tới cổ két.",
      "Châm bình phụ tới mức FULL.",
      "Làm nóng máy ở 2.000-3.000 rpm trong hơn 5 phút.",
      "Kiểm tra mức két khi thermostat mở và châm thêm nếu cần.",
      "Kiểm tra bình phụ, châm tới vạch trên.",
      "Lắp chặt nắp két nước và nắp bình phụ.",
    ],
  },
  "brake-pads": {
    title: "Má phanh trước và sau",
    interval: "Mỗi 20.000 km hoặc khi cần",
    specs: {
      "Front Type": "Loại phanh trước",
      "Front Pad Dimensions": "Kích thước má phanh trước",
      "Front Pad New Thickness (with backing)": "Độ dày má trước mới kèm lưng",
      "Front Pad Min Thickness (with backing)": "Độ dày tối thiểu má trước kèm lưng",
      "Front Disc Thickness (new)": "Độ dày đĩa trước mới",
      "Front Disc Min Thickness": "Độ dày tối thiểu đĩa trước",
      "Front Disc Max Runout": "Độ đảo tối đa đĩa trước",
      "Front Caliper Guide Pin Torque": "Lực siết chốt trượt cùm trước",
      "Front Support Bolt Torque": "Lực siết bu-lông giá đỡ trước",
      "Rear Type": "Loại phanh sau",
      "Rear Pad Dimensions": "Kích thước má phanh sau",
      "Rear Pad New Thickness (with backing)": "Độ dày má sau mới kèm lưng",
      "Rear Pad Min Thickness (with backing)": "Độ dày tối thiểu má sau kèm lưng",
      "Rear Disc Thickness (new)": "Độ dày đĩa sau mới",
      "Rear Disc Min Thickness": "Độ dày tối thiểu đĩa sau",
      "Rear Disc Max Runout": "Độ đảo tối đa đĩa sau",
      "Brake Fluid": "Dầu phanh",
      "Air Bleeder Screw Torque": "Lực siết vít xả gió",
    },
    steps: [
      "Nới lỏng ốc bánh, nâng xe và kê chân kê an toàn.",
      "Tháo bánh xe.",
      "Kiểm tra độ dày má qua lỗ kiểm tra trên cùm phanh.",
      "Tháo bu-lông chốt trượt cùm phanh, tháo bu-lông dưới trước.",
      "Lật cùm phanh lên và treo bằng dây, không để treo bằng ống dầu phanh.",
      "Tháo má cũ, shim ngoài, shim trong và kẹp má.",
      "Vệ sinh giá cùm phanh bằng dung dịch vệ sinh phanh.",
      "Kiểm tra độ dày và độ đảo đĩa theo giới hạn service.",
      "Ép piston cùm phanh vào bằng C-clamp, kiểm tra mức dầu phanh trước.",
      "Lắp kẹp má mới lên giá đỡ.",
      "Lắp shim trong, má trong, má ngoài và shim ngoài.",
      "Hạ cùm phanh xuống má mới và lắp bu-lông chốt trượt.",
      "Siết bu-lông chốt trượt 37 Nm ở trước hoặc theo thông số phía sau.",
      "Lắp bánh xe và siết ốc bánh.",
      "Đạp phanh vài lần trước khi chạy để ép má vào vị trí.",
      "Kiểm tra và châm thêm dầu phanh nếu cần.",
    ],
  },
  "spark-plugs": {
    title: "Bugi",
    interval: "Mỗi 20.000 km hoặc 12 tháng",
    specs: {
      "Plug (without catalytic converter)": "Bugi không có catalytic converter",
      "Plug (with catalytic converter)": "Bugi có catalytic converter",
      "Thread Size": "Cỡ ren",
      "Gap (without catalyst)": "Khe hở không có catalyst",
      "Gap (with catalyst)": "Khe hở có catalyst",
      "Spark Plug Torque": "Lực siết bugi",
      "Ignition Coil Bolt Torque": "Lực siết bu-lông bobin",
      "Spark Plug Cord Resistance": "Điện trở dây bugi",
      "Firing Order": "Thứ tự đánh lửa",
      "Ignition Coil": "Bobin đánh lửa",
    },
    steps: [
      "Ngắt cọc âm ắc-quy.",
      "Bên phải: tháo ống nạp khí và bầu cộng hưởng.",
      "Bên trái: ngắt mô-tơ rửa kính, tháo bu-lông bình nước rửa kính.",
      "Rút dây bugi bằng cách kéo ở chụp, không kéo dây.",
      "Tháo bugi bằng tuýp bugi sâu 16 mm.",
      "Kiểm tra bugi cũ xem có muội, hư hỏng hoặc mòn.",
      "Kiểm tra khe hở bugi mới bằng lá căn và chỉnh nếu cần.",
      "Vặn bugi mới bằng tay trước để tránh chéo ren.",
      "Siết bugi 21 Nm (15 ft-lb), ren khô.",
      "Nếu ren có dầu, giảm lực siết khoảng 1/3.",
      "Cắm lại dây bugi đúng vị trí theo thứ tự đánh lửa 1-3-2-4.",
      "Lắp lại bầu cộng hưởng, siết 32 Nm, rồi lắp ống nạp khí.",
      "Lắp lại bình nước rửa kính bên trái và nối lại ắc-quy.",
    ],
  },
  "air-filter": {
    title: "Thay lọc gió",
    interval: "Mỗi 20.000 km hoặc 12 tháng; kiểm tra mỗi 10.000 km",
    specs: {
      "Filter Type": "Loại lọc",
      "OEM Part Number": "Mã phụ tùng OEM",
      "Case Bolt Torque": "Lực siết bu-lông hộp lọc",
      "Case Stay Bolt Torque": "Lực siết bu-lông giá hộp lọc",
      "Resonator Chamber Torque": "Lực siết bầu cộng hưởng",
    },
    steps: [
      "Mở capo và tìm hộp lọc gió trên động cơ.",
      "Mở các kẹp (B) phía trên hộp lọc gió.",
      "Tháo bu-lông (A) giữ hộp lọc gió vào giá đỡ.",
      "Tách nửa trên hộp lọc gió (case B) khỏi nửa dưới (case A).",
      "Lấy lõi lọc gió ra khỏi hộp.",
      "Kiểm tra lõi lọc, thay nếu quá bẩn hoặc hư hỏng.",
      "Vệ sinh bên trong hai nửa hộp lọc gió.",
      "Lắp lõi lọc mới vào nửa dưới.",
      "Lắp lại nửa trên, cài kẹp sau khi đưa lẫy dưới vào đúng vị trí.",
      "Lắp lại các bu-lông giữ.",
    ],
  },
  "transmission-fluid": {
    title: "Thay dầu hộp số sàn",
    interval: "Mỗi 50.000 km hoặc 30 tháng",
    specs: {
      "Fluid Type": "Loại dầu",
      Capacity: "Dung tích",
      "Transmission Type": "Loại hộp số",
      "Transfer Gear Ratio": "Tỷ số truyền transfer",
      "Final Drive Ratio (2200cc)": "Tỷ số truyền cuối (2200cc)",
      "1st Gear Ratio": "Tỷ số số 1",
      "2nd Gear Ratio": "Tỷ số số 2",
      "3rd Gear Ratio": "Tỷ số số 3",
      "4th Gear Ratio": "Tỷ số số 4",
      "5th Gear Ratio": "Tỷ số số 5",
      "Reverse Gear Ratio": "Tỷ số số lùi",
      "Drain/Fill Plug Torque": "Lực siết ốc xả/châm",
      "* Note": "* Ghi chú",
    },
    steps: [
      "Nâng xe, kê chân kê an toàn và tháo tấm che gầm.",
      "Đặt khay hứng dưới hộp số.",
      "Vệ sinh khu vực quanh ốc xả và ốc châm.",
      "Tháo ốc châm trước để chắc chắn có thể mở được trước khi xả.",
      "Tháo ốc xả và để dầu chảy hết.",
      "Kiểm tra nam châm ốc xả xem có nhiều mạt kim loại không.",
      "Lắp ốc xả với long đền mới và siết đúng thông số.",
      "Châm dầu GL-5 qua lỗ châm hộp số.",
      "Châm tới khi dầu bắt đầu rỉ ra khỏi lỗ châm (tổng 3,5 L).",
      "Lắp ốc châm với long đền mới và siết đúng thông số.",
      "Hạ xe và chạy thử, kiểm tra các số vào mượt.",
    ],
  },
  clutch: {
    title: "Thay ly hợp",
    interval: "Khi cần, thường khoảng 100.000-150.000 km",
    specs: {
      "Clutch Disc O.D. x I.D. x Thickness": "Kích thước lá côn O.D. x I.D. x dày",
      "Clutch Disc Facing": "Vật liệu bề mặt lá côn",
      "Clutch Disc Spline O.D. (24 teeth)": "Đường kính ngoài then hoa lá côn (24 răng)",
      "Diaphragm Set Load (2200cc)": "Tải lò xo màng (2200cc)",
      "Release Bearing Type": "Loại bi tê",
      "Release Lever Ratio": "Tỷ số càng côn",
      "Clutch Pedal Full Stroke": "Hành trình toàn phần bàn đạp côn",
      "Release Lever Stroke": "Hành trình càng côn",
      "Release Lever Play (at center)": "Độ rơ càng côn tại tâm",
      "Disc Rivet Depth (standard)": "Độ sâu đinh tán lá côn chuẩn",
      "Disc Rivet Depth (wear limit)": "Độ sâu đinh tán giới hạn mòn",
      "Disc Runout Limit": "Giới hạn đảo lá côn",
      "Cover Bolt Torque": "Lực siết bu-lông mâm ép",
    },
    steps: [
      "Ngắt cọc âm ắc-quy.",
      "Tháo ống nạp khí và cụm hộp lọc gió.",
      "Tháo dây côn hoặc đường thủy lực côn.",
      "Đỡ động cơ bằng thiết bị nâng và dây cáp.",
      "Nâng xe, tháo bánh trước và tấm che gầm.",
      "Xả dầu hộp số.",
      "Tháo ống xả trước.",
      "Tháo trục các-đăng trên xe AWD.",
      "Ngắt toàn bộ giắc điện khỏi hộp số.",
      "Đỡ hộp số bằng kích, tháo bu-lông chân hộp số.",
      "Hạ và đưa hộp số ra cẩn thận.",
      "Đánh dấu vị trí mâm ép so với bánh đà.",
      "Nới bu-lông mâm ép dần theo hình sao, tháo mâm ép và lá côn.",
      "Kiểm tra mặt bánh đà xem có xước, cháy nhiệt hoặc đảo.",
      "Kiểm tra bi tê có ồn và quay mượt không, thay nếu mòn.",
      "Lắp lá côn mới bằng dụng cụ căn tâm, mặt then hoa hướng về hộp số.",
      "Lắp mâm ép mới, canh dấu và siết bu-lông dần tới 15,7 Nm.",
      "Bôi một lượng mỡ nhỏ lên then hoa trục sơ cấp.",
      "Lắp bi tê vào càng côn.",
      "Lắp lại hộp số và siết bu-lông gá đúng thông số.",
      "Lắp lại các chi tiết theo thứ tự ngược khi tháo.",
      "Châm dầu GL-5 cho hộp số (3,5 L).",
      "Chỉnh độ rơ bàn đạp côn, xả gió hệ thống thủy lực nếu có.",
    ],
  },
  "differential-fluid": {
    title: "Thay dầu vi sai",
    interval: "Mỗi 50.000 km hoặc 30 tháng",
    specs: {
      "Front Diff Type": "Loại vi sai trước",
      "Front Diff Gear Type": "Loại bánh răng vi sai trước",
      "Front Final Ratio (2200cc)": "Tỷ số truyền cuối phía trước (2200cc)",
      "Front Diff Fluid": "Dầu vi sai trước",
      "Rear Diff Type": "Loại vi sai sau",
      "Rear Final Ratio (2200cc)": "Tỷ số truyền cuối phía sau (2200cc)",
      "Rear Diff Fluid Type": "Loại dầu vi sai sau",
      "Rear Diff Capacity": "Dung tích vi sai sau",
      "Rear Diff Bevel Gear Backlash": "Độ rơ bánh răng côn vi sai sau",
      "Center Diff Type": "Loại vi sai giữa",
      "Drain/Fill Plug Torque": "Lực siết ốc xả/châm",
      "* Note": "* Ghi chú",
    },
    steps: [
      "Nâng xe và kê chắc chắn bằng chân kê.",
      "Đặt khay hứng dưới vi sai sau.",
      "Vệ sinh khu vực quanh ốc xả và ốc châm trên vỏ vi sai sau.",
      "Tháo ốc châm trước bằng lục giác 17 mm để chắc chắn mở được.",
      "Tháo ốc xả và xả hết dầu cũ.",
      "Kiểm tra nam châm ốc xả xem có quá nhiều mạt kim loại không.",
      "Vệ sinh và lắp lại ốc xả với long đền ép mới.",
      "Châm dầu GL-5 75W-90 vào vi sai sau qua lỗ châm.",
      "Châm tới khi dầu rỉ ra khỏi lỗ châm, khoảng 0,8 L.",
      "Lắp ốc châm với long đền ép mới.",
      "Lưu ý: vi sai trước dùng chung dầu với hộp số sàn.",
      "Muốn bảo dưỡng vi sai trước, làm theo quy trình thay dầu hộp số.",
      "Hạ xe và chạy thử, nghe xem có tiếng hú hoặc ồn bất thường không.",
    ],
  },
};

export function localizeMaintenanceCard(card: MaintenanceCard, locale: Locale): MaintenanceCard {
  if (locale === "en") return card;
  const translated = MAINTENANCE_VI[card.id];
  if (!translated) {
    return {
      ...card,
      title: localizeTechnicalName(card.title, locale),
      difficulty: localizeDifficulty(card.difficulty, locale),
      interval: card.interval,
      specs: card.specs.map((spec) => ({
        ...spec,
        label: localizeTechnicalName(spec.label, locale),
      })),
    };
  }

  return {
    ...card,
    title: translated.title,
    difficulty: localizeDifficulty(card.difficulty, locale),
    interval: translated.interval,
    specs: card.specs.map((spec) => ({
      label: translated.specs[spec.label] ?? localizeTechnicalName(spec.label, locale),
      value: localizeSpecValue(spec.value, locale),
    })),
    steps: translated.steps.length === card.steps.length ? translated.steps : card.steps,
  };
}

export function localizeSpecValue(value: string, locale: Locale) {
  if (locale === "en") return value;
  return value
    .replace(/\bpreferred\b/gi, "ưu tiên")
    .replace(/\bor\b/gi, "hoặc")
    .replace(/\bFull-flow\b/gi, "lọc toàn dòng")
    .replace(/\bwith backing\b/gi, "kèm lưng")
    .replace(/\bnew\b/gi, "mới")
    .replace(/\bfront\b/gi, "trước")
    .replace(/\brear\b/gi, "sau")
    .replace(/\bshared with transmission\b/gi, "dùng chung với hộp số")
    .replace(/\bgear oil\b/gi, "dầu hộp số/vi sai")
    .replace(/\bcommunity-standard values\b/gi, "giá trị tham khảo cộng đồng");
}
