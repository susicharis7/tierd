import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "../../lib/utils";
import { DoodleAvatar } from "./DoodleAvatar";

interface UserAvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** User display name. Seeds the doodle fallback's color + expression. */
  name: string;
  /** Uploaded avatar URL. Falls back to a seeded doodle when null/empty/broken. */
  src?: string | null;
  /** Pixel size of the (square) avatar. Default 44. */
  size?: number;
  /** Optional alt override. Defaults to `name`. */
  alt?: string;
}

/**
 * The reusable avatar primitive for the redesign. Builds on the shadcn
 * Avatar (Radix under the hood) so image loading + fallback timing is handled
 * for us — the only difference is the fallback renders a seeded DoodleAvatar
 * instead of an initial letter on a tinted background.
 *
 * Use this anywhere the codebase currently writes:
 *   <Avatar><AvatarImage src={u.avatar_url}/><AvatarFallback>X</AvatarFallback></Avatar>
 */
const UserAvatar = React.forwardRef<HTMLSpanElement, UserAvatarProps>(
  ({ name, src, size = 44, alt, className, style, ...props }, ref) => {
    const hasSrc = Boolean(src && src.trim().length > 0);
    return (
      <Avatar
        ref={ref}
        className={cn("shrink-0", className)}
        style={{ width: size, height: size, ...style }}
        {...props}
      >
        {hasSrc && <AvatarImage src={src as string} alt={alt ?? name} />}
        <AvatarFallback className="bg-transparent p-0">
          <DoodleAvatar name={name} size={size} />
        </AvatarFallback>
      </Avatar>
    );
  },
);
UserAvatar.displayName = "UserAvatar";

export { UserAvatar };
