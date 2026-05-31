import { render, screen, within } from '@testing-library/react'
import CardInfo from '../components/admin/CardInfo'
import { describe, expect, it } from 'vitest'
import { Package } from 'lucide-react'

describe('CardInfo', () => {
    it('exibe título e info', () => {
        const { container } = render(<CardInfo icon={Package} title="Pedidos" info="142" />)
        expect(within(container).getByText('Pedidos')).toBeInTheDocument()
        expect(within(container).getByText('142')).toBeInTheDocument()
    })

    it('exibe skeleton quando loading=true', () => {
        const { container } = render(<CardInfo icon={Package} title="Pedidos" info="142" loading={true} />)
        const skeleton = container.querySelector('.animate-pulse')
        expect(skeleton).toBeInTheDocument()
    })

    it('não exibe skeleton quando loading=false', () => {
        const { container } = render(<CardInfo icon={Package} title="Pedidos" info="142" loading={false} />)
        const skeleton = container.querySelector('.animate-pulse')
        expect(skeleton).not.toBeInTheDocument()
    })
})
