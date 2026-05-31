import { render, screen, within } from '@testing-library/react'
import Toast from '../components/Toast'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

describe('Toast', () => {
    it('renderiza mensagem', () => {
        render(<Toast message={"Olá mundo!"} type='success' onClose={() => {}}/>)
        expect(screen.getByText('Olá mundo!'))
    })

    it('se tipo de mensagem = error, icone = AlertCircle', () => {
        const { container } = render(<Toast message={"Olá mundo!"} type='error' onClose={() => {}}/>)
        const icon = container.querySelectorAll('.text-red-500')
        expect(icon).toHaveLength(1)
    })

    it('se a funçao onClose fecha quando quando chamada', async () => {
        const onClose = vi.fn()
        const {container}= render(<Toast message={"Olá mundo!"} type='error' onClose={onClose}/>)
        const button = within(container).getByRole('button')
        await userEvent.click(button)
        expect(onClose).toHaveBeenCalled()
    })
})