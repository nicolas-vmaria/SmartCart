<?php

require_once __DIR__ . '/../service/ReviewService.php';

class ReviewController {
    private ReviewService $service;

    public function __construct() {
        $this->service = new ReviewService();
    }

    public function index($productId) {
        echo json_encode($this->service->getProductReviews($productId));
    }

    public function store($productId) {
        echo json_encode($this->service->createReview($productId));
    }

    public function helpful($id) {
        echo json_encode($this->service->markHelpful($id));
    }
}
