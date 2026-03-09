import nodemailer from "nodemailer";
import { resolve } from "path";
import { create } from "express-handlebars";
import nodemailerhbs from "nodemailer-express-handlebars";

class Mail {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "josielufopa@gmail.com",
        pass: "fogq lrfb rslk xqbw",
      },
    });

    this.configureTemplates();
  }

  configureTemplates() {
    const viewPath = resolve(__dirname, "..", "views", "emails");

    this.transporter.use(
      "compile",
      nodemailerhbs({
        viewEngine: create({
          layoutsDir: resolve(viewPath, "layouts"),
          partialsDir: resolve(viewPath, "partials"),
          defaultLayout: "default",
          extname: ".hbs",
        }),
        viewPath,
        extName: ".hbs",
      }),
    );
  }

  sendMail(message) {
    return this.transporter.sendMail({
      from: "Sistema Redistribuição <josielufopa@gmail.com>",
      ...message,
    });
  }
}

export default new Mail();
