export const FRETE_GRATIS_MINIMO = 500

const TABELA = {
    SP: 15.90, RJ: 15.90, MG: 15.90, ES: 15.90,
    PR: 19.90, SC: 19.90, RS: 19.90,
    GO: 24.90, MT: 24.90, MS: 24.90, DF: 24.90,
    BA: 34.90, SE: 34.90, AL: 34.90, PE: 34.90, PB: 34.90,
    RN: 34.90, CE: 34.90, PI: 34.90, MA: 34.90,
    PA: 44.90, AM: 44.90, RO: 44.90, RR: 44.90, AP: 44.90, AC: 44.90, TO: 44.90,
}

export function calcularFrete(uf, subtotalComDesconto) {
    if (subtotalComDesconto >= FRETE_GRATIS_MINIMO) return 0
    return TABELA[uf] ?? 29.90
}
