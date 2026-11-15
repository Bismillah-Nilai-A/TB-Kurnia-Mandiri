import * as React from "react";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { cn } from "@/lib/utils";

export interface CustomLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    NextLinkProps {
  className?: string;
  children?: React.ReactNode;
}

export const Link = React.forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ className, href, children, ...props }, ref) => {
    return (
      <NextLink
        ref={ref}
        href={href}
        className={cn(
          "text-sm font-medium text-primary transition-colors hover:underline",
          className
        )}
        {...props}
      >
        {children}
      </NextLink>
    );
  }
);
Link.displayName = "Link";
export default Link;
