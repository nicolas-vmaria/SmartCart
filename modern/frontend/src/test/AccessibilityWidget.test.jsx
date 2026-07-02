import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AccessibilityWidget from '../components/AccessibilityWidget'
import { AccessibilityProvider } from '../context/AccessibilityContext'

function renderWidget() {
    return render(
        <MemoryRouter>
            <AccessibilityProvider>
                <main id="conteudo">Texto de teste para leitura.</main>
                <AccessibilityWidget />
            </AccessibilityProvider>
        </MemoryRouter>
    )
}

beforeEach(() => {
    window.speechSynthesis = {
        speak: vi.fn(),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        getVoices: () => [],
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }
    window.SpeechSynthesisUtterance = class {
        constructor(text) { this.text = text }
    }
})

afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('high-contrast')
    document.documentElement.style.fontSize = ''
    delete window.speechSynthesis
    delete window.SpeechSynthesisUtterance
})

describe('AccessibilityWidget', () => {
    it('abre o painel ao clicar no botão flutuante', async () => {
        const { container } = renderWidget()
        const botao = within(container).getByRole('button', { name: /opções de acessibilidade/i })
        expect(botao.getAttribute('aria-expanded')).toBe('false')
        await userEvent.click(botao)
        expect(botao.getAttribute('aria-expanded')).toBe('true')
        expect(within(container).getByRole('dialog', { name: /acessibilidade/i })).toBeTruthy()
    })

    it('Ler página chama speechSynthesis.speak', async () => {
        const { container } = renderWidget()
        await userEvent.click(within(container).getByRole('button', { name: /opções de acessibilidade/i }))
        await userEvent.click(within(container).getByRole('button', { name: /ler página/i }))
        expect(window.speechSynthesis.speak).toHaveBeenCalled()
        expect(window.speechSynthesis.speak.mock.calls[0][0].text).toContain('Texto de teste')
    })

    it('toggle de alto contraste aplica classe no html', async () => {
        const { container } = renderWidget()
        await userEvent.click(within(container).getByRole('button', { name: /opções de acessibilidade/i }))
        const toggle = within(container).getByRole('button', { name: /alto contraste/i })
        expect(toggle.getAttribute('aria-pressed')).toBe('false')
        await userEvent.click(toggle)
        expect(toggle.getAttribute('aria-pressed')).toBe('true')
        expect(document.documentElement.classList.contains('high-contrast')).toBe(true)
    })

    it('A+ aumenta a fonte e mostra o valor', async () => {
        const { container } = renderWidget()
        await userEvent.click(within(container).getByRole('button', { name: /opções de acessibilidade/i }))
        await userEvent.click(within(container).getByRole('button', { name: /aumentar fonte/i }))
        expect(within(container).getByText('112.5%')).toBeTruthy()
        expect(document.documentElement.style.fontSize).toBe('112.5%')
    })

    it('Escape fecha o painel e devolve o foco ao botão', async () => {
        const { container } = renderWidget()
        const botao = within(container).getByRole('button', { name: /opções de acessibilidade/i })
        await userEvent.click(botao)
        await userEvent.keyboard('{Escape}')
        expect(botao.getAttribute('aria-expanded')).toBe('false')
        expect(within(container).queryByRole('dialog')).toBe(null)
        expect(document.activeElement).toBe(botao)
    })
})
