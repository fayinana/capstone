import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Helmet from "@/components/Helmet";

const TermsPage = () => {
  return (
    <>
      <Helmet
        title="Terms & Conditions | Teguaze "
        description="Read the terms and conditions for using Teguaze 's car rental services. Understand your rights and responsibilities when renting with us."
        keywords="terms, conditions, car rental terms, rental agreement, Teguaze  terms"
      />
      <Header />
      <main className="pt-24 pb-16 bg-black text-white min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-zinc-900 p-6 md:p-10 rounded-lg border border-yellow-300/10">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 font-barlow">
              Terms & <span className="text-yellow-300">Conditions</span>
            </h1>

            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                  1. Agreement to Terms
                </h2>
                <p>
                  By accessing or using Teguaze 's services, you agree to be
                  bound by these Terms and Conditions. If you disagree with any
                  part of the terms, you may not access the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                  2. Rental Requirements
                </h2>
                <p className="mb-3">
                  To rent a vehicle from Teguaze , renters must:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-left">
                  <li>Be at least 21 years of age</li>
                  <li>
                    Possess a valid driver's license that has been held for at
                    least one year
                  </li>
                  <li>
                    Provide a valid credit or debit card in the renter's name
                  </li>
                  <li>Meet our insurance and credit requirements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                  3. Reservation and Payment
                </h2>
                <p className="mb-3">
                  Reservations can be made online or via phone. A valid credit
                  card is required to secure a reservation. Payment terms
                  include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-left">
                  <li>A deposit is required at the time of booking</li>
                  <li>Full payment is due at the time of vehicle pickup</li>
                  <li>
                    Additional charges may apply for late returns, fuel, damage,
                    or other services
                  </li>
                  <li>
                    Cancellation fees may apply based on the notice period
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                  4. Vehicle Usage
                </h2>
                <p className="mb-3">The rented vehicle:</p>
                <ul className="list-disc pl-6 space-y-2 text-left">
                  <li>
                    Must only be driven by the authorized driver(s) listed in
                    the rental agreement
                  </li>
                  <li>
                    Must not be used for illegal purposes or to transport
                    hazardous materials
                  </li>
                  <li>
                    Must not be driven outside of Ethiopia without prior written
                    authorization
                  </li>
                  <li>
                    Must be operated in accordance with all traffic laws and
                    regulations
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                  5. Insurance and Liability
                </h2>
                <p className="mb-3">
                  Basic insurance is included in the rental fee, covering:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-left">
                  <li>Third-party liability as required by law</li>
                  <li>Collision Damage Waiver (CDW) with deductible</li>
                  <li>Theft Protection with deductible</li>
                </ul>
                <p className="mt-3">
                  Additional insurance options are available for purchase. The
                  renter is responsible for any damage not covered by the
                  selected insurance.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                  6. Return Policy
                </h2>
                <p className="mb-3">Vehicles must be returned:</p>
                <ul className="list-disc pl-6 space-y-2 text-left">
                  <li>On the agreed date and time to avoid late fees</li>
                  <li>
                    With the same amount of fuel as at pickup to avoid refueling
                    charges
                  </li>
                  <li>
                    In the same condition as received, minus normal wear and
                    tear
                  </li>
                  <li>With all provided accessories and documentation</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                  7. Modifications to Terms
                </h2>
                <p>
                  Teguaze reserves the right to modify these terms at any time.
                  Changes will be effective immediately upon posting on our
                  website. Continued use of our services after changes
                  constitutes acceptance of the modified terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                  8. Contact Information
                </h2>
                <p>
                  For questions regarding these Terms and Conditions, please
                  contact us at info@Teguaze .com or call +251 91 234 5678.
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

export default TermsPage;
