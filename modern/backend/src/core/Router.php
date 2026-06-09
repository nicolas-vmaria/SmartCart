<?php

class Router
{
    private array $routes = [];

    public function get(string $path, array $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, array $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    public function put(string $path, array $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }

    public function patch(string $path, array $handler): void
    {
        $this->addRoute('PATCH', $path, $handler);
    }

    public function delete(string $path, array $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    private function addRoute(string $method, string $path, array $handler): void
    {
        $this->routes[] = [$method, $path, $handler];
    }

    public function dispatch(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        // PHP built-in dev server sets SCRIPT_NAME to the request URI, not the router script path.
        // Detect this to avoid incorrectly stripping part of the URI as a base path.
        $scriptName = $_SERVER['SCRIPT_NAME'];
        if ($scriptName !== $uri) {
            $base = rtrim(dirname($scriptName), '/');
            if ($base && str_starts_with($uri, $base)) {
                $uri = substr($uri, strlen($base));
            }
        }
        $uri = '/' . ltrim($uri, '/');

        foreach ($this->routes as [$routeMethod, $routePath, $handler]) {
            $pattern = preg_replace('/\{[^}]+\}/', '([^/]+)', $routePath);
            $pattern = "#^{$pattern}$#";

            if ($routeMethod === $method && preg_match($pattern, $uri, $matches)) {
                array_shift($matches);

                [$controllerClass, $action] = $handler;
                $controller = new $controllerClass();
                $controller->$action(...$matches);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
    }
}

$router = new Router();