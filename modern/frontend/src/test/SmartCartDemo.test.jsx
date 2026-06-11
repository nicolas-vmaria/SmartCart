import { render, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SmartCartDemo from '../components/SmartCartDemo'

const demoData = {
  cart: {
    id: 'demo-cart-001',
    status: 'shopping',
    products: [
      {
        id: 1,
        name: 'Leite Integral',
        price: 6.49,
        quantity: 2,
        image: '/assets/products/leite.svg',
        category: 'Laticinios',
      },
      {
        id: 2,
        name: 'Pao de Forma',
        price: 9.9,
        quantity: 1,
        image: '/assets/products/pao.svg',
        category: 'Padaria',
      },
    ],
  },
  availableProducts: [
    {
      id: 1,
      name: 'Leite Integral',
      price: 6.49,
      quantity: 1,
      image: '/assets/products/leite.svg',
      category: 'Laticinios',
    },
    {
      id: 2,
      name: 'Pao de Forma',
      price: 9.9,
      quantity: 1,
      image: '/assets/products/pao.svg',
      category: 'Padaria',
    },
    {
      id: 3,
      name: 'Arroz Branco 5kg',
      price: 24.9,
      quantity: 1,
      image: '/assets/products/arroz.svg',
      category: 'Mercearia',
    },
  ],
}

function mockFetch(data = demoData) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  }))
}

function expectCurrency(view, value) {
  expect(view.getAllByText((text) => text.replace(/\s/g, ' ') === value).length).toBeGreaterThan(0)
}

describe('SmartCartDemo', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    mockFetch()
  })

  it('loads products from JSON and updates cart totals through interactions', async () => {
    const user = userEvent.setup()
    const { container } = render(<SmartCartDemo />)
    const view = within(container)

    expect(await view.findByText('Leite Integral')).toBeInTheDocument()
    expect(view.queryByLabelText('Simular sensor para Leite Integral')).not.toBeInTheDocument()
    expectCurrency(view, 'R$ 22,88')
    expect(view.getByText('3')).toBeInTheDocument()

    await user.click(view.getByText('Adicionar produto por sensor'))
    expect(view.getByRole('dialog', { name: 'Produtos por sensor' })).toBeInTheDocument()
    await user.click(view.getByLabelText('Simular sensor para Leite Integral'))
    expectCurrency(view, 'R$ 29,37')
    expect(view.getByText('4')).toBeInTheDocument()
    await user.click(view.getByLabelText('Fechar produtos por sensor'))

    await user.click(view.getByLabelText('Remover Leite Integral'))
    expect(view.queryByLabelText('Aumentar quantidade de Leite Integral')).not.toBeInTheDocument()

    await user.click(view.getByText('Adicionar produto por sensor'))
    await user.click(view.getByLabelText('Simular sensor para Arroz Branco 5kg'))
    expect(view.getByRole('list', { name: 'Produtos adicionados ao carrinho' })).toBeInTheDocument()
    expectCurrency(view, 'R$ 34,80')
    await user.click(view.getByLabelText('Fechar produtos por sensor'))

    await user.click(view.getByText('Ir para pagamento'))
    expect(view.getByText('Forma de pagamento')).toBeInTheDocument()
    await user.click(view.getByText('Gerar QR Code PIX'))
    expect(view.getByText('Pague com PIX')).toBeInTheDocument()
    await user.click(view.getByText('Ja realizei o pagamento'))
    expect(view.getByText('Compra concluida')).toBeInTheDocument()

    await user.click(view.getByText('Nova demonstracao'))
    expectCurrency(view, 'R$ 22,88')
  })

  it('shows a friendly error and retries loading the JSON', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(demoData),
      }))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const { container } = render(<SmartCartDemo />)
    const view = within(container)

    expect(await view.findByText('Nao foi possivel carregar a demonstracao')).toBeInTheDocument()

    await user.click(view.getByText('Tentar novamente'))

    await waitFor(() => {
      expect(view.getAllByText('Leite Integral').length).toBeGreaterThan(0)
    })
  })

  it('restores edited display data from localStorage', async () => {
    const user = userEvent.setup()
    const { container, unmount } = render(<SmartCartDemo />)
    const view = within(container)

    await view.findByText('Leite Integral')
    await user.click(view.getByText('Adicionar produto por sensor'))
    await user.click(view.getByLabelText('Simular sensor para Leite Integral'))
    await user.click(view.getByLabelText('Fechar produtos por sensor'))
    await user.click(view.getByText('Ir para pagamento'))
    await user.click(view.getByText('Gerar QR Code PIX'))
    await user.click(view.getByText('Ja realizei o pagamento'))

    unmount()

    const secondRender = render(<SmartCartDemo />)
    const secondView = within(secondRender.container)

    expect(await secondView.findByText('Compra concluida')).toBeInTheDocument()
    expect(secondView.getByText('Compra finalizada')).toBeInTheDocument()

    await user.click(secondView.getByText('Carrinho'))
    expect(secondView.getByLabelText('Quantidade 3x')).toBeInTheDocument()
  })

  it('migrates old account screens directly to payment', async () => {
    localStorage.setItem('smartcart-display-demo-state', JSON.stringify({
      cartProducts: demoData.cart.products,
      finalized: false,
      activeScreen: 'login',
      account: { name: 'Cliente', email: 'cliente@smartcart.com', isLoggedIn: true },
      payment: { method: 'pix' },
    }))

    const { container } = render(<SmartCartDemo />)
    const view = within(container)

    expect(await view.findByText('Forma de pagamento')).toBeInTheDocument()
    expect(view.queryByText('Entrar na conta')).not.toBeInTheDocument()
  })

  it('adds weighted produce using the scale flow', async () => {
    const user = userEvent.setup()
    const weightedData = {
      cart: { id: 'demo-cart-001', status: 'shopping', products: [] },
      availableProducts: [
        {
          id: 10,
          name: 'Maca Gala',
          price: 7.99,
          quantity: 0.1,
          unit: 'kg',
          soldByWeight: true,
          image: '/assets/products/maca.svg',
          category: 'Hortifruti',
        },
      ],
    }
    mockFetch(weightedData)

    const { container } = render(<SmartCartDemo />)
    const view = within(container)

    expect(await view.findByText('Hortifruti na balanca')).toBeInTheDocument()
    expect(view.queryByLabelText('Selecionar Maca Gala por R$ 7,99 por kg')).not.toBeInTheDocument()
    await user.click(view.getByText('Adicionar produto por peso'))
    expect(view.getByLabelText('Selecionar Maca Gala por R$ 7,99 por kg')).toBeInTheDocument()
    expect(view.getByText('R$ 7,99/kg')).toBeInTheDocument()
    await user.clear(view.getByLabelText('Peso detectado'))
    await user.type(view.getByLabelText('Peso detectado'), '0,75')
    await user.click(view.getByText('Confirmar pesagem'))

    expect(view.getByText('Maca Gala')).toBeInTheDocument()
    expect(view.getByLabelText('Quantidade 0,75 kg')).toBeInTheDocument()
    expectCurrency(view, 'R$ 5,99')
  })
})
