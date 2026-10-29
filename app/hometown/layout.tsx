import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quê Hương Vĩnh Long • Vương Quốc Đỏ Mang Thít",
  description:
    "Trải nghiệm không gian 3D tương tác tái hiện Di sản Lò Gốm Mang Thít và tinh hoa đặc sản vùng đất Vĩnh Long bên dòng sông Cổ Chiên hiền hòa.",
  openGraph: {
    title: "Quê Hương Vĩnh Long • Lò Gốm Mang Thít 3D",
    description:
      "Khám phá kiến trúc Lò Úp độc bản trăm năm tuổi và văn hóa miệt vườn Vĩnh Long qua không gian 3D tương tác.",
    images: [
      {
        url: "/hometown/mang-thit-kilns.png",
        width: 1200,
        height: 630,
        alt: "Lò gốm Mang Thít Vĩnh Long",
      },
    ],
  },
};

export default function HometownLayout({ children }: { children: React.ReactNode }) {
  return children;
}
