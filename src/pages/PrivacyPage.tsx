import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Helmet from "@/components/Helmet";

const PrivacyPage = () => {
  return (
    <>
      <Helmet
        title="Privacy Policy | Teguaze "
        description="Learn about Teguaze 's privacy practices and how we protect your personal information when you use our car rental services."
        keywords="privacy policy, data protection, personal information, car rental privacy, Teguaze  privacy"
      />
      <Header />
      <main className="pt-24 pb-16 bg-black text-white min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-zinc-900 p-6 md:p-10 rounded-lg border border-yellow-300/10">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 font-barlow">
              Privacy <span className="text-yellow-300">Policy</span>
            </h1>

            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                  1. Introduction
                </h2>
                <p>
                  At Teguaze , we respect your privacy and are committed to
                  protecting your personal data. This Privacy Policy explains
                  how we collect, use, disclose, and safeguard your information
                  when you use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                  2. Information We Collect
                </h2>
                <p className="mb-3">
                  We may collect the following types of information:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-left">
                  <li>
                    Personal identification information (name, email address,
                    phone number, etc.)
                  </li>
                  <li>Driver's license and other identification documents</li>
                  <li>
                    Payment information (credit card details, billing address)
                  </li>
                  <li>Rental preferences and history</li>
                  <li>Location data when using our vehicle GPS systems</li>
                  <li>
                    Technical data (IP address, browser type, device
                    information)
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                  3. How We Use Your Information
                </h2>
                <p className="mb-3">
                  We use your personal information for the following purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-left">
                  <li>Process and manage your car rental bookings</li>
                  <li>Verify your identity and eligibility to rent vehicles</li>
                  <li>Process payments and issue receipts</li>
                  <li>
                    Communicate with you about your rentals and our services
                  </li>
                  <li>Improve our services and develop new features</li>
                  <li>Comply with legal obligations and enforce our terms</li>
                  <li>
                    Send promotional offers and marketing communications (with
                    consent)
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                  4. Data Sharing and Disclosure
                </h2>
                <p className="mb-3">We may share your information with:</p>
                <ul className="list-disc pl-6 space-y-2 text-left">
                  <li>
                    Service providers who assist us in operating our business
                  </li>
                  <li>Payment processors to complete transactions</li>
                  <li>Insurance companies in case of accidents or claims</li>
                  <li>Law enforcement agencies as required by law</li>
                  <li>Business partners with your explicit consent</li>
                </ul>
                <p className="mt-3">
                  We do not sell your personal information to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                  5. Data Security
                </h2>
                <p>
                  We implement appropriate technical and organizational measures
                  to protect your personal data from unauthorized access,
                  alteration, disclosure, or destruction. However, no method of
                  transmission over the Internet or electronic storage is 100%
                  secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                  6. Your Rights
                </h2>
                <p className="mb-3">
                  Depending on your location, you may have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-left">
                  <li>Access the personal data we hold about you</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Delete your personal data in certain circumstances</li>
                  <li>Restrict or object to our processing of your data</li>
                  <li>Request the transfer of your data to another service</li>
                  <li>Withdraw your consent at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                  7. Cookies and Tracking
                </h2>
                <p>
                  We use cookies and similar tracking technologies to enhance
                  your experience on our website, analyze usage patterns, and
                  deliver targeted advertisements. You can control cookies
                  through your browser settings, but disabling them may affect
                  the functionality of our website.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                  8. Children's Privacy
                </h2>
                <p>
                  Our services are not intended for individuals under the age of
                  21, and we do not knowingly collect personal information from
                  children. If you believe we have inadvertently collected data
                  from a child, please contact us to have it removed.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                  9. Changes to This Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time to reflect
                  changes in our practices or for other operational, legal, or
                  regulatory reasons. We will notify you of any material changes
                  by posting the new policy on our website.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                  10. Contact Us
                </h2>
                <p>
                  If you have questions or concerns about this Privacy Policy or
                  our data practices, please contact us at privacy@Teguaze .com
                  or call +251 91 234 5678.
                </p>
              </section>
            </div>

            <div className="mt-10 pt-6 border-t border-yellow-300/10 text-sm text-gray-400">
              <p>Last updated: April 3, 2025</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default PrivacyPage;
