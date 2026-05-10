<?php

class AdminCurriculoService {
    public function getAllCurriculos() {
        return ['message' => 'Listando todos os currículos'];
    }

    public function updateStatus($id) {
        return ['message' => "Status do currículo $id atualizado"];
    }

    public function deleteCurriculo($id) {
        return ['message' => "Currículo $id removido"];
    }
}
