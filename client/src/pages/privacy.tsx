import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-sm max-w-none dark:prose-invert">
            <h2>1. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul>
              <li><strong>Account Information:</strong> Email address, name, and profile details when you create an account</li>
              <li><strong>Uploaded Photos:</strong> Images you upload for AI generation purposes</li>
              <li><strong>Generated Images:</strong> AI-generated photos created through our service</li>
              <li><strong>Usage Data:</strong> Information about how you use our service, including generation history</li>
              <li><strong>Payment Information:</strong> Processed securely through our payment provider (Razorpay)</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and improve our AI photo generation service</li>
              <li>Process your photo generation requests</li>
              <li>Manage your account and provide customer support</li>
              <li>Send service-related notifications</li>
              <li>Analyze and improve our service performance</li>
            </ul>

            <h2>3. Data Storage and Security</h2>
            <p>
              We take data security seriously. Your uploaded photos and generated images are stored securely.
              Celebrity images are stored in a private repository and are not publicly accessible.
              We use industry-standard security measures to protect your personal information.
            </p>

            <h2>4. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share data with:
            </p>
            <ul>
              <li><strong>Service Providers:</strong> Third-party services that help us operate (AI APIs, payment processors)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>

            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Export your generated images</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2>6. Image Retention</h2>
            <p>
              Uploaded photos are retained for the duration of the generation process and may be stored in your account history.
              You can delete your generation history at any time from your dashboard.
            </p>

            <h2>7. Cookies and Tracking</h2>
            <p>
              We use essential cookies to maintain your session and provide core functionality. We do not use
              third-party tracking cookies for advertising purposes.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              Our service is not intended for users under 13 years of age. We do not knowingly collect personal
              information from children under 13.
            </p>

            <h2>9. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting
              the new Privacy Policy on this page and updating the "Last updated" date.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or want to exercise your rights, please contact us at:
              <br />
              Email: privacy@fanai.in
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
