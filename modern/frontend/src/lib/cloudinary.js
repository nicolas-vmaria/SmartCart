const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export async function uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, {
        method: 'POST',
        body: formData,
    })

    const data = await res.json()

    if (!res.ok || !data.secure_url) {
        console.error('[Cloudinary] Upload falhou:', data)
        throw new Error(data.error?.message || 'Falha ao fazer upload do arquivo')
    }

    return data.secure_url
}

export async function uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
    })

    const data = await res.json()

    if (!res.ok || !data.secure_url) {
        console.error('[Cloudinary] Upload falhou:', data)
        throw new Error(data.error?.message || 'Falha ao fazer upload da imagem')
    }

    return data.secure_url
}
