import SelahTab from "@/components/SelahTab";
import MobileTopBar from "@/components/MobileTopBar";

export default function SelahPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <MobileTopBar />
      <SelahTab />
    </div>
  );
}
