import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface QuoteResponseEmailProps {
  buyerName: string;
  productTitle: string;
  supplierName: string;
  unitPrice: number;
  totalPrice: number;
  quantity: number;
  deliveryDays?: number;
  quoteUrl: string;
}

export function QuoteResponseEmail({
  buyerName,
  productTitle,
  supplierName,
  unitPrice,
  totalPrice,
  quantity,
  deliveryDays,
  quoteUrl,
}: QuoteResponseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Quote response received from {supplierName} — BaoZhen</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logo}>宝针 BaoZhen</Text>
          </Section>
          <Section style={content}>
            <Heading style={h1}>Quote Response Received</Heading>
            <Text style={text}>Hi {buyerName},</Text>
            <Text style={text}>
              <strong>{supplierName}</strong> has responded to your quote request for{" "}
              <strong>{productTitle}</strong>.
            </Text>
            <Section style={quoteBox}>
              <Text style={quoteLabel}>Quote Details</Text>
              <Text style={quoteItem}>
                Quantity: <strong>{quantity}</strong>
              </Text>
              <Text style={quoteItem}>
                Unit Price: <strong>${unitPrice.toFixed(2)}</strong>
              </Text>
              <Text style={quoteItem}>
                Total Price: <strong style={{ color: "#c9a227" }}>${totalPrice.toFixed(2)} USD</strong>
              </Text>
              {deliveryDays && (
                <Text style={quoteItem}>
                  Estimated Delivery: <strong>{deliveryDays} business days</strong>
                </Text>
              )}
            </Section>
            <Section style={btnContainer}>
              <Button style={button} href={quoteUrl}>
                View & Respond to Quote
              </Button>
            </Section>
            <Hr style={hr} />
            <Text style={footer}>BaoZhen &mdash; Buy from China, Built for the World</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f8f9fa", fontFamily: "'DM Sans', sans-serif" };
const container = { margin: "0 auto", padding: "20px 0 48px", maxWidth: "560px" };
const logoSection = { padding: "32px 24px", backgroundColor: "#0f1a3c", borderRadius: "8px 8px 0 0", textAlign: "center" as const };
const logo = { color: "#c9a227", fontSize: "24px", fontWeight: "700", margin: "0" };
const content = { padding: "32px 24px", backgroundColor: "#ffffff", borderRadius: "0 0 8px 8px", border: "1px solid #e5e7eb", borderTop: "none" };
const h1 = { color: "#0f1a3c", fontSize: "28px", fontWeight: "700", margin: "0 0 20px" };
const text = { color: "#374151", fontSize: "16px", lineHeight: "26px", margin: "0 0 16px" };
const quoteBox = { backgroundColor: "#f3f4f6", borderRadius: "8px", padding: "20px", margin: "24px 0" };
const quoteLabel = { color: "#6b7280", fontSize: "12px", margin: "0 0 12px", textTransform: "uppercase" as const, fontWeight: "600" };
const quoteItem = { color: "#374151", fontSize: "15px", margin: "0 0 8px" };
const btnContainer = { textAlign: "center" as const, margin: "32px 0" };
const button = { backgroundColor: "#c9a227", borderRadius: "6px", color: "#0f1a3c", fontSize: "16px", fontWeight: "600", padding: "14px 32px", textDecoration: "none", display: "inline-block" };
const hr = { borderColor: "#e5e7eb", margin: "32px 0 24px" };
const footer = { color: "#9ca3af", fontSize: "14px", textAlign: "center" as const };

export default QuoteResponseEmail;
