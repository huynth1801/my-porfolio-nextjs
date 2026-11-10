export type SkillBranchId = "all" | "frontend" | "creative-3d" | "ui-motion" | "tooling-state";

export interface SkillBranch {
  id: SkillBranchId;
  label: string;
  badge: string;
  color: string;
  icon?: string;
  description: string;
}

export interface ProductionProof {
  project: string;
  role: string;
  highlight: string;
  url?: string;
}

export interface SkillNode {
  id: string;
  name: string;
  shortName: string;
  branch: Exclude<SkillBranchId, "all">;
  tier: 1 | 2 | 3; // 1: Foundation, 2: Core/Advanced, 3: Specialist/Mastery
  level: number; // 0 - 100
  rank: "Master" | "Expert" | "Specialist";
  experience: string;
  tagline: string;
  color: "cyan" | "violet" | "emerald" | "amber";
  dependencies: string[]; // Parent skill IDs that unlock or feed this node
  productionProof: ProductionProof[];
  keyStrengths: string[];
  codeSnippet: {
    title: string;
    language: string;
    code: string;
  };
}

export const SKILL_BRANCHES: SkillBranch[] = [
  {
    id: "all",
    label: "Tất cả cây kỹ năng",
    badge: "Full Matrix",
    color: "#38bdf8",
    description: "Toàn bộ hệ thống kỹ năng công nghệ cốt lõi & chuyên sâu",
  },
  {
    id: "frontend",
    label: "Frontend & Architecture",
    badge: "Core Stack",
    color: "#06b6d4",
    description: "Next.js 16, React 19, TypeScript và kiến trúc Web App hiệu năng cao",
  },
  {
    id: "creative-3d",
    label: "3D WebGL & Games",
    badge: "Creative Tech",
    color: "#a855f7",
    description: "Three.js diorama, R3F, GLSL shaders và Cocos Creator game engine",
  },
  {
    id: "ui-motion",
    label: "UI & Motion Systems",
    badge: "Craft & Feel",
    color: "#ec4899",
    description: "Tailwind CSS, GSAP ScrollTrigger, Micro-interactions & Design Systems",
  },
  {
    id: "tooling-state",
    label: "State & Performance",
    badge: "Engineering",
    color: "#10b981",
    description: "Zustand, Redux Toolkit, Dev tools, Git workflow & Web Vitals optimization",
  },
];

