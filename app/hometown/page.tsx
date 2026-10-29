"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Volume2,
  VolumeX,
  Compass,
  Sparkles,
  Info,
  ChevronRight,
  X,
  ArrowLeft,
  Camera,
  MapPin,
} from "lucide-react";
import { HometownScene } from "@/app/components/three/hometown/hometown-scene";
import { type HometownHotspotData } from "@/app/components/three/hometown/hometown-hotspots";
import { VIEW_PRESETS, type ViewPreset } from "@/app/components/three/hometown/hometown-camera-rig";
import { hometownAudio } from "@/app/components/three/hometown/hometown-ambient-audio";

type SpecialtyItem = {
  id: string;
  name: string;
  origin: string;
  badge: string;
  desc: string;
  details: string;
  icon: string;
};

const VINH_LONG_SPECIALTIES: SpecialtyItem[] = [
  {
    id: "gom-mang-thit",
    name: "Gốm Đỏ Mang Thít",
    origin: "Huyện Mang Thít, Vĩnh Long",
    badge: "Di sản độc bản",
    icon: "🏺",
    desc: "Được mệnh danh là 'Vương quốc Đỏ' với hàng ngàn lò gạch úp trải dài hơn 30km dọc sông Cổ Chiên và kênh Thầy Cai.",
    details:
      "Tận dụng đất sét đỏ giàu phù sa và nguồn trấu dồi dào của miền Tây, người thợ gốm nung lửa ròng rã cả tháng trời để tạo nên những sản phẩm gốm đỏ nung không men độc đáo, xuất khẩu sang nhiều nước châu Âu và châu Á.",
  },
  {
    id: "buoi-nam-roi",
    name: "Bưởi Năm Roi Bình Minh",
    origin: "Thị xã Bình Minh, Vĩnh Long",
    badge: "Chỉ dẫn địa lý Quốc gia",
    icon: "🍊",
    desc: "Trái bưởi hình quả lê, tép bưởi mọng nước màu vàng óng, róc múi, vị ngọt thanh mát và hầu như không có hạt.",
    details:
      "Phù sa bồi đắp từ hai con sông Tiền và sông Hậu đem lại chất lượng hảo hạng cho bưởi Năm Roi Bình Minh, trở thành niềm tự hào trong mâm ngũ quả ngày Tết và nông sản xuất khẩu chủ lực của miền Tây.",
  },
  {
    id: "cam-sanh-tam-binh",
    name: "Cam Sành Tam Bình",
    origin: "Huyện Tam Bình, Vĩnh Long",
    badge: "Đặc sản miệt vườn",
    icon: "🍊",
    desc: "Vỏ sần sùi dày, mọng nước, tép cam vàng đậm đà và có vị ngọt thanh pha lẫn chút chua nhẹ đặc trưng khó quên.",
    details:
      "Vùng đất Tam Bình với hệ thống kênh rạch chằng chịt và đất sét pha cát là điều kiện hoàn hảo giúp cây cam sành sinh trưởng, cho trái to tròn, dồi dào vitamin C và hương thơm tự nhiên.",
  },
  {
    id: "khoai-lang-binh-tan",
    name: "Khoai Lang Tím Bình Tân",
    origin: "Huyện Bình Tân, Vĩnh Long",
    badge: "Thủ phủ khoai miền Tây",
    icon: "🍠",
    desc: "Vựa khoai lang lớn nhất đồng bằng sông Cửu Long, nức tiếng với giống khoai lang tím Nhật ruột tím thẫm bùi béo.",
    details:
      "Đất phù sa bãi bồi ven sông Hậu giúp củ khoai to, nhiều tinh bột, vị ngọt bùi tự nhiên. Khoai lang Bình Tân được chế biến thành nhiều món đặc sản hấp dẫn và xuất khẩu quy mô lớn.",
  },
  {
    id: "banh-trang-cu-lao-may",
    name: "Bánh Tráng Nem Cù Lao Mây",
    origin: "Xã Lục Sĩ Thành, Trà Ôn",
    badge: "Làng nghề trăm năm",
    icon: "🫓",
    desc: "Làng nghề truyền thống hơn 100 năm tuổi trên cù lao sông Hậu, làm ra loại bánh tráng nem dẻo dai tự nhiên.",
    details:
      "Bánh được làm từ gạo nếp thơm ngon, phơi dưới nắng gió tự nhiên của miền sông nước. Bánh mềm dẻo không cần nhúng nước, dùng để cuốn chả giò, gỏi cuốn Nam Bộ giữ trọn độ giòn thơm.",
  },
];

