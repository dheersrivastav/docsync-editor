"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { OnlineUser } from "@/hooks/useCollaboration";

const COLORS = [
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

interface Props {
  users: OnlineUser[];
  typingUser: string | null;
}

export function PresenceAvatars({ users, typingUser }: Props) {
  if (users.length === 0 && !typingUser) return null;

  return (
    <div className="flex items-center gap-2">
      {typingUser && (
        <span className="text-xs text-gray-500 italic hidden sm:block">
          {typingUser} is typing...
        </span>
      )}
      <div className="flex -space-x-2">
        {users.slice(0, 4).map((user, i) => (
          <Avatar
            key={user.userId}
            className="h-7 w-7 border-2 border-white"
            title={user.userName}
          >
            <AvatarFallback className={`text-xs ${COLORS[i % COLORS.length]}`}>
              {user.userName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
        {users.length > 4 && (
          <div className="h-7 w-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
            <span className="text-xs text-gray-600">+{users.length - 4}</span>
          </div>
        )}
      </div>
    </div>
  );
}
