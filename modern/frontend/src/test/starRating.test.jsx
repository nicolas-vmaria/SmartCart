import {render, screen} from '@testing-library/react'
import StarRating from '../components/StarRating'
import { describe, expect, it } from 'vitest'

describe('StarRating', () => {
    it('renderiza 5 estrelas', () => {
        const {container} = render(<StarRating rating={3} />)
        const estrelas = container.querySelectorAll('svg')
        expect(estrelas).toHaveLength(5)
    })

    it('com rating = 3, as 3 primeiras são amarelas', () => {
        const { container } = render(<StarRating rating={3} />)
        const amarelas = container.querySelectorAll('.text-yellow-400')
        const cinzas = container.querySelectorAll('.text-gray-300')
        expect(amarelas).toHaveLength(3)
        expect(cinzas).toHaveLength(2)
    })

    it('com rating = 0, todas são cinzas', () => {
        const {container } = render(<StarRating rating={0}/>)
        const cinzas = container.querySelectorAll('.text-gray-300')
        expect(cinzas).toHaveLength(5)
    })
})