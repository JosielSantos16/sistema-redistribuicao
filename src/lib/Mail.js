class Mail {
  async sendMail({ to, subject }) {
    console.log(`[E-MAIL DESATIVADO] Seria enviado para "${to}": "${subject}"`);
    return null;
  }
}

export default new Mail();