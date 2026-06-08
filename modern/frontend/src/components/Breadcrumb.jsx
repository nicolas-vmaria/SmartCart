import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"

export default function Breadcrumb({ items }) {
    return (
        <nav className="flex items-center gap-1 text-sm text-gray-400 flex-wrap">
            {items.map((item, i) => {
                const isLast = i === items.length - 1
                return (
                    <span key={i} className="flex items-center gap-1">
                        {i > 0 && <ChevronRight size={14} className="shrink-0" />}
                        {isLast || !item.href
                            ? <span className="text-gray-600 font-medium truncate max-w-48">{item.label}</span>
                            : <Link to={item.href} className="hover:text-verde-escuro transition-colors">{item.label}</Link>
                        }
                    </span>
                )
            })}
        </nav>
    )
}
