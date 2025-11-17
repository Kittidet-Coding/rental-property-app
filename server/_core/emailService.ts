import { ENV } from "./env";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Send email using the Manus built-in email service
 * Returns true if successful, false if the service is unavailable
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    console.warn("[Email] Email service not configured");
    return false;
  }

  try {
    const endpoint = new URL(
      "webdevtoken.v1.WebDevService/SendEmail",
      ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`
    ).toString();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Email] Failed to send email (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.warn("[Email] Error sending email:", error);
    return false;
  }
}

/**
 * Send inquiry notification email to landlord
 */
export async function sendInquiryNotificationToLandlord(
  landlordEmail: string,
  landlordName: string,
  propertyTitle: string,
  renterName: string,
  renterEmail: string,
  renterPhone: string | null,
  message: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0066cc; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; color: #0066cc; }
          .button { display: inline-block; background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Inquiry for Your Property</h1>
          </div>
          <div class="content">
            <p>Hello ${landlordName},</p>
            
            <p>You have received a new inquiry for your property:</p>
            
            <div class="section">
              <p><span class="label">Property:</span> ${propertyTitle}</p>
            </div>
            
            <div class="section">
              <h3>Renter Details:</h3>
              <p><span class="label">Name:</span> ${renterName}</p>
              <p><span class="label">Email:</span> <a href="mailto:${renterEmail}">${renterEmail}</a></p>
              ${renterPhone ? `<p><span class="label">Phone:</span> ${renterPhone}</p>` : ""}
            </div>
            
            <div class="section">
              <h3>Message:</h3>
              <p>${message.replace(/\n/g, "<br>")}</p>
            </div>
            
            <p>Please respond to the renter at your earliest convenience.</p>
            
            <p>Best regards,<br>Rental Property Center</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: landlordEmail,
    subject: `New Inquiry: ${propertyTitle}`,
    html,
  });
}

/**
 * Send confirmation email to renter
 */
export async function sendInquiryConfirmationToRenter(
  renterEmail: string,
  renterName: string,
  propertyTitle: string,
  landlordName: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0066cc; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; color: #0066cc; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Inquiry Received</h1>
          </div>
          <div class="content">
            <p>Hello ${renterName},</p>
            
            <p>Thank you for your interest in the following property:</p>
            
            <div class="section">
              <p><span class="label">Property:</span> ${propertyTitle}</p>
              <p><span class="label">Landlord:</span> ${landlordName}</p>
            </div>
            
            <p>Your inquiry has been sent successfully. The landlord will review your message and respond to you as soon as possible.</p>
            
            <p>We appreciate your interest in our rental platform!</p>
            
            <p>Best regards,<br>Rental Property Center</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: renterEmail,
    subject: `Inquiry Confirmation: ${propertyTitle}`,
    html,
  });
}
