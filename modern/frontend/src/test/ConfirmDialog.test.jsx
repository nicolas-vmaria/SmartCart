import { render, screen, within } from '@testing-library/react'
import ConfirmDialog from '../components/ConfirmDialog'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

describe('ConfirmDialog', () => {
    it('renderiza titulo e mensagem', () => {
        render(<ConfirmDialog title={'Título aqui'} message={'Mensagem aqui!'}/>)
        expect(screen.getByText('Título aqui'))
        expect(screen.getByText('Mensagem aqui!'))
    })

    it('botao chama callback', async () => {
        const onConfirm = vi.fn()
        const onCancel = vi.fn()
        const {container} = render(<ConfirmDialog title={'Título aqui'} message={'Mensagem aqui!'} onConfirm={onConfirm} onCancel={onCancel}/>)
        const confirmButton = within(container).getByRole('button', {name: 'Confirmar'})
        const cancelButton = within(container).getByRole('button', {name: 'Cancelar'})
        await userEvent.click(confirmButton)
        await userEvent.click(cancelButton)
        expect(onConfirm).toHaveBeenCalled()
        expect(onCancel).toHaveBeenCalled()
    })
})