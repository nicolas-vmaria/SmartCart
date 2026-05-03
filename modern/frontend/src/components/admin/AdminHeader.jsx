export default function AdminHeader({title, description}){
    return(
        <section>
            <h1 className="text-4xl font-bold dark:text-(--admin-accent)">{title}</h1>
            <p className="text-gray-500  mt-1">{description}</p>
        </section>
    )
}
