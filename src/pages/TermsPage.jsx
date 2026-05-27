import { useApp } from "../AppContext";

export default function TermsPage() {
  const { go } = useApp();
  return (
    <div className="page" style={{ paddingTop: 80, maxWidth: 720, margin: "0 auto" }}>
      <button onClick={() => go("land")} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer", marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>← Back</button>
      <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 42, letterSpacing: 1, marginBottom: 4 }}>Terms of Service</div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 40 }}>Last updated: May 2026</div>

      {[
        ["1. Acceptance of Terms", "By accessing or using STEM, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform."],
        ["2. Eligibility", "You must be at least 13 years old to use STEM. If you are under 18, you must have parental or guardian consent. By using STEM you represent that you meet these requirements."],
        ["3. Account Responsibilities", "You are responsible for maintaining the security of your account and all activity that occurs under it. Do not share your password. You must provide accurate information when creating your account."],
        ["4. Coins and Withdrawals", "STEM coins are earned by watching streams, gifting, and other platform activities. 1,000 coins = $1 USD. The minimum withdrawal is 20,000 coins ($20). STEM reserves the right to adjust coin values and withdrawal minimums at any time. Coins have no cash value outside the platform and are non-transferable except through platform features."],
        ["5. Content Policy", "You may not stream or post content that is illegal, harmful, hateful, sexually explicit involving minors, or that violates any third-party rights. STEM reserves the right to remove content and suspend accounts that violate this policy."],
        ["6. Prohibited Conduct", "You agree not to: (a) manipulate viewer counts or coin balances; (b) harass, threaten, or impersonate other users; (c) use bots or automated tools to interact with the platform; (d) attempt to reverse-engineer or compromise platform security."],
        ["7. Intellectual Property", "Content you create and stream remains yours. By streaming on STEM you grant us a limited, non-exclusive licence to display and distribute your content on the platform. STEM's own branding, code, and design are our intellectual property."],
        ["8. Termination", "STEM may suspend or terminate your account at any time for violations of these terms. You may delete your account at any time by contacting support."],
        ["9. Disclaimer of Warranties", "STEM is provided \"as is\" without warranties of any kind. We do not guarantee uninterrupted access or that the platform will be error-free."],
        ["10. Limitation of Liability", "To the fullest extent permitted by law, STEM shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform."],
        ["11. Changes to Terms", "We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms."],
        ["12. Contact", "For questions about these terms, contact us at legal@stemapp.online."],
      ].map(([title, body]) => (
        <div key={title} style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: "var(--purple)" }}>{title}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,.8)", lineHeight: 1.7 }}>{body}</div>
        </div>
      ))}
    </div>
  );
}
