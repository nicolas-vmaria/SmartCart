# Pendências de Implementação

## Checkout — incrementar uso do cupom

Ao finalizar um pedido com cupom aplicado, o backend precisa incrementar `quant_usos` na tabela `Cupons`.

**Por quê:** O `POST /coupon/validate` só valida o cupom, não registra o uso. Se não incrementar no checkout, o limite de `max_usos` nunca será atingido.

**O que fazer:**
1. No service de pedidos, após inserir o pedido com sucesso, chamar um método `incrementUso(string $codigo)`
2. Criar esse método no `AdminCouponRepository` (ou num `CouponRepository` dedicado):

```php
public function incrementUso(string $codigo): void {
    $stmt = $this->db->prepare('
        UPDATE Cupons SET quant_usos = quant_usos + 1 WHERE codigo = ?
    ');
    $stmt->execute([$codigo]);
}
```

3. O frontend deve passar o `codigo` do cupom aplicado junto com os dados do pedido no payload do checkout.
