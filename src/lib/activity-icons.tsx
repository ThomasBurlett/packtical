import {
  Backpack,
  Bike,
  Briefcase,
  Flame,
  Mountain,
  Trees,
} from "lucide-react"

interface ActivityIconProps {
  slug: string
  size?: number
  strokeWidth?: number
}

export function ActivityIcon({
  slug,
  size = 18,
  strokeWidth = 2.1,
}: ActivityIconProps) {
  switch (slug) {
    case "camping":
      return <Flame size={size} strokeWidth={strokeWidth} />
    case "trail-running":
      return <Trees size={size} strokeWidth={strokeWidth} />
    case "travel-preparation":
      return <Briefcase size={size} strokeWidth={strokeWidth} />
    case "backpacking":
      return <Backpack size={size} strokeWidth={strokeWidth} />
    case "basic-cycling":
      return <Bike size={size} strokeWidth={strokeWidth} />
    case "mountain-biking":
      return <Mountain size={size} strokeWidth={strokeWidth} />
    default:
      return <Backpack size={size} strokeWidth={strokeWidth} />
  }
}
