const PIX_CHAVE = '11955238901'
const PIX_NOME  = 'Smartcart'
const PIX_CIDADE = 'Joinville'

function crc16(str) {
    let crc = 0xFFFF
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1)
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0')
}

function tlv(id, value) {
    return `${id}${String(value.length).padStart(2, '0')}${value}`
}

export function gerarPixPayload(valor, txid) {
    const txidClean = txid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) || 'SMARTCART'

    const merchantAccount = tlv('00', 'br.gov.bcb.pix') + tlv('01', PIX_CHAVE)
    const additionalData  = tlv('05', txidClean)

    const payload =
        tlv('00', '01') +
        tlv('26', merchantAccount) +
        tlv('52', '0000') +
        tlv('53', '986') +
        tlv('54', Number(valor).toFixed(2)) +
        tlv('58', 'BR') +
        tlv('59', PIX_NOME) +
        tlv('60', PIX_CIDADE) +
        tlv('62', additionalData) +
        '6304'

    return payload + crc16(payload)
}
