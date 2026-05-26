<?php

require_once __DIR__ . '/../service/ReviewService.php';
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ReviewController extends BaseController {
    private ReviewService $service;

    public function __construct() {
        $this->service = new ReviewService();
    }

    public function index($productId) {
        $result = $this->service->getProductReviews($productId);
        $this->respond($result);
    }

    public function store($productId) {
        $payload = AuthMiddleware::handle();
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $body['user_id'] = (int) $payload['userId'];
        $body['produto_id'] = $productId;
        $result = $this->service->createReview($body);
        $this->respond($result);
    }

    public function markHelpful($id) {
        echo json_encode($this->service->markHelpful($id));
    }
}
