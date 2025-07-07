import {
    Body,
    Button,
    Container,
    Head,
    Html,
    Preview,
    Section,
    Text,
    Hr,
} from "@react-email/components";
import React from "react";

interface VerifyEmailProps {
    userFullName?: string;
    userEmail?: string;
    verificationUrl?: string;
    appName?: string;
}

export const VerifyEmail = ({
    userFullName,
    userEmail,
    verificationUrl = "https://example.com/verify",
    appName = "Your App"
}: VerifyEmailProps) => {
    const displayName = userFullName || userEmail || "there";

    return (
        <Html>
            <Head />
            <Preview>Verify your email address to complete your account setup</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={header}>
                        <Text style={headerTitle}>Verify Your Email</Text>
                        <Text style={headerSubtitle}>Complete your account setup</Text>
                    </Section>

                    {/* Content */}
                    <Section style={content}>
                        <Text style={greeting}>Hi {displayName},</Text>

                        <Text style={paragraph}>
                            Thanks for signing up! Please verify your email address by clicking the button below to complete your account setup.
                        </Text>

                        <Section style={buttonContainer}>
                            <Button style={button} href={verificationUrl}>
                                Verify Email Address
                            </Button>
                        </Section>

                        <Text style={disclaimer}>
                            If you didn't create an account, you can safely ignore this email.
                        </Text>

                        <Hr style={hr} />

                        <Text style={alternativeText}>
                            If the button doesn't work, copy and paste this link into your browser:
                        </Text>
                        <Text style={linkText}>{verificationUrl}</Text>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            This email was sent by {appName}
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default VerifyEmail;

// Styles
const main = {
    backgroundColor: "#f8fafc",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    margin: "0",
    padding: "40px 0",
};

const container = {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    margin: "0 auto",
    maxWidth: "600px",
    overflow: "hidden",
};

const header = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "40px 30px",
    textAlign: "center" as const,
};

const headerTitle = {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "600",
    margin: "0",
};

const headerSubtitle = {
    color: "#e2e8f0",
    fontSize: "16px",
    margin: "10px 0 0 0",
};

const content = {
    padding: "40px 30px",
};

const greeting = {
    color: "#374151",
    fontSize: "16px",
    lineHeight: "1.6",
    margin: "0 0 20px 0",
};

const paragraph = {
    color: "#374151",
    fontSize: "16px",
    lineHeight: "1.6",
    margin: "0 0 30px 0",
};

const buttonContainer = {
    margin: "40px 0",
    textAlign: "center" as const,
};

const button = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "6px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "16px",
    fontWeight: "600",
    padding: "16px 32px",
    textDecoration: "none",
    boxShadow: "0 4px 14px 0 rgba(102, 126, 234, 0.4)",
};

const disclaimer = {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "30px 0 0 0",
};

const hr = {
    borderColor: "#e5e7eb",
    margin: "30px 0 20px 0",
};

const alternativeText = {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "0 0 10px 0",
};

const linkText = {
    color: "#667eea",
    fontSize: "14px",
    margin: "0",
    wordBreak: "break-all" as const,
};

const footer = {
    backgroundColor: "#f9fafb",
    borderTop: "1px solid #e5e7eb",
    padding: "20px 30px",
    textAlign: "center" as const,
};

const footerText = {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0",
};