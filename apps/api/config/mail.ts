import { defineConfig, transports, Message as MailMessage } from '@adonisjs/mail'
import { render } from '@react-email/render'

import env from '#start/env'

const mailConfig = defineConfig({
  default: 'smtp',

  /**
   * The mailers object can be used to configure multiple mailers
   * each using a different transport or same transport with different
   * options.
   * 
   * For development with Maildev (via Docker Compose):
   * - SMTP_HOST=127.0.0.1 (or 'maildev' if API runs in Docker)
   * - SMTP_PORT=1025
   * - No authentication needed
   * - Web interface available at http://localhost:1080
  */
  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST'),
      port: env.get('SMTP_PORT'),
      secure: false, // Maildev doesn't use TLS
      /**
       * Authentication is not required for Maildev
       * Uncomment the auth block only for production SMTP servers
       */
      /* auth: {
        type: 'login',
        user: env.get('SMTP_USERNAME'),
        pass: env.get('SMTP_PASSWORD'),
      }, */
    }),
  },
})

MailMessage.templateEngine = {
  async render(templatePath: string, _: any, data: any) {
    const emailModule = await import(templatePath)
    const EmailComponent = emailModule.default

    return await render(EmailComponent(data))
  }
}

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> { }
}
export default mailConfig