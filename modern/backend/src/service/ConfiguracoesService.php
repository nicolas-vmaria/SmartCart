<?php

require_once __DIR__ . '/../repository/ConfiguracoesRepository.php';

class ConfiguracoesService {
    private ConfiguracoesRepository $repository;

    private const ALLOWED_KEYS = [
        'anuncio_ativo', 'anuncio_texto', 'anuncio_cor',
        'loja_telefone1', 'loja_telefone2', 'loja_email', 'loja_cnpj',
        'redes_instagram', 'redes_facebook', 'redes_whatsapp', 'redes_youtube',
        'beneficio_1_titulo', 'beneficio_1_descricao',
        'beneficio_2_titulo', 'beneficio_2_descricao',
        'beneficio_3_titulo', 'beneficio_3_descricao',
        'beneficio_4_titulo', 'beneficio_4_descricao',
        'popup_ativo', 'popup_titulo', 'popup_texto', 'popup_imagem',
        'popup_botao_texto', 'popup_botao_link',
        'frete_gratis_minimo',
        'flash_ativo', 'flash_titulo', 'flash_fim', 'flash_cor', 'flash_link',
        'desconto_ativo',
        'desconto_faixa_1_minimo', 'desconto_faixa_1_pct',
        'desconto_faixa_2_minimo', 'desconto_faixa_2_pct',
        'desconto_faixa_3_minimo', 'desconto_faixa_3_pct',
        'notify_novos_pedidos', 'notify_estoque_baixo',
        'notify_novos_curriculos', 'notify_alertas_sistema',
    ];

    public function __construct() {
        $this->repository = new ConfiguracoesRepository();
    }

    public function getAll(): array {
        try {
            return ['configuracoes' => $this->repository->findAll()];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao buscar configurações: ' . $e->getMessage()];
        }
    }

    public function update(array $body): array {
        $filtered = [];
        foreach (self::ALLOWED_KEYS as $key) {
            if (array_key_exists($key, $body)) {
                $filtered[$key] = (string)$body[$key];
            }
        }

        if (empty($filtered)) {
            http_response_code(400);
            return ['error' => 'Nenhum campo válido enviado'];
        }

        try {
            $this->repository->setMany($filtered);
            return ['message' => 'Configurações salvas com sucesso'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao salvar configurações: ' . $e->getMessage()];
        }
    }
}
