<?php

class Mailer {
    private PHPMailer\PHPMailer\PHPMailer $mail;

    public function __construct() {
        $this->mail = new PHPMailer\PHPMailer\PHPMailer(true);

        $this->mail->isSMTP();
        $this->mail->Host       = 'smtp.gmail.com';
        $this->mail->SMTPAuth   = true;
        $this->mail->Username   = $_ENV['MAIL_USER'];
        $this->mail->Password   = $_ENV['MAIL_PASS'];
        $this->mail->SMTPSecure = 'tls';
        $this->mail->Port       = 587;

        $this->mail->setFrom($_ENV['MAIL_USER'], $_ENV['MAIL_FROM_NAME']);
    }

    public function send(string $para, string $assunto, string $corpo): void {
        $this->mail->addAddress($para);
        $this->mail->CharSet = 'UTF-8';
        $this->mail->Subject = $assunto;
        $this->mail->isHTML(true);
        $this->mail->Body    = $corpo;
        $this->mail->send();
    }
}
