<?php

require_once __DIR__ . '/../repository/AdminBannerRepository.php';
require_once __DIR__ . '/../repository/AuditRepository.php';
require_once __DIR__ . '/../core/Cloudinary.php';

class AdminBannerService {
    private AdminBannerRepository $repository;

    public function __construct(?AdminBannerRepository $repo = null) {
        $this->repository = $repo ?? new AdminBannerRepository();
    }

    public function getAll(): array {
        try {
            return ['banners' => $this->repository->findAll()];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao buscar banners: ' . $e->getMessage()];
        }
    }

    public function getActive(): array {
        try {
            return ['banners' => $this->repository->findActive()];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao buscar banners: ' . $e->getMessage()];
        }
    }

    public function create(array $body, ?array $admin = null): array {
        $foto_url = trim($body['foto_url'] ?? '');
        if (!$foto_url) {
            http_response_code(400);
            return ['error' => 'foto_url é obrigatório'];
        }
        try {
            $banner = $this->repository->create($foto_url);
            if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'criar', 'banner', $banner['id'] ?? null);
            http_response_code(201);
            return ['message' => 'Banner adicionado', 'banner' => $banner];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao criar banner: ' . $e->getMessage()];
        }
    }

    public function delete(int $id, ?array $admin = null): array {
        try {
            $fotoUrl = $this->repository->getFotoUrl($id);

            if (!$this->repository->delete($id)) {
                http_response_code(404);
                return ['error' => 'Banner não encontrado'];
            }

            if ($fotoUrl) Cloudinary::deleteImage($fotoUrl);
            if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'deletar', 'banner', $id);

            return ['message' => 'Banner removido'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao remover banner: ' . $e->getMessage()];
        }
    }

    public function reorder(array $body, ?array $admin = null): array {
        $ids = $body['ids'] ?? null;
        if (!is_array($ids)) {
            http_response_code(400);
            return ['error' => 'ids é obrigatório e deve ser um array'];
        }
        try {
            $this->repository->reorder($ids);
            if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'reordenar', 'banner');
            return ['message' => 'Ordem atualizada'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao reordenar banners: ' . $e->getMessage()];
        }
    }

    public function toggleAtivo(int $id, ?array $admin = null): array {
        try {
            $banner = $this->repository->toggleAtivo($id);
            if (!$banner) {
                http_response_code(404);
                return ['error' => 'Banner não encontrado'];
            }
            if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'toggle_ativo', 'banner', $id);
            return ['message' => 'Status atualizado', 'banner' => $banner];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao atualizar banner: ' . $e->getMessage()];
        }
    }
}
