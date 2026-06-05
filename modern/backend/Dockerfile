FROM php:8.4-cli

RUN apt-get update && apt-get install -y unzip && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo pdo_mysql

COPY . /var/www/html

WORKDIR /var/www/html

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

EXPOSE ${PORT:-8080}

CMD php -S 0.0.0.0:${PORT:-8080} -t public
