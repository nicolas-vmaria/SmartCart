import { render, within } from '@testing-library/react'
import AdminHeader from '../components/admin/AdminHeader'
import { describe, expect, it } from 'vitest'

describe('AdminHeader', () => {
    it('renderiza o título', () => {
        const { container } = render(<AdminHeader title="Produtos" description="Gerencie os produtos" />)
        expect(within(container).getByText('Produtos')).toBeInTheDocument()
    })

    it('renderiza a descrição', () => {
        const { container } = render(<AdminHeader title="Produtos" description="Gerencie os produtos" />)
        expect(within(container).getByText('Gerencie os produtos')).toBeInTheDocument()
    })
})