export default function HometownPage() {
  const [activePreset, setActivePreset] = useState<ViewPreset>("overview");
  const [cameraPos, setCameraPos] = useState<[number, number, number]>(VIEW_PRESETS.overview.pos);
  const [cameraTarget, setCameraTarget] = useState<[number, number, number]>(
    VIEW_PRESETS.overview.target,
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<HometownHotspotData | null>(null);
  const [showSpecialties, setShowSpecialties] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyItem>(
    VINH_LONG_SPECIALTIES[0],
  );
  const [showPhotoRef, setShowPhotoRef] = useState(false);
  const [audioActive, setAudioActive] = useState(false);

  // Switch camera preset
  const handleSelectPreset = (key: ViewPreset) => {
    setActivePreset(key);
    setActiveHotspot(null);
    setCameraPos(VIEW_PRESETS[key].pos);
    setCameraTarget(VIEW_PRESETS[key].target);
    setIsTransitioning(true);
  };

  // Click on a 3D hotspot marker
  const handleSelectHotspot = (spot: HometownHotspotData) => {
    setActiveHotspot(spot);
    setCameraPos(spot.cameraPos);
    setCameraTarget(spot.cameraTarget);
    setIsTransitioning(true);
  };

  // Audio ambiance toggle
  const handleToggleAudio = async () => {
    const nextState = await hometownAudio.toggle();
    setAudioActive(nextState);
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#180a05] text-white">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0">
        <HometownScene
          desiredPos={cameraPos}
          desiredTarget={cameraTarget}
          isTransitioning={isTransitioning}
          activeHotspotId={activeHotspot?.id || null}
          onSelectHotspot={handleSelectHotspot}
          onTransitionEnd={() => setIsTransitioning(false)}
        />
      </div>

      {/* Top Floating Navigation Bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between p-4 sm:p-6">
        {/* Back Link & Title */}
        <div className="pointer-events-auto flex items-center gap-3">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-full border border-amber-600/30 bg-black/60 px-3.5 py-1.8 text-xs font-medium text-amber-200 shadow-xl backdrop-blur-xl transition-all duration-200 hover:border-amber-500/60 hover:bg-black/80 hover:text-white"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Về Portfolio</span>
          </Link>

          <div className="hidden md:flex items-center gap-2 rounded-full border border-amber-600/25 bg-black/55 px-3.5 py-1.8 text-xs text-amber-200/90 shadow-xl backdrop-blur-xl">
            <MapPin className="size-3.5 text-amber-400" />
            <span className="font-semibold text-white">Vĩnh Long</span>
            <span className="text-white/40">•</span>
            <span className="text-amber-300">Vương quốc Đỏ Mang Thít</span>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Sound Ambiance Toggle */}
          <button
            onClick={handleToggleAudio}
            title={
              audioActive
                ? "Tắt âm thanh sông nước & lửa lò"
                : "Bật âm thanh không gian (Web Audio)"
            }
            aria-pressed={audioActive}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-xl transition-all duration-200 cursor-pointer shadow-lg ${
              audioActive
                ? "border-amber-400/80 bg-amber-500/25 text-amber-200 shadow-[0_0_16px_rgba(245,158,11,0.35)]"
                : "border-white/10 bg-black/55 text-neutral-300 hover:border-amber-500/40 hover:text-white"
            }`}
          >
            {audioActive ? (
              <Volume2 className="size-3.5 text-amber-400 animate-pulse" />
            ) : (
              <VolumeX className="size-3.5" />
            )}
            <span className="hidden sm:inline">
              {audioActive ? "Tiếng sóng & lửa nung" : "Âm thanh không gian"}
            </span>
          </button>

          {/* Photo Reference Toggle */}
          <button
            onClick={() => setShowPhotoRef(true)}
            className="flex items-center gap-1.5 rounded-full border border-amber-600/30 bg-black/60 px-3 py-1.5 text-xs font-medium text-amber-200 shadow-xl backdrop-blur-xl transition-all duration-200 hover:border-amber-500/60 hover:bg-black/80 hover:text-white cursor-pointer"
          >
            <Camera className="size-3.5 text-amber-400" />
            <span className="hidden sm:inline">Ảnh di sản thực tế</span>
          </button>

          {/* Specialties Modal Toggle */}
          <button
            onClick={() => setShowSpecialties(true)}
            className="flex items-center gap-1.5 rounded-full border border-amber-500/60 bg-gradient-to-r from-amber-600/80 to-orange-600/80 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xl backdrop-blur-xl transition-all duration-200 hover:from-amber-500 hover:to-orange-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer"
          >
            <Sparkles className="size-3.5" />
            <span>Đặc sản Quê nhà</span>
          </button>
        </div>
      </div>

      {/* Camera Presets Selector (Floating Top-Center) */}
      <div className="pointer-events-none absolute inset-x-0 top-18 sm:top-20 z-20 flex justify-center px-4">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-amber-600/30 bg-black/65 p-1 shadow-2xl backdrop-blur-xl max-w-full overflow-x-auto no-scrollbar">
          {(Object.keys(VIEW_PRESETS) as ViewPreset[]).map((key) => {
            const preset = VIEW_PRESETS[key];
            const isActive = activePreset === key && !activeHotspot;
            return (
              <button
                key={key}
                onClick={() => handleSelectPreset(key)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                    : "text-amber-200/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Hotspot Detail Card (Bottom Left) */}
      {activeHotspot && (
        <div className="pointer-events-none absolute bottom-6 left-4 right-4 sm:right-auto sm:left-6 z-30 sm:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="pointer-events-auto rounded-2xl border border-amber-500/40 bg-black/85 p-4 sm:p-5 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300 border border-amber-500/30">
                  <Sparkles className="size-3" />
                  {activeHotspot.tag}
                </span>
                <h3 className="mt-2 text-base sm:text-lg font-bold text-white tracking-wide">
                  {activeHotspot.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveHotspot(null)}
                aria-label="Đóng chi tiết"
                className="rounded-full p-1 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="mt-2 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {activeHotspot.description}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-[11px] text-amber-300/70">
                Nhấp vào các điểm sáng khác hoặc kéo chuột xoay 360°
              </span>
              <button
                onClick={() => handleSelectPreset("overview")}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                Về toàn cảnh →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Center 3D Gesture Hint */}
      {!activeHotspot && (
        <div className="pointer-events-none absolute bottom-6 inset-x-0 z-20 flex justify-center px-4">
          <div className="flex items-center gap-2 rounded-full border border-amber-600/25 bg-black/55 px-3.5 py-1.5 text-[11px] text-amber-200/80 shadow-xl backdrop-blur-md">
            <Compass
              className="size-3.5 text-amber-400 animate-spin"
              style={{ animationDuration: "12s" }}
            />
            <span>Kéo chuột để xoay 360° • Cuộn để phóng to • Nhấp điểm sáng để xem chi tiết</span>
          </div>
        </div>
      )}

      {/* Specialties Modal / Drawer */}
      {showSpecialties && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-3xl rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[#241108] to-[#140803] p-5 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-amber-600/25">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30">
                  <Sparkles className="size-3.5" />
                  Đất Vĩnh Long - Địa linh nhân kiệt
                </span>
                <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Đặc Sản & Tinh Hoa Quê Hương Vĩnh Long
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1">
                  Khám phá những sản vật nông nghiệp và làng nghề trăm năm làm nên danh tiếng miền
                  sông nước Cửu Long.
                </p>
              </div>
              <button
                onClick={() => setShowSpecialties(false)}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                aria-label="Đóng cửa sổ"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Specialties List & Preview Grid */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column: List of items */}
              <div className="md:col-span-5 flex flex-col gap-2">
                {VINH_LONG_SPECIALTIES.map((item) => {
                  const isSel = selectedSpecialty.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedSpecialty(item)}
                      className={`flex items-center justify-between rounded-xl p-3 text-left transition-all duration-200 cursor-pointer ${
                        isSel
                          ? "bg-amber-600/30 border border-amber-400/50 text-white shadow-md"
                          : "bg-white/[0.03] border border-white/5 text-neutral-300 hover:bg-white/[0.07] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="text-xs font-semibold">{item.name}</div>
                          <div className="text-[11px] text-amber-300/70">{item.origin}</div>
                        </div>
                      </div>
                      <ChevronRight
                        className={`size-4 transition-transform ${
                          isSel ? "text-amber-400 translate-x-1" : "text-neutral-500"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Selected Specialty Deep Dive */}
              <div className="md:col-span-7 rounded-2xl border border-amber-600/30 bg-black/45 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{selectedSpecialty.icon}</span>
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
                      {selectedSpecialty.badge}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg sm:text-xl font-bold text-white">
                    {selectedSpecialty.name}
                  </h3>
                  <div className="text-xs text-amber-400 font-medium mt-0.5">
                    {selectedSpecialty.origin}
                  </div>

                  <p className="mt-3 text-xs sm:text-sm text-neutral-200 font-medium leading-relaxed">
                    {selectedSpecialty.desc}
                  </p>

                  <p className="mt-3 text-xs text-neutral-300/80 leading-relaxed border-t border-white/10 pt-3">
                    {selectedSpecialty.details}
                  </p>
                </div>

                <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] text-amber-200/90 flex items-start gap-2">
                  <Info className="size-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    Mỗi sản vật không chỉ là hương vị quê hương mà còn gắn bó sâu sắc với tuổi thơ
                    và tinh thần cần mẫn của con người miền Tây.
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex items-center justify-end border-t border-amber-600/25 pt-4">
              <button
                onClick={() => setShowSpecialties(false)}
                className="rounded-full bg-amber-600 px-5 py-2 text-xs font-semibold text-white shadow-lg transition-all hover:bg-amber-500 cursor-pointer"
              >
                Đã hiểu, quay lại lò gốm 3D
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Reference Modal */}
      {showPhotoRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl rounded-3xl border border-amber-500/40 bg-[#1e0d06] p-4 sm:p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-3 border-b border-amber-600/25">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Ảnh Di Sản Lò Gốm Mang Thít Thực Tế
                </h3>
                <p className="text-xs text-amber-300/80">
                  Nguồn cảm hứng thiết kế không gian 3D tại bờ kênh Thầy Cai, Vĩnh Long
                </p>
              </div>
              <button
                onClick={() => setShowPhotoRef(false)}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                aria-label="Đóng ảnh"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-amber-500/30 shadow-inner">
              <Image
                src="/hometown/mang-thit-kilns.png"
                alt="Lò gốm Mang Thít, Vĩnh Long"
                fill
                className="object-cover"
                priority
              />
            </div>

            <p className="mt-3 text-xs text-neutral-300 leading-relaxed">
              Các lò gạch có hình dáng parabol đặc trưng, xây dựng bằng gạch thô đỏ au. Qua hàng
              chục năm nung lửa, bề mặt lò xuất hiện các vệt muối phong hóa màu trắng bạc hòa cùng
              khói lam chiều bên dòng sông Cổ Chiên.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
