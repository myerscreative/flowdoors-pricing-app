import nodemailer from 'nodemailer'
import { ServerClient } from 'postmark'

// Environment detection
const isProduction = process.env.NODE_ENV === 'production'

// DEBUG: Comprehensive environment logging
console.warn('🔍 POSTMARK DEBUG - Environment check:')
console.warn('NODE_ENV:', process.env.NODE_ENV)
console.warn('isProduction:', isProduction)
console.warn(
  'All POSTMARK vars:',
  Object.keys(process.env).filter((k) => k.includes('POSTMARK'))
)
console.warn('POSTMARK_API_TOKEN exists:', !!process.env.POSTMARK_API_TOKEN)
console.warn(
  'POSTMARK_API_TOKEN_DEV exists:',
  !!process.env.POSTMARK_API_TOKEN_DEV
)
console.warn(
  'POSTMARK_API_TOKEN length:',
  process.env.POSTMARK_API_TOKEN?.length
)
console.warn(
  'POSTMARK_API_TOKEN_DEV length:',
  process.env.POSTMARK_API_TOKEN_DEV?.length
)

// Pick the correct token based on environment
const postmarkToken = isProduction
  ? process.env.POSTMARK_API_TOKEN
  : process.env.POSTMARK_API_TOKEN_DEV

console.warn(
  'Selected token for',
  isProduction ? 'PRODUCTION' : 'DEVELOPMENT',
  ':',
  !!postmarkToken
)
console.warn('Selected token length:', postmarkToken?.length)

// Initialize Postmark client (only if token exists)
export const postmarkClient = postmarkToken
  ? new ServerClient(postmarkToken)
  : null

// Log which environment and token we're using
if (postmarkClient) {
  const tokenType = isProduction ? 'PRODUCTION' : 'DEVELOPMENT'
  const maskedToken = postmarkToken!.substring(0, 6) + '...'
  console.warn(`🔑 Postmark ${tokenType} token found: ${maskedToken}`)

  // Special production logging
  if (isProduction && postmarkToken) {
    console.warn(
      '✅ Production Postmark Token Loaded:',
      postmarkToken.substring(0, 6) + '...'
    )
  }

  if (!isProduction) {
    console.warn('⚠️ Using DEV Postmark server — all emails are test only')
  }
} else {
  console.warn('⚠️ No Postmark token configured for current environment')
}

interface WelcomeEmailData {
  to: string
  name: string
  activationToken: string
  salesperson_id: string
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
}

