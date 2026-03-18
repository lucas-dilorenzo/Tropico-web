"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function SociosTh({ campo, label }: { campo: string; label: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sortBy = searchParams.get("sortBy");
  const sortDir = searchParams.get("sortDir") ?? "asc";
  const isActive = sortBy === campo;
  const nextDir = isActive && sortDir === "asc" ? "desc" : "asc";

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", campo);
    params.set("sortDir", nextDir);
    params.delete("pagina");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <th
      onClick={handleClick}
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none hover:text-gray-800 whitespace-nowrap"
    >
      {label}
      <span className="ml-1">
        {isActive ? (sortDir === "asc" ? "↑" : "↓") : <span className="text-gray-400">↕</span>}
      </span>
    </th>
  );
}
