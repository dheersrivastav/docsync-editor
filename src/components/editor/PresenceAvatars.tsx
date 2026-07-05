"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { OnlineUser } from "@/hooks/useCollaboration";

const colors = [
  "bg-purple-100 text-purple-700",
  "bg-sky-100 text-sky-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

export function PresenceAvatars({ users, typingUser }: { users: OnlineUser[]; typingUser: string | null }) {
  if (users.length === 0 && !typingUser) return null;

  return (
    <div className="flex items-center gap-2.5">
      {typingUser && (
        <span className="text-xs text-[#9CA3AF] italic hidden md:block">
          {typingUser} is typing…
        </span>
      )}
      <div className="flex -space-x-1.5">
        {users.slice(0, 4).map((user, i) => (
          <Avatar key={user.userId} className="h-6 w-6 border-2 border-white" title={user.userName}>
            <AvatarFallback className={`text-[10px] font-semibold ${colors[i % colors.length]}`}>
              {user.userName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
        {users.length > 4 && (
          <div className="h-6 w-6 rounded-full border-2 border-white bg-[#F3F4F6] flex items-center justify-center">
            <span className="text-[10px] font-medium text-[#6B7280]">+{users.length - 4}</span>
          </div>
        )}
      </div>
    </div>
  );
}
