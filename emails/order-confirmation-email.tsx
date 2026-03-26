import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface OrderItem {
  title: string;
  quantity: number;
  unitPrice: number;
}

interface OrderConfirmationEmailProps {
  name: string;
  orderNumber: string;
  orderUrl: string;
  items: OrderItem[];
  total: number;
  supplierName: string;
}

export function OrderConfirmationEmail({
  name,
  orderNumber,
  orderUrl,
  items,
  total,
  supplierName,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Order #{orderNumber} confirmed — BaoZhen</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logo}>宝针 BaoZhen</Text>
          </Section>
          <Section style={content}>
            <Heading style={h1}>Order Confirmed!</Heading>
            <Text style={text}>Hi {name}, your order has been confirmed.</Text>

            <Section style={orderBox}>
              <Text style={orderLabel}>Order Number</Text>
              <Text style={orderNumber2}>#{orderNumber}</Text>
              <Text style={supplierText}>Supplier: {supplierName}</Text>
            </Section>

            <Heading style={h2}>Order Summary</Heading>
            {items.map((item, i) => (
              <Row key={i} style={itemRow}>
                <Column style={itemName}>{item.title}</Column>
                <Column style={itemQty}>×{item.quantity}</Column>
                <Column style={itemPrice}>${(item.unitPrice * item.quantity).toFixed(2)}</Column>
              </Row>
            ))}

            <Hr style={hr} />
            <Row style={totalRow}>
              <Column style={totalLabel}>Total</Column>
              <Column style={totalAmount}>${total.toFixed(2)} USD</Column>
            </Row>

            <Section style={btnContainer}>
              <Link href={orderUrl} style={button}>
                View Order Details
              </Link>
            </Section>

            <Hr style={hr} />
            <Text style={footer}>
              BaoZhen &mdash; Buy from China, Built for the World
            </Text>
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
const h1 = { color: "#0f1a3c", fontSize: "28px", fontWeight: "700", margin: "0 0 16px" };
const h2 = { color: "#0f1a3c", fontSize: "18px", fontWeight: "600", margin: "24px 0 12px" };
const text = { color: "#374151", fontSize: "16px", lineHeight: "26px", margin: "0 0 16px" };
const orderBox = { backgroundColor: "#f3f4f6", borderRadius: "8px", padding: "20px", margin: "24px 0" };
const orderLabel = { color: "#6b7280", fontSize: "12px", margin: "0 0 4px", textTransform: "uppercase" as const };
const orderNumber2 = { color: "#0f1a3c", fontSize: "22px", fontWeight: "700", margin: "0 0 8px" };
const supplierText = { color: "#374151", fontSize: "14px", margin: "0" };
const itemRow = { margin: "8px 0" };
const itemName = { color: "#374151", fontSize: "14px", width: "55%" };
const itemQty = { color: "#6b7280", fontSize: "14px", width: "15%", textAlign: "center" as const };
const itemPrice = { color: "#0f1a3c", fontSize: "14px", fontWeight: "600", width: "30%", textAlign: "right" as const };
const hr = { borderColor: "#e5e7eb", margin: "20px 0" };
const totalRow = { margin: "8px 0" };
const totalLabel = { color: "#0f1a3c", fontSize: "16px", fontWeight: "700" };
const totalAmount = { color: "#c9a227", fontSize: "18px", fontWeight: "700", textAlign: "right" as const };
const btnContainer = { textAlign: "center" as const, margin: "32px 0" };
const button = { backgroundColor: "#c9a227", borderRadius: "6px", color: "#0f1a3c", fontSize: "16px", fontWeight: "600", padding: "14px 32px", textDecoration: "none", display: "inline-block" };
const footer = { color: "#9ca3af", fontSize: "14px", textAlign: "center" as const };

export default OrderConfirmationEmail;
