import { useApp } from "../AppContext";

export default function PrivacyPage() {
  const { go } = useApp();
  return (
    <div className="page" style={{ paddingTop: 80, maxWidth: 720, margin: "0 auto" }}>
      <button onClick={() => go("land")} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer", marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>← Back</button>
      <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 42, letterSpacing: 1, marginBottom: 4 }}>Privacy Policy</div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 40 }}>Last updated: May 2026</div>

      {[
        ["1. Information We Collect", "We collect information you provide when creating an account (name, email), information generated through your use of the platform (watch history, coin transactions, chat messages), and technical information (IP address, browser type, device identifiers)."],
        ["2. How We Use Your Information", "We use your information to: (a) operate and improve the platform; (b) process coin earnings and withdrawals; (c) send notifications about streamers you follow; (d) detect and prevent fraud and abuse; (e) comply with legal obligations."],
        ["3. Sharing Your Information", "We do not sell your personal information. We may share information with: (a) service providers who help us operate the platform (Supabase, Mux, Vercel); (b) law enforcement when required by law; (c) other users only as part of normal platform features (your username and stream activity are public)."],
        ["4. Cookies", "We use essential cookies to keep you logged in and remember your preferences. We do not use third-party advertising cookies."],
        ["5. Data Retention", "We retain your account data for as long as your account is active. Chat messages may be stored for up to 90 days. Coin transaction records are kept for 7 years for financial compliance."],
        ["6. Your Rights", "You have the right to: (a) access the personal data we hold about you; (b) request correction of inaccurate data; (c) request deletion of your account and associated data; (d) withdraw consent where processing is based on consent. To exercise these rights, contact privacy@stemapp.online."],
        ["7. Security", "We use industry-standard encryption and security practices to protect your data. However, no internet transmission is 100% secure and we cannot guarantee absolute security."],
        ["8. Children's Privacy", "STEM is not directed at children under 13. We do not knowingly collect personal information from children under 13. If we become aware we have done so, we will delete that information promptly."],
        ["9. Changes to This Policy", "We may update this policy at any time. We will notify you of significant changes via email or a prominent notice on the platform."],
        ["10. Contact Us", "For privacy-related questions or requests, contact us at privacy@stemapp.online."],
      ].map(([title, body]) => (
        <div key={title} style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: "var(--purple)" }}>{title}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,.8)", lineHeight: 1.7 }}>{body}</div>
        </div>
      ))}
    </div>
  );
}
