"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

export type HotspotId = "kiln-arch" | "kiln-fire" | "boat-dock" | "clay-shed";

export type HometownHotspotData = {
  id: HotspotId;
  label: string;
  tag: string;
  title: string;
  description: string;
  position: [number, number, number];
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
};

export const HOMETOWN_HOTSPOTS: HometownHotspotData[] = [
  {
    id: "kiln-arch",
    label: "Kiến trúc Lò Úp",
    tag: "Di sản hơn 100 năm",
    title: "Vương Quốc Lò Gạch Mang Thít",
    description:
      "Hình dáng tựa như những chiếc chuông úp khổng lồ cao từ 9 - 12m, xếp bằng hàng trăm ngàn viên gạch đỏ thô. Cầu thang xoắn ốc uốn lượn bên ngoài thân lò giúp nghệ nhân trèo lên kiểm tra mái và điều chỉnh khói lửa.",
    position: [-1.5, 5.8, 1.2],
    cameraPos: [-1.2, 5.2, 8.2],
    cameraTarget: [-1.5, 4.5, 1.2],
  },
  {
    id: "kiln-fire",
    label: "Lửa Trấu Truyền Thống",
    tag: "Bí quyết nung",
    title: "Ngọn Lửa Nung Cháy Bằng Trấu",
    description:
      "Người Mang Thít dùng vỏ trấu (phế phẩm nông nghiệp dồi dào của vựa lúa miền Tây) để nung lò liên tục suốt 20 - 30 ngày đêm. Nhiệt độ âm ỉ giữ cho gạch gốm đỏ au, đanh chắc và bền bỉ qua thời gian.",
    position: [-1.5, 1.5, 4.8],
    cameraPos: [-1.5, 1.6, 7.0],
    cameraTarget: [-1.5, 0.9, 4.6],
  },
  {
    id: "boat-dock",
    label: "Ghe Gốm Bến Sông",
    tag: "Thương hồ sông nước",
    title: "Bến Sông Kênh Thầy Cai & Cổ Chiên",
    description:
      "Tàu ghe tam bản tấp nập cập bến lò gạch để bốc dỡ đất sét và chở gốm, gạch thành phẩm tỏa đi khắp các tỉnh miền Tây, Sài Gòn và xuất khẩu quốc tế sang châu Âu, Nhật Bản.",
    position: [3.2, 1.5, 10.5],
    cameraPos: [4.6, 2.2, 14.8],
    cameraTarget: [2.8, 0.6, 9.8],
  },
  {
    id: "clay-shed",
    label: "Đất Sét Đỏ & Gạch Mộc",
    tag: "Chất liệu phù sa",
    title: "Mỏ Đất Sét Đỏ Đặc Sản",
    description:
      "Trầm tích phù sa màu mỡ hàng ngàn năm của dòng Cổ Chiên ban tặng cho Vĩnh Long tầng đất sét dẻo mịn tuyệt vời, nung lên cho màu đỏ cam tự nhiên không cần bất kỳ chất nhuộm màu nào.",
    position: [-5.8, 2.2, 2.8],
    cameraPos: [-5.5, 3.2, 7.8],
    cameraTarget: [-5.8, 1.8, 2.8],
  },
];

type Props = {
  activeId: HotspotId | null;
  onSelect: (hotspot: HometownHotspotData) => void;
  visible?: boolean;
};

export function HometownHotspots({ activeId, onSelect, visible = true }: Props) {
  if (!visible) return null;

  return (
    <group>
      {HOMETOWN_HOTSPOTS.map((spot) => (
        <HotspotMarker
          key={spot.id}
          data={spot}
          isActive={activeId === spot.id}
          onSelect={() => onSelect(spot)}
        />
      ))}
    </group>
  );
}

function HotspotMarker({
  data,
  isActive,
  onSelect,
}: {
  data: HometownHotspotData;
  isActive: boolean;
  onSelect: () => void;
}) {
  const markerRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!markerRef.current) return;
    const t = state.clock.getElapsedTime();
    // Subtle hover float
    markerRef.current.position.y = data.position[1] + Math.sin(t * 2.2) * 0.12;
  });

  return (
    <group ref={markerRef} position={data.position}>
      {/* 3D Visual Glowing Beacon Sphere */}
      <mesh castShadow={false}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial
          color={isActive ? "#fbbf24" : "#ff5722"}
          emissive={isActive ? "#f59e0b" : "#ea580c"}
          emissiveIntensity={1.8}
        />
      </mesh>

      {/* Pulse Beacon Outer Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.26, 0.38, 24]} />
        <meshBasicMaterial
          color={isActive ? "#fbbf24" : "#ffedd5"}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* HTML Interactive Tag */}
      <Html
        center
        distanceFactor={18}
        position={[0, 0.45, 0]}
        style={{ pointerEvents: "auto", userSelect: "none" }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={`group flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold shadow-lg backdrop-blur-md transition-all duration-200 cursor-pointer ${
            isActive
              ? "bg-amber-500 text-neutral-950 ring-2 ring-amber-300 scale-105"
              : "bg-black/75 text-amber-200 border border-amber-500/40 hover:bg-amber-600/90 hover:text-white hover:scale-105"
          }`}
        >
          <span className="size-1.5 rounded-full bg-amber-300 animate-ping" />
          <span>{data.label}</span>
        </button>
      </Html>
    </group>
  );
}
