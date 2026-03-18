import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 160px)", padding: "100px 24px", maxWidth: "800px", margin: "0 auto" }}>
        <h1 className="section-title" style={{ textAlign: "left", marginBottom: "32px", fontSize: "2.5rem" }}>Privacy Policy</h1>
        <div className="result-body" style={{ color: "var(--text-secondary)" }}>
          <p><strong>Last Updated:</strong> March 2026</p>
          
          <h2 style={{ marginTop: "32px" }}>1. Information We Process</h2>
          <p>We process information you provide directly to us through the MoatCheck application in real-time. This includes the startup ideas you type, the target customer segments you select, and any documents (like Pitch Decks) you upload for analysis. We do not persistently store this information in a database.</p>
          
          <h2>2. How We Use Your Information</h2>
          <p>We use the information you provide strictly to operate the MoatCheck AI analysis service. Your inputs and documents are immediately processed by our backend AI agents (powered by third-party cloud LLM providers) to generate your custom reports, and are not retained by our application afterward.</p>
          
          <h2>3. Data Processing and LLMs</h2>
          <p>We utilize secure, industry-standard third-party AI models to analyze your startup ideas and documents in real-time. Data is processed in accordance with the applicable third-party provider's terms of service and privacy policies.</p>
          
          <h2>4. Data Retention</h2>
          <p>Ideas and files processed during an anonymous browser session are designed to be temporary and are not permanently stored by our platform.</p>
          
          <h2>5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at support via the link in the navigation menu.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
