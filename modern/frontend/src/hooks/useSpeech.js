import { useEffect, useRef, useState } from 'react'

const CHUNK_MAX = 250

function splitChunks(text) {
    const sentences = text.split(/(?<=[.!?…])\s+/)
    const chunks = []
    let current = ''
    for (const sentence of sentences) {
        if (current && current.length + sentence.length + 1 > CHUNK_MAX) {
            chunks.push(current)
            current = sentence
        } else {
            current = current ? `${current} ${sentence}` : sentence
        }
    }
    if (current) chunks.push(current)
    return chunks
}

export function useSpeech() {
    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
    const [speaking, setSpeaking] = useState(false)
    const [paused, setPaused] = useState(false)
    const chunksRef = useRef([])
    const indexRef = useRef(0)
    const cancelledRef = useRef(false)
    const voiceRef = useRef(null)

    useEffect(() => {
        if (!supported) return
        function loadVoice() {
            const voices = window.speechSynthesis.getVoices()
            voiceRef.current =
                voices.find(v => v.lang.replace('_', '-').toLowerCase().startsWith('pt-br'))
                ?? voices.find(v => v.lang.toLowerCase().startsWith('pt'))
                ?? null
        }
        loadVoice()
        window.speechSynthesis.addEventListener('voiceschanged', loadVoice)
        return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoice)
    }, [])

    useEffect(() => stop, [])

    function speakNext() {
        if (cancelledRef.current) return
        if (indexRef.current >= chunksRef.current.length) {
            setSpeaking(false)
            setPaused(false)
            return
        }
        const utterance = new SpeechSynthesisUtterance(chunksRef.current[indexRef.current])
        utterance.lang = 'pt-BR'
        if (voiceRef.current) utterance.voice = voiceRef.current
        utterance.onend = () => {
            if (cancelledRef.current) return
            indexRef.current += 1
            speakNext()
        }
        utterance.onerror = () => {
            if (cancelledRef.current) return
            setSpeaking(false)
            setPaused(false)
        }
        window.speechSynthesis.speak(utterance)
    }

    function speakPage() {
        if (!supported) return
        stop()
        const selection = window.getSelection()?.toString().trim()
        const el = document.getElementById('conteudo') ?? document.body
        const text = (selection || el.innerText || el.textContent || '').trim()
        if (!text) return
        cancelledRef.current = false
        chunksRef.current = splitChunks(text)
        indexRef.current = 0
        setSpeaking(true)
        setPaused(false)
        speakNext()
    }

    function pause() {
        if (!supported) return
        window.speechSynthesis.pause()
        setPaused(true)
    }

    function resume() {
        if (!supported) return
        window.speechSynthesis.resume()
        setPaused(false)
    }

    function stop() {
        if (!supported) return
        cancelledRef.current = true
        window.speechSynthesis.cancel()
        setSpeaking(false)
        setPaused(false)
    }

    return { supported, speaking, paused, speakPage, pause, resume, stop }
}
