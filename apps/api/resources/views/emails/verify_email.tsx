import { Html, Head, Body, Container, Text, Button, Section } from '@react-email/components'

interface VerifyEmailProps {
    user: {
        fullName: string
        email: string
    }
    verificationUrl: string
    appName: string
}

export default function VerifyEmail({ user, verificationUrl, appName }: VerifyEmailProps) {
    return (
        <Html>
            <Head />
            <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f6f6f6' }}>
                <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }}>
                    <Section style={{ padding: '40px', textAlign: 'center' }}>
                        <Text style={{ fontSize: '24px', color: '#333333', marginBottom: '20px' }}>
                            Welcome to {appName}!
                        </Text>
                        <Text style={{ fontSize: '16px', color: '#666666', marginBottom: '30px' }}>
                            Hi {user.fullName}, please verify your email address to complete your registration.
                        </Text>
                        <Button
                            href={verificationUrl}
                            style={{
                                backgroundColor: '#007bff',
                                color: '#ffffff',
                                padding: '12px 24px',
                                textDecoration: 'none',
                                borderRadius: '6px',
                                display: 'inline-block'
                            }}
                        >
                            Verify Email Address
                        </Button>
                    </Section>
                </Container>
            </Body>
        </Html>
    )
}