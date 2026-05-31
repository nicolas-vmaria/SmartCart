import { render, screen, within } from '@testing-library/react'
import ProductCard from '../components/ProdutoCard'
import { describe, expect, Experimental, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

describe('ProductCard', () => {

    const produto = {
        nome: 'Smartcart Go',
        preco: '1000',
        slug: 'smartcart-go',
        foto_url: 'https://exemplo.com/foto.jpg',
        desconto_percentual: '20'
    }

    it('exibe o nome do produto', () => {
        render(
            <MemoryRouter>
                <ProductCard produto={produto} />
            </MemoryRouter>
        )

        expect(screen.getByText('Smartcart Go'))
    })

    it('exibe o preço do produto', () => {
        const { container } = render(
            <MemoryRouter>
                <ProductCard produto={produto} />
            </MemoryRouter>
        )

        expect(within(container).getByText('R$ 1.000,00'))
    })
    
    it('a foto possui url', () => {
        const { container } = render(
            <MemoryRouter>
                <ProductCard produto={produto} />
            </MemoryRouter>
        )

        const img = within(container).getByRole('img')

        expect(img).toHaveAttribute('src', 'https://exemplo.com/foto.jpg')
    })

    it('ao clicar no produto, envia para os detalhes do produto', () => {
        const { container } = render(
            <MemoryRouter>
                <ProductCard produto={produto} />
            </MemoryRouter>
        )

        const link = within(container).getByRole('link')
        expect(link).toHaveAttribute('href', `/produto/${produto.slug}`)
    })

    it('com desconto, exibe badge e preço riscado', () => {
        
        const { container } = render(
            <MemoryRouter>
                <ProductCard produto={produto} />
            </MemoryRouter>
        )

        expect(within(container).getByText('-20%')).toBeInTheDocument()
        expect(within(container).getByText('R$ 1.000,00')).toBeInTheDocument()
        expect(within(container).getByText('R$ 800,00')).toBeInTheDocument()
    })

    it('sem foto_url, exibe texto "Sem imagem"', () => {
        const produtoSemFoto = { ...produto, foto_url: null }
        const { container } = render(
            <MemoryRouter>
                <ProductCard produto={produtoSemFoto} />
            </MemoryRouter>
        )

        expect(within(container).getByText('Sem imagem')).toBeInTheDocument()
    })

    it('com produto null, não renderiza nada', () => {
        const { container } = render(
            <MemoryRouter>
                <ProductCard produto={null} />
            </MemoryRouter>
        )

        expect(container.firstChild).toBeNull()
    })
})

