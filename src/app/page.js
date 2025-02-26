"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // 서버에서는 렌더링하지 않음

  return (
    <>
      <Link href="/board/article" className="gradient_button">
        수상 / 특허 / 저작권 / 기술임치 / 인증 / 언론보도 (뉴스)
      </Link>
      <br />
      <Link href="/board/history" className="gradient_button">
        연혁
      </Link>
      <br />
      <Link href="/board/partner" className="gradient_button">
        협력사
      </Link>
    </>
  );
}
