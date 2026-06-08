<?php

require_once __DIR__ . '/../vendor/autoload.php';

$_ENV['JWT_SECRET']       = 'test-secret-key-for-unit-tests';
$_ENV['BREVO_API_KEY']    = 'test-key';
$_ENV['MAIL_USER']        = 'test@test.com';
$_ENV['MAIL_FROM_NAME']   = 'SmartCart Test';
$_ENV['FRONTEND_URL']     = 'http://localhost:5173';
$_ENV['DB_HOST']          = 'localhost';
$_ENV['DB_NAME']          = 'test';
$_ENV['DB_USER']          = 'test';
$_ENV['DB_PASS']          = 'test';
$_ENV['DB_PORT']          = '3306';
$_ENV['CLOUDINARY_CLOUD_NAME'] = 'test';
$_ENV['CLOUDINARY_API_KEY']    = 'test';
$_ENV['CLOUDINARY_API_SECRET'] = 'test';
