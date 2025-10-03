import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import  { MailerSend, Recipient, Sender, EmailParams } from 'mailersend';
import type { MailerSend as Mailer } from 'mailersend';
@Injectable()
export class MessagingService {
  private mailerSend: Mailer;

  constructor(private readonly configService: ConfigService) {
    this.mailerSend = new MailerSend({
      apiKey: this.configService.get<string|undefined>('MAILERSEND_API_TOKEN') ?? '',
    });
  }

  async sendEmailVerification(toEmail: string, verificationLink: string) {
    const from = new Sender('noreply@test-z0vklo6rzpvl7qrx.mlsender.net', 'Yosell Verification');
    const recipients = [new Recipient(toEmail)];

    const emailParams = new EmailParams()
      .setFrom(from)
      .setTo(recipients)
      .setSubject('Verify Your Email Address for Yosell')
      .setHtml(
        `<h1>Welcome to Yosell!</h1>
         <p>Please click the button below to verify your email address.</p>
         <a href="${verificationLink}" style="padding: 10px; background-color: #007bff; color: white; text-decoration: none;">Verify Email</a>
         <p>If you did not request this, please ignore this email.</p>`,
      )
      // For production, you would use a pre-designed template ID
      // .setTemplateId('your_template_id_here')
      // .setVariables([{ email: toEmail, substitutions: [...] }])
    
    try {
      await this.mailerSend.email.send(emailParams);
    } catch (error) {
      console.error('Error sending verification email:', error);
      // In production, you'd have more robust error handling/logging
    }
  }
}
