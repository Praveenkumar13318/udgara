export default function TermsPage() {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: "40px auto",
        padding: 20,
        lineHeight: "1.7"
      }}
    >
      <h1 style={{ marginBottom: 20 }}>Terms & Conditions</h1>

      <p style={{ color: "#aaa", marginBottom: 20 }}>
        Last updated: Today
      </p>

      <h3>1. Acceptance of Terms</h3>
      <p style={{ color: "#ccc" }}>
        By accessing or using Udgara, you agree to be bound by these Terms.
        If you do not agree, please do not use the platform.
      </p>

      <h3>2. User Identity (NP ID)</h3>
      <p style={{ color: "#ccc" }}>
        Each user is assigned a unique NP ID. This represents your identity
        within the platform. You are responsible for all activity under your NP ID.
      </p>

      <h3>3. Content Responsibility</h3>
      <p style={{ color: "#ccc" }}>
        You are solely responsible for the content you post. You must not post:
      </p>
      <ul style={{ color: "#ccc" }}>
        <li>Illegal, harmful, or abusive content</li>
        <li>Hate speech or threats</li>
        <li>False or misleading information</li>
      </ul>

      <h3>4. Content Moderation</h3>
      <p style={{ color: "#ccc" }}>
        Udgara reserves the right to remove content or suspend users that violate
        these terms without prior notice.
      </p>

      <h3>5. No Guarantee of Availability</h3>
      <p style={{ color: "#ccc" }}>
        We do not guarantee uninterrupted access to the platform. Features may
        change or be removed at any time.
      </p>

      <h3>6. Limitation of Liability</h3>
      <p style={{ color: "#ccc" }}>
        Udgara is not responsible for any damages or losses resulting from the use
        of the platform.
      </p>

      <h3>7. Updates to Terms</h3>
      <p style={{ color: "#ccc" }}>
        These terms may be updated at any time. Continued use of the platform means
        you accept the updated terms.
      </p>

    </div>
  );
}