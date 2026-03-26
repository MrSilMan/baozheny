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

interface ShipmentDispatchedEmailProps {
  buyerName: string;
  orderNumber: string;
  carrier: string;
  trackingNumber: string;
  estimatedDelivery?: string;
  trackingUrl: string;
}

export function ShipmentDispatchedEmail({
  buyerName,
  orderNumber,
  carrier,
  trackingNumber,
  estimatedDelivery,
  trackingUrl,
}: ShipmentDispatchedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your order #{orderNumber} has been shipped — BaoZhen</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logo}>宝针 BaoZhen</Text>
          </Section>
          <Section style={content}>
            <Heading style={h1}>Your Order is On Its Way!</Heading>
            <Text style={text}>Hi {buyerName},</Text>
            <Text style={text}>
              Great news! Your order <strong>#{orderNumber}</strong> has been dispatched and is on
              its way to you.
            </Text>
            <Section style={trackingBox}>
              <Text style={trackingLabel}>Tracking Information</Text>
              <Text style={trackingItem}>
                Carrier: <strong>{carrier}</strong>
              </Text>
              <Text style={trackingItem}>
                Tracking Number: <strong style={{ color: "#c9a227" }}>{trackingNumber}</strong>
              </Text>
              {estimatedDelivery && (
                <Text style={trackingItem}>
                  Estimated Delivery: <strong>{estimatedDelivery}</strong>
                </Text>
              )}
            </Section>
            <Section style={btnContainer}>
              <Button style={button} href={trackingUrl}>
                Track Your Shipment
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
const trackingBox = { backgroundColor: "#f3f4f6", borderRadius: "8px", padding: "20px", margin: "24px 0" };
const trackingLabel = { color: "#6b7280", fontSize: "12px", margin: "0 0 12px", textTransform: "uppercase" as const, fontWeight: "600" };
const trackingItem = { color: "#374151", fontSize: "15px", margin: "0 0 8px" };
const btnContainer = { textAlign: "center" as const, margin: "32px 0" };
const button = { backgroundColor: "#c9a227", borderRadius: "6px", color: "#0f1a3c", fontSize: "16px", fontWeight: "600", padding: "14px 32px", textDecoration: "none", display: "inline-block" };
const hr = { borderColor: "#e5e7eb", margin: "32px 0 24px" };
const footer = { color: "#9ca3af", fontSize: "14px", textAlign: "center" as const };

export default ShipmentDispatchedEmail;
