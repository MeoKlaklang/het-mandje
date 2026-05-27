import Navbar from "@/components/Navbar";
import PlatformFooter from "@/components/PlatformFooter";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <PlatformFooter />
    </>
  );
}