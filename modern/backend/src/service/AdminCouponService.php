<?php

class AdminCouponService {
    public function getAllCoupons() {
        return ['message' => 'Listando todos os cupons'];
    }

    public function createCoupon() {
        return ['message' => 'Cupom criado com sucesso'];
    }

    public function updateCoupon($id) {
        return ['message' => "Cupom $id atualizado"];
    }

    public function deleteCoupon($id) {
        return ['message' => "Cupom $id removido"];
    }
}
