"use client";

import { useEffect } from "react";
import { marcarLeido } from "@/lib/actions/posts";

export default function MarcarLeido({ postId }: { postId: string }) {
  useEffect(() => {
    marcarLeido(postId);
  }, [postId]);

  return null;
}
