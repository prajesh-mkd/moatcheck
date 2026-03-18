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
          
          <h2 style={{ marginTop: "32px" }}>1. Information We Collect</h2>
          <p>We collect information you provide directly to us through the MoatCheck application. This includes the startup ideas you type, the target customer segments you select, and any documents (like Pitch Decks) you upload for analysis.</p>
          
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect strictly to provide the MoatCheck AI analysis service. Your inputs and documents are processed by our backend engine (powered by DigitalOcean Gradient and GPT-5.4) to generate your custom reports.</p>
          
          <h2>3. Data Processing and LLMs</h2>
          <p>By using MoatCheck, you understand that your startup ideas and uploaded documents are sent to our language model providers as part of the analysis process. Do not upload materials containing personally identifiable information (PII) or strictly confidential trade secrets that you are not comfortable processing through a cloud AI provider.</p>
          
          <h2>4. Data Retention</h2>
          <p>Ideas and files processed during an anonymous browser session are designed to be temporary and are not permanently stored or used to train public LLMs by our platform.</p>
          
          <h2>5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at support via the link in the navigation menu.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
