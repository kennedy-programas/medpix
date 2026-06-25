import * as React from "react"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
)

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, src, ...props }, ref) => {
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) return null

  return (
    <img
      ref={ref}
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      src={src}
      onError={() => setFailed(true)}
      {...props}
    />
  )
})

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="avatar-fallback"
    className={cn(
      "bg-muted flex size-full items-center justify-center rounded-full",
      className
    )}
    {...props}
  />
))

Avatar.displayName = "Avatar"
AvatarImage.displayName = "AvatarImage"
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
