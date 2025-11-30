from flask_login import UserMixin
import crcmod
import qrcode
import os
import unicodedata


class Usuario(UserMixin):
    def __init__(self, id, nome, cnpj, telefone, email, senha, is_admin=False):
        self.id = id
        self.nome = nome
        self.cnpj = cnpj
        self.telefone = telefone
        self.email = email
        self.senha = senha
        self.is_admin = is_admin

        self.primeiro_nome = nome.strip().split(" ")[0]




class Payload():
    def __init__(self, nome, chavepix, valor, cidade, txtId, diretorio='', nome_arquivo='pixqrcode.png'):
        
        self.nome = self.remover_acentos(nome)[0:25] # Limita a 25 caracteres e tira acentos
        self.chavepix = chavepix
        self.valor = valor.replace(',', '.') # Garante ponto decimal
        self.cidade = self.remover_acentos(cidade)[0:15] # Limita cidade a 15 chars
        self.txtId = txtId
        self.diretorioQrCode = diretorio
        self.nome_arquivo = nome_arquivo

        # Configurações fixas do Pix
        self.payloadFormat = '000201'
        self.merchantCategCode = '52040000'
        self.transactionCurrency = '5303986' # 986 = Real Brasileiro
        self.countryCode = '5802BR'
        self.crc16 = '6304' # O CRC vem sempre no final com ID 63 e tamanho 04

    def remover_acentos(self, texto):
        # Normaliza para remover acentos (bancos preferem ASCII simples)
        return "".join(c for c in unicodedata.normalize("NFD", texto) if unicodedata.category(c) != "Mn")

    def gerarPayload(self):
        # 1. Formata a Chave Pix (ID 26)
        # 0014BR.GOV.BCB.PIX + 01 + TamanhoChave + Chave
        campo_chave = f'0014BR.GOV.BCB.PIX01{len(self.chavepix):02}{self.chavepix}'
        self.merchantAccount = f'26{len(campo_chave):02}{campo_chave}'

        # 2. Formata o Valor (ID 54) - AQUI ESTAVA O ERRO PROVAVELMENTE
        # Garante duas casas decimais (Ex: 10 virou 10.00)
        valor_formatado = f"{float(self.valor):.2f}"
        self.transactionAmount = f'54{len(valor_formatado):02}{valor_formatado}'

        # 3. Formata Nome (ID 59) e Cidade (ID 60)
        self.merchantName = f'59{len(self.nome):02}{self.nome}'
        self.merchantCity = f'60{len(self.cidade):02}{self.cidade}'

        # 4. Formata o TXID (ID 62)
        # 05 + TamanhoId + Id
        campo_txid = f'05{len(self.txtId):02}{self.txtId}'
        self.addDataField = f'62{len(campo_txid):02}{campo_txid}'

        # 5. MONTA A STRING COMPLETA (SEM O CRC AINDA)
        self.payload = (
            f'{self.payloadFormat}'
            f'{self.merchantAccount}'
            f'{self.merchantCategCode}'
            f'{self.transactionCurrency}'
            f'{self.transactionAmount}'
            f'{self.countryCode}'
            f'{self.merchantName}'
            f'{self.merchantCity}'
            f'{self.addDataField}'
            f'{self.crc16}' # Adiciona o cabeçalho do CRC (6304)
        )

        # 6. Calcula o CRC e gera a imagem
        self.gerarCrc16(self.payload)

    def gerarCrc16(self, payload):
        # Calcula o checksum CRC16
        crc16_fun = crcmod.mkCrcFun(poly=0x11021, initCrc=0xFFFF, rev=False, xorOut=0x0000)
        crc16_code = hex(crc16_fun(str(payload).encode('utf-8')))
        
        # Formata para 4 caracteres maiúsculos (Ex: 0x9A2 -> 09A2)
        crc16_code_formatado = str(crc16_code).replace('0x', '').upper().zfill(4)

        # Adiciona o CRC calculado ao final
        self.payload_completa = f'{payload}{crc16_code_formatado}'

        self.gerarQrCode(self.payload_completa, self.diretorioQrCode)

    def gerarQrCode(self, payload, diretorio):
        if diretorio and not os.path.exists(diretorio):
            os.makedirs(diretorio)
            
        self.qrcode = qrcode.make(payload)
        
        # Salva a imagem
        caminho_final = os.path.join(diretorio, self.nome_arquivo)
        self.qrcode.save(caminho_final)
        
        # Imprime o código Pix no terminal (Útil para você testar copiar e colar!)
        print("\n--- CÓDIGO PIX COPIA E COLA ---")
        print(payload)
        print("-------------------------------\n")