import { render, within } from '@testing-library/react'
import Footer from '../components/Footer'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../hooks/useConfiguracoes', () => ({
    useConfiguracoes: () => ({
        config: {
            loja_email: 'contato@smartcart.com',
            loja_telefone1: '45 99999-0001',
            loja_telefone2: '47 99999-0002',
            loja_cnpj: '12.345.678/0001-00',
            redes_instagram: 'https://instagram.com/smartcart',
            redes_facebook: '',
            redes_whatsapp: '',
            redes_youtube: '',
        },
        loading: false
    })
}))

describe('Footer', () => {
    it('exibe o e-mail de contato', () => {
        const { container } = render(<MemoryRouter><Footer /></MemoryRouter>)
        expect(within(container).getByText('contato@smartcart.com')).toBeInTheDocument()
    })

    it('exibe os telefones de contato', () => {
        const { container } = render(<MemoryRouter><Footer /></MemoryRouter>)
        expect(within(container).getByText('45 99999-0001')).toBeInTheDocument()
        expect(within(container).getByText('47 99999-0002')).toBeInTheDocument()
    })

    it('exibe link do Instagram quando configurado', () => {
        const { container } = render(<MemoryRouter><Footer /></MemoryRouter>)
        expect(within(container).getByRole('link', { name: /instagram/i })).toBeInTheDocument()
    })
})
