import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
}

export function PasswordResetEmail({ name, resetUrl }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your BaoZhen password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logo}>宝针 BaoZhen</Text>
          </Section>
          <Section style={content}>
            <Heading style={h1}>Password Reset</Heading>
            <Text style={text}>Hi {name},</Text>
            <Text style={text}>
              We received a request to reset your BaoZhen password. Click the button below to
              create a new password. This link expires in 1 hour.
            </Text>
            <Section style={btnContainer}>
              <Button style={button} href={resetUrl}>
                Reset Password
              </Button>
            </Section>
            <Text style={warningText}>
              If you didn&apos;t request a password reset, please ignore this email. Your password
              will remain unchanged.
            </Text>
            <Hr style={hr} />
            <Text style={footer}>
              BaoZhen &mdash; Buy from China, Built for the World
              <br />
              <Link href="https://baozhen.com" style={link}>
                baozhen.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f8f9fa",
  fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
};
const container = { margin: "0 auto", padding: "20px 0 48px", maxWidth: "560px" };
const logoSection = {
  padding: "32px 24px",
  backgroundColor: "#0f1a3c",
  borderRadius: "8px 8px 0 0",
  textAlign: "center" as const,
};
const logo = { color: "#c9a227", fontSize: "24px", fontWeight: "700", margin: "0" };
const content = {
  padding: "32px 24px",
  backgroundColor: "#ffffff",
  borderRadius: "0 0 8px 8px",
  border: "1px solid #e5e7eb",
  borderTop: "none",
};
const h1 = { color: "#0f1a3c", fontSize: "28px", fontWeight: "700", margin: "0 0 20px" };
const text = { color: "#374151", fontSize: "16px", lineHeight: "26px", margin: "0 0 16px" };
const warningText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 16px",
};
const btnContainer = { textAlign: "center" as const, margin: "32px 0" };
const button = {
  backgroundColor: "#c9a227",
  borderRadius: "6px",
  color: "#0f1a3c",
  fontSize: "16px",
  fontWeight: "600",
  padding: "14px 32px",
  textDecoration: "none",
  display: "inline-block",
};
const hr = { borderColor: "#e5e7eb", margin: "32px 0 24px" };
const footer = { color: "#9ca3af", fontSize: "14px", lineHeight: "22px", textAlign: "center" as const };
const link = { color: "#c9a227" };

export default PasswordResetEmail;
