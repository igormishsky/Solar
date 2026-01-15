import nodemailer from 'nodemailer';

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SENDGRID_API_KEY || process.env.SMTP_PASSWORD || '',
  },
};

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@solar-crm.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Solar CRM';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// Check if email is configured
export const isEmailConfigured = !!(
  EMAIL_CONFIG.auth.pass &&
  EMAIL_FROM
);

// Create transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Email types
export type EmailTemplate =
  | 'welcome'
  | 'password-reset'
  | 'task-assigned'
  | 'project-status'
  | 'license-expiry'
  | 'form-approved'
  | 'form-rejected'
  | 'form-submitted';

export interface EmailData {
  to: string;
  template: EmailTemplate;
  data: Record<string, unknown>;
  subject?: string;
}

// Template definitions
const templates: Record<EmailTemplate, { subject: string; html: (data: Record<string, unknown>) => string }> = {
  welcome: {
    subject: 'Welcome to Solar CRM',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Solar CRM!</h1>
          </div>
          <div class="content">
            <p>Hello ${data.name || 'there'},</p>
            <p>Your account has been created successfully. You can now access the Solar CRM system to manage your solar installation projects.</p>
            <p><a href="${APP_URL}" class="button">Go to Dashboard</a></p>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>This email was sent by Solar CRM. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  'password-reset': {
    subject: 'Reset Your Password',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 16px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p><a href="${data.resetUrl}" class="button">Reset Password</a></p>
            <div class="warning">
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            </div>
          </div>
          <div class="footer">
            <p>This email was sent by Solar CRM. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  'task-assigned': {
    subject: 'New Task Assigned to You',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .task-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0; }
          .priority { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .priority-urgent { background: #fef2f2; color: #dc2626; }
          .priority-high { background: #fff7ed; color: #ea580c; }
          .priority-medium { background: #eff6ff; color: #2563eb; }
          .priority-low { background: #f3f4f6; color: #6b7280; }
          .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Task Assigned</h1>
          </div>
          <div class="content">
            <p>Hello ${data.assigneeName || 'there'},</p>
            <p>A new task has been assigned to you:</p>
            <div class="task-card">
              <h3>${data.taskTitle}</h3>
              <p>${data.taskDescription || 'No description provided.'}</p>
              <p><span class="priority priority-${data.priority || 'medium'}">${(data.priority || 'medium').toUpperCase()}</span></p>
              ${data.dueDate ? `<p><strong>Due:</strong> ${data.dueDate}</p>` : ''}
              ${data.projectName ? `<p><strong>Project:</strong> ${data.projectName}</p>` : ''}
            </div>
            <p><a href="${APP_URL}/task/${data.taskId}" class="button">View Task</a></p>
          </div>
          <div class="footer">
            <p>This email was sent by Solar CRM. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  'project-status': {
    subject: 'Project Status Update',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
          .status-completed { background: #ecfdf5; color: #059669; }
          .status-in_progress { background: #eff6ff; color: #2563eb; }
          .status-pending { background: #fef3c7; color: #d97706; }
          .status-on_hold { background: #f3f4f6; color: #6b7280; }
          .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Project Status Update</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>The status of project <strong>${data.projectName}</strong> has been updated:</p>
            <p>
              <span class="status-badge status-${data.oldStatus}">${data.oldStatus?.replace('_', ' ').toUpperCase()}</span>
              &rarr;
              <span class="status-badge status-${data.newStatus}">${data.newStatus?.replace('_', ' ').toUpperCase()}</span>
            </p>
            ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
            <p><a href="${APP_URL}/project/${data.projectId}" class="button">View Project</a></p>
          </div>
          <div class="footer">
            <p>This email was sent by Solar CRM. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  'license-expiry': {
    subject: 'License Expiring Soon',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .warning { background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 16px 0; }
          .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>License Expiry Warning</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <div class="warning">
              <p><strong>The following professional license is expiring soon:</strong></p>
              <p><strong>Professional:</strong> ${data.professionalName}</p>
              <p><strong>License Type:</strong> ${data.licenseType}</p>
              <p><strong>License Number:</strong> ${data.licenseNumber}</p>
              <p><strong>Expiry Date:</strong> ${data.expiryDate}</p>
              <p><strong>Days Until Expiry:</strong> ${data.daysUntilExpiry}</p>
            </div>
            <p>Please ensure the license is renewed before the expiry date to avoid any disruption to your projects.</p>
            <p><a href="${APP_URL}/professionals/${data.professionalId}" class="button">View Professional</a></p>
          </div>
          <div class="footer">
            <p>This email was sent by Solar CRM. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  'form-approved': {
    subject: 'Form Approved',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .success { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 8px; margin: 16px 0; }
          .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Form Approved</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <div class="success">
              <p><strong>The following form has been approved:</strong></p>
              <p><strong>Form:</strong> ${data.formName}</p>
              <p><strong>Project:</strong> ${data.projectName}</p>
              <p><strong>Approved By:</strong> ${data.approvedBy}</p>
              <p><strong>Approved At:</strong> ${data.approvedAt}</p>
            </div>
            <p><a href="${APP_URL}/project/${data.projectId}/forms" class="button">View Form</a></p>
          </div>
          <div class="footer">
            <p>This email was sent by Solar CRM. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  'form-rejected': {
    subject: 'Form Rejected',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .error { background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 16px 0; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Form Rejected</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <div class="error">
              <p><strong>The following form has been rejected:</strong></p>
              <p><strong>Form:</strong> ${data.formName}</p>
              <p><strong>Project:</strong> ${data.projectName}</p>
              <p><strong>Rejected By:</strong> ${data.rejectedBy}</p>
              <p><strong>Reason:</strong> ${data.reason || 'No reason provided'}</p>
            </div>
            <p>Please review the form and make the necessary corrections before resubmitting.</p>
            <p><a href="${APP_URL}/project/${data.projectId}/forms" class="button">Edit Form</a></p>
          </div>
          <div class="footer">
            <p>This email was sent by Solar CRM. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  'form-submitted': {
    subject: 'Form Submitted for Review',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .info { background: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 8px; margin: 16px 0; }
          .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Form Submitted</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <div class="info">
              <p><strong>A form has been submitted for your review:</strong></p>
              <p><strong>Form:</strong> ${data.formName}</p>
              <p><strong>Project:</strong> ${data.projectName}</p>
              <p><strong>Submitted By:</strong> ${data.submittedBy}</p>
              <p><strong>Submitted At:</strong> ${data.submittedAt}</p>
            </div>
            <p><a href="${APP_URL}/project/${data.projectId}/forms" class="button">Review Form</a></p>
          </div>
          <div class="footer">
            <p>This email was sent by Solar CRM. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
};

/**
 * Send an email using a template
 */
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  if (!isEmailConfigured) {
    console.warn('Email not configured. Skipping email send.');
    return false;
  }

  const template = templates[emailData.template];
  if (!template) {
    console.error(`Unknown email template: ${emailData.template}`);
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
      to: emailData.to,
      subject: emailData.subject || template.subject,
      html: template.html(emailData.data),
    });

    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send bulk emails (for notifications to multiple users)
 */
export async function sendBulkEmails(
  emails: EmailData[]
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const email of emails) {
    const sent = await sendEmail(email);
    if (sent) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Verify email configuration is working
 */
export async function verifyEmailConfig(): Promise<boolean> {
  if (!isEmailConfigured) {
    return false;
  }

  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}
