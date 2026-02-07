"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ReactNode } from "react";

interface ScrollAnimationProviderProps {
  children: ReactNode;
}

export default function ScrollAnimationProvider({
  children,
}: ScrollAnimationProviderProps) {
  useScrollAnimation();
  return <>{children}</>;
}
