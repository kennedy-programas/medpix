import { NavLink } from "react-router-dom"
import { Home, Search, DollarSign, Bell, User, ShieldAlert } from "lucide-react"

type TabIconProps = {
  name: "Home" | "Search" | "Pay" | "Notifications" | "Profile" | "Complaints"
  size?: "default" | "large"
  to: string
}

function TabIcon({ name, size = "default", to }: TabIconProps) {
  const icons = {
    Home,
    Search,
    Pay: DollarSign,
    Notifications: Bell,
    Complaints: ShieldAlert,
    Profile: User,
  }

  const IconComponent = icons[name]

  const baseClasses =
    "flex flex-col items-center justify-center cursor-pointer transition transform hover:scale-110 active:scale-95"

  return (
    <NavLink
      to={to}
      className={`${baseClasses} ${
        size === "large"
          ? "p-4 bg-gradient-to-tr from-[#B81570] to-[#CC092F] rounded-full shadow-lg"
          : "p-2"
      }`}
    >
      <IconComponent
        size={size === "large" ? 32 : 24}
        className="text-gray-700"
      />
    </NavLink>
  )
}

export default TabIcon
