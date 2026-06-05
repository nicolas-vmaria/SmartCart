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
        $this->mail->Timeout    = 10;

        $this->mail->setFrom($_ENV['MAIL_USER'], $_ENV['MAIL_FROM_NAME']);
    }

    public function send(string $para, string $assunto, string $corpo, string $replyTo = '', ?string $anexoConteudo = null, string $anexoNome = 'anexo.pdf'): void {
        $this->mail->addAddress($para);
        if ($replyTo) {
            $this->mail->addCustomHeader('Reply-To', $replyTo);
        }
        if ($anexoConteudo !== null) {
            $this->mail->addStringAttachment($anexoConteudo, $anexoNome, 'base64', 'application/pdf');
        }
        $this->mail->CharSet = 'UTF-8';
        $this->mail->Subject = $assunto;
        $this->mail->isHTML(true);
        $this->mail->Body    = $corpo;
        $this->mail->send();
    }
}
