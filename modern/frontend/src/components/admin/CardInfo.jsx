export default function CardInfo({ icon: Icon, title, info, loading = false }) {
    return (
        <div className="w-full flex flex-col gap-3 rounded-2xl p-5 bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) min-w-0">
            <div className="flex items-center gap-2 text-verde-escuro dark:text-(--admin-accent)">
                <Icon size={20} className="shrink-0" />
                <span className="text-sm font-medium">{title}</span>
            </div>
            {loading
                ? <div className="h-9 w-32 bg-gray-200 dark:bg-(--admin-hover) rounded-lg animate-pulse" />
                : <p className="text-3xl font-bold truncate dark:text-(--admin-text)">{info}</p>
            }
        </div>
    )
}