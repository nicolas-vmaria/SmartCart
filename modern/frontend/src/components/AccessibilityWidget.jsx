import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Accessibility, Play, Pause, Square, Contrast, RotateCcw } from 'lucide-react'
import { useAccessibility } from '../context/AccessibilityContext'
import { useSpeech } from '../hooks/useSpeech'

export default function AccessibilityWidget() {
    const [open, setOpen] = useState(false)
    const { highContrast, toggleContrast, fontScale, increaseFont, decreaseFont, resetFont } = useAccessibility()
    const { supported, speaking, paused, speakPage, pause, resume, stop } = useSpeech()
    const location = useLocation()
    const buttonRef = useRef(null)
    const firstControlRef = useRef(null)

    useEffect(() => {
        stop()
    }, [location.pathname])

    useEffect(() => {
        if (open) firstControlRef.current?.focus()
    }, [open])

    function handleKeyDown(e) {
        if (e.key === 'Escape' && open) {
            setOpen(false)
            buttonRef.current?.focus()
        }
    }

    const isAdmin = location.pathname.startsWith('/admin')

    return (
        <div className={`fixed bottom-6 z-90 flex flex-col ${isAdmin ? 'right-6 items-end' : 'left-6 items-start'}`} onKeyDown={handleKeyDown}>
            {open && (
                <div
                    id="a11y-panel"
                    role="dialog"
                    aria-label="Acessibilidade"
                    className="mb-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex flex-col gap-4"
                >
                    <p className="font-bold text-gray-800 text-sm">Acessibilidade</p>

                    {supported && (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold text-gray-500">Leitura em voz alta</p>
                            {!speaking ? (
                                <button
                                    ref={firstControlRef}
                                    onClick={speakPage}
                                    className="flex items-center justify-center gap-2 bg-verde-escuro text-white text-sm font-bold py-2 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                                >
                                    <Play size={16} /> Ler página
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        ref={firstControlRef}
                                        onClick={paused ? resume : pause}
                                        className="flex-1 flex items-center justify-center gap-2 bg-verde-escuro text-white text-sm font-bold py-2 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                                    >
                                        {paused ? <><Play size={16} /> Continuar</> : <><Pause size={16} /> Pausar</>}
                                    </button>
                                    <button
                                        onClick={stop}
                                        className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 text-sm font-bold py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <Square size={16} /> Parar
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold text-gray-500">Contraste</p>
                        <button
                            ref={supported ? undefined : firstControlRef}
                            onClick={toggleContrast}
                            aria-pressed={highContrast}
                            className={`flex items-center justify-center gap-2 text-sm font-bold py-2 rounded-xl border transition-colors cursor-pointer ${highContrast ? 'bg-verde-escuro text-white border-verde-escuro' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Contrast size={16} /> Alto contraste {highContrast ? 'ativado' : 'desativado'}
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold text-gray-500">Tamanho do texto</p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={decreaseFont}
                                aria-label="Diminuir fonte"
                                className="w-10 h-10 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                A-
                            </button>
                            <span aria-live="polite" className="flex-1 text-center text-sm font-bold text-gray-800">
                                {fontScale}%
                            </span>
                            <button
                                onClick={increaseFont}
                                aria-label="Aumentar fonte"
                                className="w-10 h-10 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                A+
                            </button>
                            <button
                                onClick={resetFont}
                                aria-label="Restaurar tamanho da fonte"
                                className="w-10 h-10 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center"
                            >
                                <RotateCcw size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button
                ref={buttonRef}
                onClick={() => setOpen(v => !v)}
                aria-label="Opções de acessibilidade"
                aria-expanded={open}
                aria-controls="a11y-panel"
                className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
            >
                <Accessibility size={28} />
            </button>
        </div>
    )
}