// Utility: send email with environment awareness
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = 'FlowDoors <sales@flowdoors.com>',
}: EmailOptions) {
  // Environment info logging
  const envInfo = {
    environment: isProduction ? 'PRODUCTION' : 'DEVELOPMENT',
    hasToken: !!postmarkToken,
    tokenType: isProduction ? 'POSTMARK_API_TOKEN' : 'POSTMARK_API_TOKEN_DEV',
  }

  console.warn('📧 Email Service Debug:', envInfo)

  if (!postmarkClient) {
    console.warn(
      "⚠️ Postmark token not configured. Email not sent. Here's the details instead:"
    )
    console.warn(`Environment: ${envInfo.environment}`)
    console.warn(`Expected token: ${envInfo.tokenType}`)
    console.warn(`To: ${to}`)
    console.warn(`Subject: ${subject}`)
    console.warn(`From: ${from}`)
    console.warn(`Body: ${text || html.substring(0, 200)}...`)

    return {
      success: false,
      message: `Postmark token not configured for ${envInfo.environment} environment`,
      environment: envInfo,
    }
  }

  // Dev safety warning
  if (!isProduction) {
    console.warn('⚠️ Using DEV Postmark server — all emails are test only')
  }

  try {
    console.warn(
      `📤 Attempting to send email via Postmark ${envInfo.environment} server...`
    )

    const result = await postmarkClient.sendEmail({
      From: from,
      To: to,
      Subject: subject,
      HtmlBody: html,
      TextBody: text,
    })

    console.warn('✅ Email sent successfully!')
    console.warn('  Environment:', envInfo.environment)
    console.warn('  Message ID:', result.MessageID)
    console.warn('  Submitted At:', result.SubmittedAt)
    console.warn('  To:', result.To)
    console.warn('  From:', from)

    return {
      success: true,
      data: result,
      environment: envInfo,
    }
  } catch (err: any) {
    console.error('❌ Failed to send email via Postmark:', err)

    // Enhanced error logging
    const errorDetails = {
      name: err.name,
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      recipients: err.recipients,
      environment: envInfo.environment,
    }

    console.error('❌ Error details:', errorDetails)

    return {
      success: false,
      message: `Email service error in ${envInfo.environment}`,
      error: errorDetails,
      environment: envInfo,
    }
  }
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const { to, name, activationToken, salesperson_id } = data

  // Create activation link with comprehensive environment variable checking
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'http://localhost:3000'
  const activationLink = `${baseUrl}/activate-account?token=${activationToken}&email=${encodeURIComponent(to)}`

  // Enhanced debug logging with environment variable details
  console.warn('📧 SENDING WELCOME EMAIL - DEBUG INFO:')
  console.warn('  Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT')
  console.warn('  NODE_ENV:', process.env.NODE_ENV)
  console.warn('  NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
  console.warn('  NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL)
  console.warn('  Selected Base URL:', baseUrl)
  console.warn('  Recipient:', to)
  console.warn('  Name:', name)
  console.warn('  Salesperson ID:', salesperson_id)
  console.warn('  Activation Token:', activationToken.substring(0, 8) + '...')
  console.warn('  Activation Link:', activationLink)

  // If no postmark client, log activation details for development
  if (!postmarkClient) {
    console.warn('📧 ACTIVATION LINK FOR DEVELOPMENT:', activationLink)
    console.warn('📧 User Details:', { name, email: to, salesperson_id })
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to FlowDoors Sales Portal</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
        .highlight { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        .env-badge { background: ${isProduction ? '#dc2626' : '#059669'}; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to FlowDoors Sales Portal!</h1>
          <p>Your account has been created successfully</p>
          ${!isProduction ? '<div class="env-badge">DEV ENVIRONMENT</div>' : ''}
        </div>
        
        <div class="content">
          <h2>Hello ${name},</h2>
          
          <p>Welcome to the FlowDoors Sales Portal! Your account has been created with the following details:</p>
          
          <div class="highlight">
            <strong>Salesperson ID:</strong> ${salesperson_id}<br>
            <strong>Email:</strong> ${to}<br>
            <strong>Status:</strong> Pending Activation
          </div>
          
          <p>To complete your account setup and access the portal, you need to:</p>
          
          <ol>
            <li><strong>Activate your account</strong> using the button below</li>
            <li><strong>Set your password</strong> during the activation process</li>
            <li><strong>Log in</strong> to the portal with your new credentials</li>
          </ol>
          
          <div style="text-align: center;">
            <a href="${activationLink}" class="button">Activate Account & Set Password</a>
          </div>
          
          <p><strong>Important:</strong> This activation link will expire in 48 hours for security reasons.</p>
          
          <p>If you have any questions or need assistance, please contact our support team:</p>
          <ul>
            <li>📧 support@flowdoors.com</li>
            <li>📞 760-917-1716</li>
            <li>🕒 Mon-Fri 8AM-6PM PST</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>© 2024 FlowDoors. All rights reserved.</p>
          <p>This email was sent to ${to} as part of your account setup process.</p>
          ${!isProduction ? '<p><em>This email was sent from the DEVELOPMENT environment.</em></p>' : ''}
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const result = await sendEmail({
      to,
      subject: 'Welcome to FlowDoors Sales Portal - Activate Your Account',
      html: emailHtml,
      from: 'FlowDoors <sales@flowdoors.com>',
    })

    if (!result.success && !postmarkClient) {
      // Log activation link for development when no email service is available
      console.warn('📧 ACTIVATION LINK FOR DEVELOPMENT:', activationLink)
      console.warn('📧 User Details:', { name, email: to, salesperson_id })
    }

    return result
  } catch (error: any) {
    console.error('❌ Welcome email service error:', error)
    console.warn('📧 ACTIVATION LINK FOR DEVELOPMENT:', activationLink)
    console.warn('📧 User Details:', { name, email: to, salesperson_id })

    return {
      success: false,
      message: `Welcome email service error - check console for activation link`,
      error: error,
      activationLink, // Include for development debugging
    }
  }
}

// Fallback email service using a different provider if needed
export async function sendWelcomeEmailFallback(data: WelcomeEmailData) {
  console.warn('Fallback email service - would send email to:', data.to)
  return { success: true, message: 'Email logged (fallback mode)' }
}

// Quote notification email interface
interface QuoteNotificationData {
  quoteId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  totalAmount: number
  itemCount: number
  productTypes: string[]
  createdAt: Date
  salesRep?: string
}

// Send notification email when a quote is created
export async function sendQuoteNotificationEmail(data: QuoteNotificationData) {
  if (!postmarkClient) {
    console.warn('⚠️ No Postmark client available for quote notification email')
    return { success: false, message: 'Email service not configured' }
  }

  const {
    quoteId,
    customerName,
    customerEmail,
    customerPhone,
    totalAmount,
    itemCount,
    productTypes,
    createdAt,
    salesRep,
  } = data

  const formattedDate = createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  const productTypesList =
    productTypes.length > 0 ? productTypes.join(', ') : 'Not specified'
  const salesRepInfo = salesRep
    ? `<strong>Sales Rep:</strong> ${salesRep}<br>`
    : ''

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Quote Created - ${quoteId}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2563eb; color: white; padding: 20px; margin: -30px -30px 30px -30px; border-radius: 8px 8px 0 0; }
        .highlight { background: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #059669; }
        .info-row { margin: 10px 0; }
        .info-label { font-weight: bold; color: #374151; }
        .info-value { color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 New Quote Created</h1>
          <p>Quote ID: ${quoteId}</p>
        </div>
        
        <div class="highlight">
          <h2>Customer Information</h2>
          <div class="info-row">
            <span class="info-label">Name:</span> <span class="info-value">${customerName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span> <span class="info-value">${customerEmail}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone:</span> <span class="info-value">${customerPhone}</span>
          </div>
          ${salesRepInfo}
        </div>
        
        <div class="highlight">
          <h2>Quote Details</h2>
          <div class="info-row">
            <span class="info-label">Total Amount:</span> <span class="amount">$${totalAmount.toLocaleString()}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Number of Items:</span> <span class="info-value">${itemCount}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Product Types:</span> <span class="info-value">${productTypesList}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Created:</span> <span class="info-value">${formattedDate}</span>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://app.flowdoors.com/admin/quotes" class="button">View Quote in Admin Panel</a>
        </div>
        
        <div class="footer">
          <p><strong>FlowDoors Quote Notification System</strong></p>
          <p>This notification was automatically generated when a new quote was created by a site visitor.</p>
          <p>Quote ID: ${quoteId} | Generated: ${formattedDate}</p>
          ${!isProduction ? '<p><em>This notification was sent from the DEVELOPMENT environment.</em></p>' : ''}
        </div>
      </div>
    </body>
    </html>
  `

  try {
    // Get quote notification recipients
    const { getQuoteRecipients } = await import('@/lib/notificationSettings')
    const recipients = await getQuoteRecipients()

    if (recipients.length === 0) {
      console.warn('⚠️ No quote notification recipients configured')
      return {
        success: false,
        message: 'No quote notification recipients configured',
      }
    }

    // Send to all configured recipients
    const results = []
    for (const recipient of recipients) {
      const result = await sendEmail({
        to: recipient,
        subject: `New Quote Created: ${quoteId} - ${customerName} ($${totalAmount.toLocaleString()})`,
        html: emailHtml,
        from: 'FlowDoors <sales@flowdoors.com>',
      })
      results.push({ recipient, ...result })
    }

    const allSuccessful = results.every((r) => r.success)
    const result = {
      success: allSuccessful,
      message: allSuccessful
        ? `Quote notification sent to ${recipients.length} recipients`
        : `Some notifications failed: ${results
            .filter((r) => !r.success)
            .map((r) => r.recipient)
            .join(', ')}`,
      results,
    }

    console.warn('📧 Quote notification email sent:', {
      quoteId,
      customerName,
      totalAmount,
      success: result.success,
    })

    return result
  } catch (error: any) {
    console.error('❌ Quote notification email error:', error)
    return {
      success: false,
      message: `Quote notification email error: ${error.message}`,
      error: error,
    }
  }
}

// Unified notification data interface
interface NotificationData {
  type: 'Lead' | 'Quote'
  id: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  timestamp: Date
  // Additional fields for quotes
  totalAmount?: number
  itemCount?: number
  productTypes?: string[]
  salesRep?: string
}

// Send unified notification emails to marketing and manager
export async function sendNotificationEmails(data: NotificationData) {
  const { type, id, customerName, customerEmail, customerPhone, timestamp } =
    data

  // Hardcoded recipients to ensure notifications always work
  let recipients: string[]

  if (type === 'Quote') {
    // Hardcoded quote notification recipients
    recipients = [
      'zach@flowdoors.com',
      'brody@flowdoors.com',
      'robert@flowdoors.com',
    ]
    console.warn(
      '📧 Using hardcoded quote notification recipients:',
      recipients
    )
  } else {
    // Hardcoded lead notification recipients
    recipients = [
      'zach@flowdoors.com',
      'brody@flowdoors.com',
      'robert@flowdoors.com',
    ]
    console.warn('📧 Using hardcoded lead notification recipients:', recipients)
  }

  // Dev-only logging
  console.warn('[notifyEmail]', { type, id, customerName })

  // Add dev-only log confirming recipients for both types
  console.warn(`[notifyEmail][${type.toLowerCase()}]`, { to: recipients, id })

  // Environment detection for email template (using existing isProduction from top of file)

  const formattedDate = timestamp.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  const phoneDisplay = customerPhone || 'Not provided'

  // Build additional details for quotes
  let additionalDetails = ''
  if (type === 'Quote' && data.totalAmount !== undefined) {
    const productTypesList =
      data.productTypes && data.productTypes.length > 0
        ? data.productTypes.join(', ')
        : 'Not specified'
    const salesRepInfo = data.salesRep ? `- Sales Rep: ${data.salesRep}` : ''

    additionalDetails = `
      <div class="highlight">
        <h3>Quote Details</h3>
        <div class="info-row">
          <span class="info-label">Total Amount:</span> <span class="amount">$${data.totalAmount.toLocaleString()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Number of Items:</span> <span class="info-value">${data.itemCount || 0}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Product Types:</span> <span class="info-value">${productTypesList}</span>
        </div>
        ${salesRepInfo ? `<div class="info-row"><span class="info-label">Sales Rep:</span> <span class="info-value">${salesRepInfo}</span></div>` : ''}
      </div>
    `
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>[FlowDoors] New ${type} Completed – ID #${id}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2563eb; color: white; padding: 20px; margin: -30px -30px 30px -30px; border-radius: 8px 8px 0 0; }
        .highlight { background: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #059669; }
        .info-row { margin: 10px 0; }
        .info-label { font-weight: bold; color: #374151; }
        .info-value { color: #6b7280; }
        .env-badge { background: ${isProduction ? '#dc2626' : '#059669'}; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 New ${type} Completed</h1>
          <p>ID: #${id}</p>
          ${!isProduction ? '<div class="env-badge">DEV ENVIRONMENT</div>' : ''}
        </div>
        
        <p>Hello Team,</p>
        <p>A new ${type.toLowerCase()} has just been completed in the FlowDoors system.</p>
        
        <div class="highlight">
          <h2>Details:</h2>
          <div class="info-row">
            <span class="info-label">Type:</span> <span class="info-value">${type}</span>
          </div>
          <div class="info-row">
            <span class="info-label">ID:</span> <span class="info-value">${id}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Customer:</span> <span class="info-value">${customerName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span> <span class="info-value">${customerEmail}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone:</span> <span class="info-value">${phoneDisplay}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Completed At:</span> <span class="info-value">${formattedDate}</span>
          </div>
        </div>
        
        ${additionalDetails}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://app.flowdoors.com/admin/${type.toLowerCase()}s" class="button">View in Admin Panel</a>
        </div>
        
        <div class="footer">
          <p><strong>FlowDoors System</strong></p>
          <p>Please log in to the admin panel to review full details and track progress.</p>
          <p>${type} ID: ${id} | Generated: ${formattedDate}</p>
          ${!isProduction ? '<p><em>This notification was sent from the DEVELOPMENT environment.</em></p>' : ''}
        </div>
      </div>
    </body>
    </html>
  `

  const subject = `[FlowDoors] New ${type} Completed – ID #${id}`

  // Use the same SMTP approach as working quote emails
  // Environment-aware Postmark token selection (same as emailQuoteFlow)
  const postmarkApiToken = isProduction
    ? process.env.POSTMARK_API_TOKEN
    : process.env.POSTMARK_API_TOKEN_DEV

  const fromAddress = '"FlowDoors" <sales@flowdoors.com>' // Must be a registered Sender Signature in Postmark
  const environment = isProduction ? 'PRODUCTION' : 'DEVELOPMENT'
  const expectedTokenVar = isProduction
    ? 'POSTMARK_API_TOKEN'
    : 'POSTMARK_API_TOKEN_DEV'

  console.warn(
    `Notification email flow running in ${environment} mode, expecting ${expectedTokenVar}`
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

  // Send to recipients using SMTP (same as working quote emails)
  const results = []

  for (const recipient of recipients) {
    try {
      const mailOptions = {
        from: fromAddress,
        replyTo: 'sales@flowdoors.com',
        to: recipient,
        subject,
        html: emailHtml,
        // Enable Postmark tracking
        headers: {
          'X-PM-Track-Opens': 'true',
          'X-PM-Track-Links': 'true',
        },
      }

      const info = await transporter.sendMail(mailOptions)
      console.warn(
        `✅ Notification email sent successfully to ${recipient} via ${environment} Postmark server`
      )
      console.warn(
        '  Message ID:',
        (info as any)?.messageId || (info as any)?.MessageID
      )

      results.push({ recipient, success: true, error: null })

      console.warn(`[notify] ${type.toLowerCase()} complete`, {
        id,
        email: recipient,
      })
    } catch (error: any) {
      console.error(
        `❌ Failed to send notification email to ${recipient}:`,
        error
      )
      results.push({ recipient, success: false, error: error.message })
    }
  }

  const allSuccessful = results.every((r) => r.success)

  return {
    success: allSuccessful,
    message: allSuccessful
      ? `Notifications sent to ${recipients.length} recipients`
      : `Some notifications failed: ${results
          .filter((r) => !r.success)
          .map((r) => r.recipient)
          .join(', ')}`,
    results,
  }
}

// Export environment info for other services to use
export const emailEnvironmentInfo = {
  isProduction,
  hasToken: !!postmarkToken,
  tokenType: isProduction ? 'POSTMARK_API_TOKEN' : 'POSTMARK_API_TOKEN_DEV',
  environment: isProduction ? 'PRODUCTION' : 'DEVELOPMENT',
  maskedToken: postmarkToken ? postmarkToken.substring(0, 6) + '...' : null,
}
