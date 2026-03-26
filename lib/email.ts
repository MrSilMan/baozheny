import { Resend } from "resend";
import { logger } from "./logger";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "BaoZhen <noreply@baozhen.com>";

interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  react?: React.ReactElement;
  text?: string;
  replyTo?: string;
}): Promise<EmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      ...(params.react ? { react: params.react } : { text: params.text ?? "" }),
      replyTo: params.replyTo,
    });

    if (error) {
      logger.error("Email send failed", { error, to: params.to, subject: params.subject });
      return { success: false, error: error.message };
    }

    logger.info("Email sent", { id: data?.id, to: params.to, subject: params.subject });
    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("Email send exception", { message, to: params.to });
    return { success: false, error: message };
  }
}
