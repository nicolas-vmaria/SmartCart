export function imgUrl(url, width = 800) {
    if (!url || !url.includes('cloudinary.com')) return url
    return url.replace('/upload/', `/upload/q_auto,f_webp,w_${width}/`)
}
