
import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoaderFallback from "./LoaderFallback";

const Layout = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        <Suspense fallback={<LoaderFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
};

export default Layout;
