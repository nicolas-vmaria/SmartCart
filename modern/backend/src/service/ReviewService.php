<?php

class ReviewService {
    public function getProductReviews($productId) {
        return ['message' => "Listando reviews do produto $productId"];
    }

    public function createReview($productId) {
        return ['message' => "Review criado para o produto $productId"];
    }

    public function markHelpful($id) {
        return ['message' => "Review $id marcado como útil"];
    }
}
