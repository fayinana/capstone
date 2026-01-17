import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Helmet from "@/components/Helmet";

const AboutPage = () => {
  return (
    <>
      <Helmet
        title="About Us | Teguaze "
        description="Learn about Teguaze , the car rental service with premium vehicles and exceptional service."
        keywords="about us, car rental, premium vehicles, car company, car service"
      />
      <Header />
      <main className="pt-16">
        {/* Hero Banner */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1543465077-db45d34b88a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
            alt="Luxury cars"
            className="w-full h-[60vh] object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center px-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-barlow font-bold text-white mb-4">
                About Teguaze
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                Premium car rental service that puts you in the driver's seat of
                your dreams
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-barlow font-bold mb-6">Our Story</h2>
              <p className="text-lg mb-4">
                Teguaze was founded in 2018 with a simple mission: to make
                premium car rentals accessible, convenient, and enjoyable for
                everyone.
              </p>
              <p className="text-lg mb-4">
                What started as a small fleet of luxury vehicles has grown into
                a nationwide service offering a diverse selection of cars for
                every occasion, whether you're looking for a practical city car,
                a spacious SUV for family trips, or a high-performance vehicle
                for a special occasion.
              </p>
              <p className="text-lg">
                Our team consists of car enthusiasts who are passionate about
                providing exceptional service and ensuring you have the perfect
                vehicle for your needs.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
                alt="Our team"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Values Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-barlow font-bold text-center mb-12">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 p-6 rounded-lg">
                <div className="h-16 w-16 bg-yellow-300/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8 text-yellow-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-center mb-3">Quality</h3>
                <p className="text-center">
                  We maintain a fleet of premium vehicles that undergo rigorous
                  inspections to ensure safety, reliability, and comfort.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg">
                <div className="h-16 w-16 bg-yellow-300/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8 text-yellow-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-center mb-3">Fairness</h3>
                <p className="text-center">
                  We believe in transparent pricing with no hidden fees, fair
                  policies, and treating every customer with respect.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg">
                <div className="h-16 w-16 bg-yellow-300/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8 text-yellow-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-center mb-3">
                  Innovation
                </h3>
                <p className="text-center">
                  We continuously improve our services with technology, adding
                  new vehicles to our fleet, and finding ways to enhance your
                  rental experience.
                </p>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-barlow font-bold text-center mb-12">
              Our Leadership Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  name: "Alex Chen",
                  role: "CEO & Founder",
                  image:
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80",
                },
                {
                  name: "Sarah Johnson",
                  role: "Chief Operations Officer",
                  image:
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80",
                },
                {
                  name: "Michael Rodriguez",
                  role: "Fleet Manager",
                  image:
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80",
                },
                {
                  name: "Emily Wong",
                  role: "Customer Experience Director",
                  image:
                    "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1061&q=80",
                },
              ].map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden bg-zinc-800">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-yellow-300">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AboutPage;
