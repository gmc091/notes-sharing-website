import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-grow bg-gray-50">{children}</main>
      <Footer />
    </>
  );
}
