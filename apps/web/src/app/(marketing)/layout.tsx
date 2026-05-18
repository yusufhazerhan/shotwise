import { MarketingNav, MarketingFooter } from "@/components/marketing-nav";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingNav />
      <main data-slot="marketing-main">{children}</main>
      <MarketingFooter />
    </>
  );
}
