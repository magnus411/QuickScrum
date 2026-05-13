"use client";

import { TeamMember, MEMBER_COLORS, MEMBER_AVATARS } from "@/app/lib/types";
import { cn } from "@/app/lib/utils";

interface MemberAvatarProps {
  member: TeamMember | null;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
};

export default function MemberAvatar({ member, size = "md", showName = false, className }: MemberAvatarProps) {
  if (!member) {
    return (
      <div className={cn("rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-semibold", sizeClasses[size], className)}>
        ?
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "rounded-full flex items-center justify-center text-white font-bold shadow-sm",
          sizeClasses[size],
          className
        )}
        style={{ backgroundColor: MEMBER_COLORS[member] }}
        title={member}
      >
        {MEMBER_AVATARS[member]}
      </div>
      {showName && <span className="text-sm font-medium text-gray-700">{member}</span>}
    </div>
  );
}
