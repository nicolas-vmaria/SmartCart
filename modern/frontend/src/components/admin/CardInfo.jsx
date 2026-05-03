export default function CardInfo({icon: Icon, title, info}) {
    return (
        <div className="w-full flex flex-col gap-3 rounded-2xl p-5 bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border)">
            <div className="flex items-center gap-2 text-verde-escuro dark:text-(--admin-accent)">
                <Icon size={24} />
                <h1 className="text-2xl font-bold">{title}</h1>
            </div>
            <h1 className="text-5xl font-semibold truncate dark:text-(--admin-text)">{info}</h1>
        </div>
    )
}