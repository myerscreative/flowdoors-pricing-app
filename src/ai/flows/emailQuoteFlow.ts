'use server'
/**
 * @fileOverview A flow for emailing the generated quote PDF to a user.
 *
 * - emailQuote - A function that handles sending the email.
 * - EmailQuoteInput - The input type for the emailQuote function.
 */

import { ai } from '@/ai/genkit'
import type { SendMailOptions, SentMessageInfo } from 'nodemailer'
import * as nodemailer from 'nodemailer'
import { z } from 'zod'

const EmailQuoteInputSchema = z.object({
  to: z.string().email().describe('The email address of the recipient.'),
  name: z.string().describe('The name of the recipient.'),
  quoteId: z.string().describe('The quote identifier.'),
  pdfBase64: z.string().describe('The quote PDF encoded as a Base64 string.'),
})
export type EmailQuoteInput = z.infer<typeof EmailQuoteInputSchema>

export async function emailQuote(input: EmailQuoteInput): Promise<FlowResult> {
  return emailQuoteFlow(input)
}

type FlowResult = { success: boolean; message: string; messageId?: string }

function isPostmarkSmtpError(e: unknown): e is { responseCode?: number } {
  return typeof e === 'object' && e !== null && 'responseCode' in e
}

const emailQuoteFlow = ai.defineFlow(
  {
    name: 'emailQuoteFlow',
    inputSchema: EmailQuoteInputSchema,
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (input): Promise<FlowResult> => {
    // Allow only warn/error to satisfy eslint(no-console)
    console.warn('Email flow started with input:', {
      to: input.to,
      name: input.name,
      quoteId: input.quoteId,
      pdfLen: input.pdfBase64?.length ?? 0,
    })

    // Environment-aware Postmark token selection
    const isProduction = process.env.NODE_ENV === 'production'
    const postmarkApiToken = isProduction
      ? process.env.POSTMARK_API_TOKEN
      : process.env.POSTMARK_API_TOKEN_DEV

    const fromAddress = '"FlowDoors" <quotes@flowdoors.com>' // Must be a registered Sender Signature in Postmark
    const environment = isProduction ? 'PRODUCTION' : 'DEVELOPMENT'
    const expectedTokenVar = isProduction
      ? 'POSTMARK_API_TOKEN'
      : 'POSTMARK_API_TOKEN_DEV'

    console.warn(
      `Email flow running in ${environment} mode, expecting ${expectedTokenVar}`
    )

    if (
      !postmarkApiToken ||
      postmarkApiToken === 'YOUR_POSTMARK_API_TOKEN_HERE'
    ) {
      const errorMessage = `Postmark API token is not configured for ${environment}. Please set the ${expectedTokenVar} environment variable.`
      console.error(errorMessage)
      return { success: false, message: errorMessage }
    }

    if (!isProduction) {
      console.warn('⚠️ Using DEV Postmark server — all emails are test only')
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.postmarkapp.com', // Postmark SMTP server
      port: 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: postmarkApiToken, // Postmark Server API Token
        pass: postmarkApiToken, // Postmark Server API Token
      },
    })

    const mailOptions: SendMailOptions = {
      from: fromAddress,
      replyTo: 'sales@flowdoors.com',
      to: input.to,
      subject: `Your FlowDoors Quote (${input.quoteId}) is Attached`,
      html: `
        <p>Hello ${input.name},</p>
        <p>Thank you for your interest in FlowDoors. Please find your quote attached to this email.</p>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Best regards,</p>
        <p>The FlowDoors Team</p>
      `,
      attachments: [
        {
          filename: `Quote-${input.quoteId}.pdf`,
          content: input.pdfBase64,
          encoding: 'base64',
          contentType: 'application/pdf',
        },
      ],
      // Enable Postmark tracking
      headers: {
        'X-PM-Track-Opens': 'true',
        'X-PM-Track-Links': 'true',
      },
    }

    try {
      const info: SentMessageInfo = await transporter.sendMail(mailOptions)
      console.warn(
        `Email sent successfully via Postmark ${environment} server. Response:`,
        JSON.stringify(info, null, 2)
      )

      // Extract MessageID from Postmark response
      const messageId = (info as any)?.messageId || (info as any)?.MessageID

      return {
        success: true,
        message: `Email sent successfully via ${environment} Postmark server.`,
        messageId: messageId,
      }
    } catch (err: unknown) {
      console.error('Error sending email via Postmark:', err)
      let errorMessage = 'Failed to send email via Postmark.'
      if (isPostmarkSmtpError(err) && err.responseCode === 550) {
        errorMessage = `Failed to send email. This is often due to an unverified "from" address. Please ensure '${fromAddress}' is a confirmed Sender Signature in your Postmark account.`
      }
      return { success: false, message: errorMessage }
    }
  }
)
