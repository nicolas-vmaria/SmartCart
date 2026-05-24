import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Markdown } from 'tiptap-markdown'
import { useEffect, useRef, useState } from 'react'
import { uploadImage } from '../../lib/cloudinary'
import {
    Bold, Italic, List, ListOrdered, ImageIcon, Heading1, Heading2,
    X, Check, Upload, Download
} from 'lucide-react'

function ToolbarBtn({ editor, onClick, active, title, children }) {
    return (
        <button
            type="button"
            onMouseDown={e => {
                e.preventDefault()
                if (editor) editor.view.focus()
                onClick()
            }}
            title={title}
            className={`p-2 rounded-lg transition-colors cursor-pointer
                ${active
                    ? 'bg-verde-escuro text-verde-claro'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-(--admin-hover)'
                }`}
        >
            {children}
        </button>
    )
}

export default function RichTextEditor({ value, onClose, onSave }) {
    const imageRef = useRef(null)
    const mdImportRef = useRef(null)
    const [uploading, setUploading] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({ inline: false, allowBase64: false }),
            Markdown,
        ],
        content: value || '',
        editorProps: {
            attributes: {
                class: 'outline-none min-h-64 prose prose-sm max-w-none dark:prose-invert px-5 py-4',
            },
        },
    })

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || '')
        }
    }, [value])

    async function handleImage(e) {
        const file = e.target.files?.[0]
        if (!file || !editor) return
        setUploading(true)
        try {
            const url = await uploadImage(file)
            editor.chain().setImage({ src: url }).run()
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    function handleImportMd(e) {
        const file = e.target.files?.[0]
        if (!file || !editor) return
        const reader = new FileReader()
        reader.onload = ev => {
            editor.commands.setContent(ev.target.result, false, { preserveWhitespace: 'full' })
        }
        reader.readAsText(file)
        e.target.value = ''
    }

    function handleExportMd() {
        const md = editor.storage.markdown.getMarkdown()
        const blob = new Blob([md], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'descricao.md'
        a.click()
        URL.revokeObjectURL(url)
    }

    if (!editor) return null

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-(--admin-card) rounded-2xl shadow-2xl w-full max-w-3xl mx-4 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-(--admin-border) shrink-0">
                    <h2 className="font-bold text-gray-800 dark:text-(--admin-text)">Editor de Descrição</h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-(--admin-hover) cursor-pointer">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 dark:border-(--admin-border) shrink-0 flex-wrap">
                    <ToolbarBtn editor={editor} onClick={() => editor.chain().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Título (H1)">
                        <Heading1 size={16} />
                    </ToolbarBtn>
                    <ToolbarBtn editor={editor} onClick={() => editor.chain().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Subtítulo (H2)">
                        <Heading2 size={16} />
                    </ToolbarBtn>

                    <div className="w-px h-5 bg-gray-200 dark:bg-(--admin-border) mx-1" />

                    <ToolbarBtn editor={editor} onClick={() => editor.chain().toggleBold().run()} active={editor.isActive('bold')} title="Negrito">
                        <Bold size={16} />
                    </ToolbarBtn>
                    <ToolbarBtn editor={editor} onClick={() => editor.chain().toggleItalic().run()} active={editor.isActive('italic')} title="Itálico">
                        <Italic size={16} />
                    </ToolbarBtn>

                    <div className="w-px h-5 bg-gray-200 dark:bg-(--admin-border) mx-1" />

                    <ToolbarBtn editor={editor} onClick={() => editor.chain().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista">
                        <List size={16} />
                    </ToolbarBtn>
                    <ToolbarBtn editor={editor} onClick={() => editor.chain().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada">
                        <ListOrdered size={16} />
                    </ToolbarBtn>

                    <div className="w-px h-5 bg-gray-200 dark:bg-(--admin-border) mx-1" />

                    <ToolbarBtn onClick={() => imageRef.current?.click()} active={false} title="Inserir imagem">
                        {uploading
                            ? <div className="w-4 h-4 border-2 border-verde-escuro border-t-transparent rounded-full animate-spin" />
                            : <ImageIcon size={16} />
                        }
                    </ToolbarBtn>

                    <div className="w-px h-5 bg-gray-200 dark:bg-(--admin-border) mx-1" />

                    <ToolbarBtn onClick={() => mdImportRef.current?.click()} active={false} title="Importar .md">
                        <Upload size={16} />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={handleExportMd} active={false} title="Exportar como .md">
                        <Download size={16} />
                    </ToolbarBtn>

                    <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                    <input ref={mdImportRef} type="file" accept=".md,text/markdown" className="hidden" onChange={handleImportMd} />
                </div>

                {/* Editor area */}
                <div className="overflow-y-auto flex-1">
                    <EditorContent editor={editor} />
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 dark:border-(--admin-border) shrink-0">
                    <button type="button" onClick={onClose}
                        className="px-5 py-2 rounded-full text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-(--admin-hover) cursor-pointer transition-colors">
                        Cancelar
                    </button>
                    <button type="button" onClick={() => onSave(editor.getHTML())}
                        className="flex items-center gap-2 px-5 py-2 rounded-full text-sm bg-verde-escuro text-verde-claro font-bold hover:opacity-90 cursor-pointer transition-opacity">
                        <Check size={15} /> Salvar descrição
                    </button>
                </div>
            </div>
        </div>
    )
}
