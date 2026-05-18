<?php

require_once __DIR__ . '/../repository/AdminEmployeesRepository.php';

class AdminEmployeesService {
    private AdminEmployeesRepository $repository;

    public function __construct() {
        $this->repository = new AdminEmployeesRepository();
    }

    public function getAllEmployee(): array {
    $employees = $this->repository->getAll();

    return [
        'total'    => count($employees),
        'usuarios' => $employees,
    ];
    }
    

    public function createEmployee(array $body): array {
        $required = ['nome', 'email', 'senha', 'papel_id'];
        foreach ($required as $field) {
            if (empty($body[$field])) {
                return ['error' => "Campo obrigatório ausente: $field", 'status' => 422];
            }
        }

        $nome     = trim($body['nome']);
        $email    = trim($body['email']);
        $senha    = $body['senha'];
        $papel_id = (int) $body['papel_id'];

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['error' => 'E-mail inválido', 'status' => 422];
        }

        if (strlen($senha) < 8) {
            return ['error' => 'A senha deve ter pelo menos 8 caracteres', 'status' => 422];
        }

        if ($this->repository->findByEmail($email)) {
            return ['error' => 'E-mail já cadastrado', 'status' => 409];
        }

        $roles   = $this->repository->getAllRoles();
        $roleIds = array_column($roles, 'id');
        if (!in_array($papel_id, $roleIds)) {
            return ['error' => 'Papel inválido', 'status' => 422];
        }

        $newId = $this->repository->create([
            'nome'       => $nome,
            'email'      => $email,
            'senha_hash' => password_hash($senha, PASSWORD_BCRYPT),
            'papel_id'   => $papel_id,
        ]);

        return [
            'message' => 'Usuário criado com sucesso',
            'usuario' => $this->repository->findById($newId),
        ];
    }

    public function updateEmployee(string $id, array $body): array {
    // 1. Campos obrigatórios
    $required = ['nome', 'email', 'papel_id'];
    foreach ($required as $field) {
        if (empty($body[$field])) {
            return ['error' => "Campo obrigatório ausente: $field", 'status' => 422];
        }
    }

    $nome     = trim($body['nome']);
    $email    = trim($body['email']);
    $papel_id = (int) $body['papel_id'];
    $userId   = (int) $id;

    // 2. Valida e-mail
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return ['error' => 'E-mail inválido', 'status' => 422];
    }

    // 3. Verifica se o usuário existe
    $usuario = $this->repository->findById($userId);
    if (!$usuario) {
        return ['error' => 'Usuário não encontrado', 'status' => 404];
    }

    // 4. Verifica duplicata de e-mail (ignorando o próprio usuário)
    $emailExistente = $this->repository->findByEmail($email);
    if ($emailExistente && (int) $emailExistente['id'] !== $userId) {
        return ['error' => 'E-mail já cadastrado', 'status' => 409];
    }

    // 5. Valida papel
    $roles   = $this->repository->getAllRoles();
    $roleIds = array_column($roles, 'id');
    if (!in_array($papel_id, $roleIds)) {
        return ['error' => 'Papel inválido', 'status' => 422];
    }

    // 6. Executa
    $this->repository->update($userId, [
        'nome'     => $nome,
        'email'    => $email,
        'papel_id' => $papel_id,
    ]);

    return [
        'message' => 'Usuário atualizado com sucesso',
        'usuario' => $this->repository->findById($userId),
    ];
    }

    public function deleteEmployee(string $id): array {
    $userId = (int) $id;

    $usuario = $this->repository->findById($userId);
    if (!$usuario) {
        return ['error' => 'Usuário não encontrado', 'status' => 404];
    }

    if (!$usuario['is_admin']) {
        return ['error' => 'Apenas funcionários administrativos podem ser removidos por aqui', 'status' => 403];
    }

    $this->repository->delete($userId);

    return ['message' => 'Usuário removido com sucesso'];
    }

    public function resetPassword(string $id): array {
    $userId = (int) $id;

    if (!$this->repository->findById($userId)) {
        return ['error' => 'Usuário não encontrado', 'status' => 404];
    }

    $this->repository->resetPassword($userId, password_hash('admin123', PASSWORD_BCRYPT));

    return ['message' => 'Senha redefinida para o padrão com sucesso'];
    }
}