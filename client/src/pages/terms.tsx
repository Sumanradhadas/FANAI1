import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-sm max-w-none dark:prose-invert">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using FanAI, you accept and agree to be bound by the terms and provisions of this agreement.
            </p>

            <h2>2. Use License</h2>
            <p>
              FanAI grants you a personal, non-transferable, non-exclusive license to use the service for creating AI-generated photos with celebrities.
            </p>

            <h2>3. User-Generated Content</h2>
            <p>
              All AI-generated photos are created based on your inputs and uploads. FanAI provides the tools for fan-generated content creation.
              You retain ownership of your uploaded photos and generated images.
            </p>

            <h2>4. Prohibited Uses</h2>
            <p>You agree not to use FanAI to:</p>
            <ul>
              <li>Create misleading, defamatory, or inappropriate content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Create content that could harm individuals or groups</li>
            </ul>

            <h2>5. Content Responsibility</h2>
            <p>
              All generations are initiated and owned by users. FanAI is not responsible for misuse or content liability.
              Users are solely responsible for how they use and share generated images.
            </p>

            <h2>6. Privacy and Data</h2>
            <p>
              No celebrity image is publicly hosted; our database is private. We do not share your personal information
              or generated images with third parties without your consent.
            </p>

            <h2>7. Payment and Refunds</h2>
            <p>
              All purchases are final. Credits are non-refundable once purchased. Service interruptions do not constitute
              grounds for refunds.
            </p>

            <h2>8. Service Availability</h2>
            <p>
              We strive to maintain service availability but do not guarantee uninterrupted access. We reserve the right
              to modify or discontinue the service at any time.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              FanAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting
              from your use of or inability to use the service.
            </p>

            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes
              acceptance of the new terms.
            </p>

            <h2>11. Contact</h2>
            <p>
              For questions about these Terms of Service, please contact us at support@fanai.in
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