export const SKILL_TREE_NODES: SkillNode[] = [
  // --- FRONTEND BRANCH ---
  {
    id: "typescript",
    name: "TypeScript",
    shortName: "TS",
    branch: "frontend",
    tier: 1,
    level: 98,
    rank: "Master",
    experience: "4+ năm thực chiến",
    tagline: "Strict Typing, Generic Patterns & Zero Runtime Regressions",
    color: "cyan",
    dependencies: [],
    productionProof: [
      {
        project: "MyShop (thuyshop.store)",
        role: "Fullstack Lead",
        highlight: "Strict type models cho toàn bộ giỏ hàng, thanh toán và API contracts",
        url: "https://thuyshop.store",
      },
      {
        project: "3D Portfolio Diorama",
        role: "Creative Engineer",
        highlight: "Typed math matrices, procedural store updates và animation mixers",
      },
    ],
    keyStrengths: [
      "Xây dựng Generics nâng cao, Conditional Types và Template Literal Types",
      "Type-safe API response parsing với validation Zod",
      "Kiến trúc modular type definition tái sử dụng cao cho enterprise",
    ],
    codeSnippet: {
      title: "Type-Safe State Machine & Action Handler",
      language: "typescript",
      code: `type Action<T extends string, P = void> = P extends void
  ? { type: T }
  : { type: T; payload: P };

type InventoryAction =
  | Action<"SKILL_UNLOCK", { skillId: string; xp: number }>
  | Action<"TELEPORT_WAYPOINT", { waypoint: string }>;

function handleAction(action: InventoryAction) {
  switch (action.type) {
    case "SKILL_UNLOCK":
      return syncProgress(action.payload.skillId);
  }
}`,
    },
  },
  {
    id: "react",
    name: "React 19",
    shortName: "React",
    branch: "frontend",
    tier: 2,
    level: 96,
    rank: "Master",
    experience: "4+ năm thực chiến",
    tagline: "Concurrent Mode, Custom Hooks & Reactive State Primitives",
    color: "cyan",
    dependencies: ["typescript"],
    productionProof: [
      {
        project: "Sunfix Service App",
        role: "Frontend Engineer",
        highlight: "Component lifecycle optimization, virtualized list, responsive booking",
        url: "https://sunfix.netlify.app",
      },
      {
        project: "Likelion & TGM Projects",
        role: "Frontend Developer",
        highlight: "Modular design components, micro-frontend integration",
      },
    ],
    keyStrengths: [
      "Thành thạo React 19 Hooks (`useActionState`, `useOptimistic`, transitions)",
      "Kiến trúc Custom Hooks tách biệt Business Logic khỏi UI rendering",
      "Khắc phục triệt để re-render thừa bằng `memo`, `useCallback`, `useSyncExternalStore`",
    ],
    codeSnippet: {
      title: "External Store Sync with 0 Re-renders",
      language: "tsx",
      code: `export function useSubscribedState<T>(store: Store<T>): T {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
}`,
    },
  },
  {
    id: "nextjs",
    name: "Next.js 16 (App Router)",
    shortName: "Next.js",
    branch: "frontend",
    tier: 3,
    level: 95,
    rank: "Master",
    experience: "3+ năm thực chiến",
    tagline: "Server Components, ISR/SSR, Turbopack & Route Handlers",
    color: "cyan",
    dependencies: ["react"],
    productionProof: [
      {
        project: "MyShop Store",
        role: "Fullstack E-Commerce",
        highlight: "App Router, SSR SEO metadata, caching revalidation và dynamic routes",
        url: "https://thuyshop.store",
      },
      {
        project: "3D Portfolio",
        role: "Interactive Portfolio",
        highlight: "Next.js 16 + Turbopack build, static generation và zero-CLS layout",
      },
    ],
    keyStrengths: [
      "Tối ưu ranh giới Server Components và Client Components",
      "Cấu hình SEO Dynamic OpenGraph Image & Metadata API chuẩn",
      "Tối ưu tốc độ tải trang Core Web Vitals với Image & Font sub-system",
    ],
    codeSnippet: {
      title: "Streaming Server Component with Suspense",
      language: "tsx",
      code: `export default async function ProductCatalog({ category }: Props) {
  const items = await fetchInventory(category, { next: { revalidate: 60 } });
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <ProductGrid items={items} />
    </Suspense>
  );
}`,
    },
  },
  {
    id: "angular",
    name: "Angular & RxJS",
    shortName: "Angular",
    branch: "frontend",
    tier: 2,
    level: 88,
    rank: "Expert",
    experience: "1+ năm dự án Enterprise",
    tagline: "Reactive Extensions, Dependency Injection & Enterprise Modules",
    color: "cyan",
    dependencies: ["typescript"],
    productionProof: [
      {
        project: "CAS Software AG",
        role: "Software Developer",
        highlight: "Phát triển module quản lý khách hàng doanh nghiệp, RxJS pipelines",
      },
    ],
    keyStrengths: [
      "RxJS Observable streams, operators (`switchMap`, `debounceTime`, `combineLatest`)",
      "Angular Services, Dependency Injection & ChangeDetectionStrategy.OnPush",
      "Material UI và Modular Enterprise Routing",
    ],
    codeSnippet: {
      title: "RxJS Search Auto-complete Stream",
      language: "typescript",
      code: `readonly searchResults$ = this.searchQuery$.pipe(
  debounceTime(250),
  distinctUntilChanged(),
  switchMap(q => this.api.search(q).pipe(catchError(() => of([]))))
);`,
    },
  },

  // --- CREATIVE 3D & GAMES BRANCH ---
  {
    id: "webgl",
    name: "WebGL & 3D Math",
    shortName: "WebGL",
    branch: "creative-3d",
    tier: 1,
    level: 89,
    rank: "Expert",
    experience: "3+ năm nghiên cứu & ứng dụng",
    tagline: "Vectors, Quaternions, Projection Matrices & Raycasting",
    color: "violet",
    dependencies: [],
    productionProof: [
      {
        project: "Interactive 3D Diorama Island",
        role: "WebGL Lead",
        highlight: "Hệ thống camera raycasting, ground clamping và world matrix transforms",
      },
    ],
    keyStrengths: [
      "Toán không gian 3D: Vector3 dot/cross product, Lerp/Slerp, Euler vs Quaternion",
      "Raycasting chính xác cho click hotspots và character collision",
      "Tối ưu memory buffer và draw calls",
    ],
    codeSnippet: {
      title: "Smooth Damped Character Heading",
      language: "typescript",
      code: `function shortestAngle(from: number, to: number) {
  const diff = (to - from) % (Math.PI * 2);
  return from + (((diff + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
}`,
    },
  },
  {
    id: "threejs",
    name: "Three.js & R3F",
    shortName: "Three.js",
    branch: "creative-3d",
    tier: 2,
    level: 94,
    rank: "Master",
    experience: "3+ năm thực chiến",
    tagline: "React Three Fiber, Procedural Dioramas & Dynamic Lighting",
    color: "violet",
    dependencies: ["webgl", "react"],
    productionProof: [
      {
        project: "Portfolio 3D Island",
        role: "Creative Developer",
        highlight: "Hệ sinh thái diorama 6 quận đảo, chu kỳ ngày/đêm, particle system",
      },
      {
        project: "Flappy.DEV 3D Arcade",
        role: "Game & Canvas Tex",
        highlight: "Render game 2D trực tiếp lên bề mặt vật liệu CanvasTexture 3D",
      },
    ],
    keyStrengths: [
      "Quản lý scene graph và Three.js loop hiệu quả (`useFrame` dt clamping)",
      "Disposal an toàn: giải phóng geometry, material, texture chống memory leak",
      "Ánh sáng đa chế độ (Day, Sunset, Starlight) với shadow map tối ưu",
    ],
    codeSnippet: {
      title: "R3F 60FPS Frameloop with Frame-Damping",
      language: "tsx",
      code: `useFrame((state, delta) => {
  const dt = Math.min(delta, 0.05); // Frame drop protection
  meshRef.current.rotation.y += speed * dt;
  meshRef.current.position.y = baseHeight + Math.sin(state.clock.elapsedTime * 2) * 0.08;
});`,
    },
  },
  {
    id: "shaders",
    name: "GLSL Shaders & FX",
    shortName: "GLSL",
    branch: "creative-3d",
    tier: 3,
    level: 86,
    rank: "Specialist",
    experience: "2+ năm ứng dụng",
    tagline: "Vertex Displacement, Procedural Waves & Neon Bloom",
    color: "violet",
    dependencies: ["threejs"],
    productionProof: [
      {
        project: "Mekong River Water & Waves",
        role: "Shader Dev",
        highlight: "Sóng nước đa tần số, hiệu ứng phản chiếu ánh sáng mặt trời",
      },
    ],
    keyStrengths: [
      "Vertex Shader tính toán sóng nước, cờ bay và gió ngọn cây",
      "Fragment Shader xử lý glowing neon rims, scanlines và fading masks",
      "Uniform animations đồng bộ hóa mượt mà với thời gian thực",
    ],
    codeSnippet: {
      title: "Procedural Sine Ripple Vertex Shader",
      language: "glsl",
      code: `uniform float uTime;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 pos = position;
  pos.y += sin(pos.x * 3.0 + uTime * 2.0) * 0.08;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`,
    },
  },
  {
    id: "cocos",
    name: "Cocos Creator",
    shortName: "Cocos",
    branch: "creative-3d",
    tier: 2,
    level: 90,
    rank: "Expert",
    experience: "2+ năm phát triển game",
    tagline: "2D/3D Game Physics, Component Architecture & Asset Pipeline",
    color: "violet",
    dependencies: ["webgl", "typescript"],
    productionProof: [
      {
        project: "Onechain Game Studio",
        role: "Game Developer",
        highlight: "Sản xuất game đa nền tảng, cơ chế vật lý, particle effect & UI",
      },
      {
        project: "Casual Game Prototypes",
        role: "Indie Creator",
        highlight: "State machine cho gameplay, sprite atlases và audio manager",
      },
    ],
    keyStrengths: [
      "Xây dựng Game State Machine, Game Loops và Entity Component Systems",
      "Tối ưu Draw Calls bằng Sprite Sheet / Atlas packing",
      "Tích hợp Web Audio và âm thanh tương tác theo game events",
    ],
    codeSnippet: {
      title: "State Machine Player Controller",
      language: "typescript",
      code: `onCollisionEnter(other: Collider2D) {
  if (other.tag === Tag.OBSTACLE) {
    this.audio.playSfx(SfxType.HIT);
    this.stateMachine.transitionTo(PlayerState.GAMEOVER);
  }
}`,
    },
  },

  // --- UI & MOTION SYSTEMS BRANCH ---
  {
    id: "css-modern",
    name: "Modern CSS & Responsive",
    shortName: "CSS",
    branch: "ui-motion",
    tier: 1,
    level: 96,
    rank: "Master",
    experience: "4+ năm thực chiến",
    tagline: "CSS Grid, Flexbox, Container Queries & Layout Ergonomics",
    color: "emerald",
    dependencies: [],
    productionProof: [
      {
        project: "Responsive Web Ecosystem",
        role: "Frontend Specialist",
        highlight: "Đảm bảo hiển thị hoàn hảo trên Mobile, Tablet, Ultra-wide 4K",
      },
    ],
    keyStrengths: [
      "Layout linh hoạt kết hợp CSS Grid & Flexbox không bị vỡ layout",
      "CSS Custom Properties (Variables) cho dynamic theming",
      "Accessibility (a11y), contrast ratios và focus indicators",
    ],
    codeSnippet: {
      title: "Fluid Clamp Typography & Glassmorphism",
      language: "css",
      code: `.glass-card {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: clamp(1rem, 0.8rem + 1vw, 1.35rem);
}`,
    },
  },
  {
    id: "tailwind",
    name: "Tailwind CSS & Design Tokens",
    shortName: "Tailwind",
    branch: "ui-motion",
    tier: 2,
    level: 98,
    rank: "Master",
    experience: "4+ năm thực chiến",
    tagline: "Utility-First, JIT Compilation & Scalable Theme Tokens",
    color: "emerald",
    dependencies: ["css-modern"],
    productionProof: [
      {
        project: "All Major Portfolio Projects",
        role: "UI Engineer",
        highlight: "Toàn bộ giao diện MyShop, Sunfix, Portfolio dùng Tailwind v4",
      },
    ],
    keyStrengths: [
      "Xây dựng Design System đồng nhất: spacing, typography, palette màu sắc",
      "Tối ưu bundle với JIT: zero unused CSS, compile siêu tốc",
      "Tùy biến glassmorphism, glow effects và custom animations",
    ],
    codeSnippet: {
      title: "Semantic Composite Class Utilities",
      language: "tsx",
      code: `const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all",
  {
    variants: {
      intent: {
        primary: "bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/25",
        gold: "bg-amber-500/15 text-amber-300 border border-amber-400/30",
      },
    },
  }
);`,
    },
  },
  {
    id: "gsap-motion",
    name: "GSAP & Motion Animation",
    shortName: "GSAP",
    branch: "ui-motion",
    tier: 3,
    level: 95,
    rank: "Master",
    experience: "3+ năm thực chiến",
    tagline: "ScrollTrigger Flight Paths, Spring Physics & Timelines",
    color: "emerald",
    dependencies: ["css-modern"],
    productionProof: [
      {
        project: "3D Camera Drone Flight",
        role: "Animation Lead",
        highlight: "Lenis smooth scroll kết hợp GSAP ticker điều khiển camera 3D",
      },
      {
        project: "The Developer Odyssey Story",
        role: "Choreographer",
        highlight: "Timeline GSAP điều khiển hành động character, jumps & effects",
      },
    ],
    keyStrengths: [
      "GSAP ScrollTrigger và Lenis Smooth Scroll mượt mà 60-120fps",
      "Motion (Framer Motion) Spring physics cho layout animations và modals",
      "Phối hợp nhịp nhàng giữa timeline UI 2D và transform Three.js 3D",
    ],
    codeSnippet: {
      title: "GSAP ScrollTrigger Drone Path Synchronization",
      language: "typescript",
      code: `ScrollTrigger.create({
  trigger: "#skills",
  start: "top center",
  end: "bottom center",
  onEnter: () => gsap.to(droneCamera, { radius: 7.8, yaw: -1.95, duration: 1.2, ease: "power2.out" }),
});`,
    },
  },

  // --- TOOLING & STATE BRANCH ---
  {
    id: "state-mgmt",
    name: "State Management (Zustand & Redux)",
    shortName: "State",
    branch: "tooling-state",
    tier: 2,
    level: 95,
    rank: "Master",
    experience: "4+ năm thực chiến",
    tagline: "External Stores, Immutable Reducers & LocalStorage Hydration",
    color: "amber",
    dependencies: ["react"],
    productionProof: [
      {
        project: "Interactive Diorama Subsystems",
        role: "Architect",
        highlight: "Story store, Proximity store, Terminal store, Day Phase store",
      },
      {
        project: "MyShop Cart & Checkout",
        role: "Fullstack",
        highlight: "Cart persistence, optimistic updates, checkout session state",
      },
    ],
    keyStrengths: [
      "Tách biệt global state thuần túy khỏi React component tree để tránh re-renders",
      "Hydration-safe state restoration từ `localStorage` chống mismatch",
      "Event-driven pub/sub store patterns snappier và nhẹ hơn bulky libraries",
    ],
    codeSnippet: {
      title: "Lightweight Pub/Sub Reactive Micro-Store",
      language: "typescript",
      code: `export function createMicroStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (next: Partial<T>) => {
      state = { ...state, ...next };
      listeners.forEach(fn => fn());
    },
    subscribe: (fn: () => void) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}`,
    },
  },
  {
    id: "git-devops",
    name: "Git, CI/CD & Tooling",
    shortName: "Git",
    branch: "tooling-state",
    tier: 1,
    level: 94,
    rank: "Master",
    experience: "4+ năm thực chiến",
    tagline: "Husky Pre-commit, ESLint Flat Config, Turbopack & Vercel",
    color: "amber",
    dependencies: [],
    productionProof: [
      {
        project: "Production Delivery Pipeline",
        role: "Maintainer",
        highlight: "Lint-staged, Husky hooks, zero-error production build pipelines",
      },
    ],
    keyStrengths: [
      "Quản lý Git branch chiến lược: feature isolation, semantic commits, PR reviews",
      "Tự động hóa pre-commit linting và formatting với Husky & lint-staged",
      "Tối ưu build time trên Turbopack và Next.js standalone output",
    ],
    codeSnippet: {
      title: "Automated Lint-Staged & Commit Quality Gate",
      language: "json",
      code: `{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss,json,md}": ["prettier --write"]
  }
}`,
    },
  },
  {
    id: "perf-vitals",
    name: "Web Performance & Core Vitals",
    shortName: "Perf",
    branch: "tooling-state",
    tier: 3,
    level: 93,
    rank: "Expert",
    experience: "3+ năm tối ưu",
    tagline: "Lighthouse 95+, 60fps Frame Budget & Memory Leak Disposal",
    color: "amber",
    dependencies: ["state-mgmt", "nextjs"],
    productionProof: [
      {
        project: "3D Portfolio Island",
        role: "Perf Specialist",
        highlight: "Giữ vững 60fps kể cả khi render 3D Island cùng Lenis smooth scroll",
      },
      {
        project: "MyShop Web Store",
        role: "Perf Specialist",
        highlight: "Score 95+ Lighthouse mobile & desktop, LCP < 1.2s",
      },
    ],
    keyStrengths: [
      "Đảm bảo frame budget 16.6ms cho cả Three.js render loop lẫn DOM layout",
      "Tối ưu LCP (Largest Contentful Paint) và CLS (Cumulative Layout Shift) = 0",
      "Giám sát bundle size, code-splitting động và lazy evaluation",
    ],
    codeSnippet: {
      title: "FPS / Performance Budget Clamp",
      language: "typescript",
      code: `const dt = Math.min(rawDelta, 0.05);
if (performance.now() - lastFrame < 10) return; // Cap at 60-120fps max
renderScene(dt);`,
    },
  },
];
