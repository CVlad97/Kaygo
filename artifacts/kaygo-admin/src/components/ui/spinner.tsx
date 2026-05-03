import { Loader2Icon } from "lucide-react"
import type { SVGProps } from "react"

import { cn } from "@/lib/utils"

type SpinnerProps = Omit<SVGProps<SVGSVGElement>, "ref">

function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
