import Link from "next/link";
import { ShieldCheckIcon, ShieldIcon, TruckIcon } from "lucide-react";

const customerCare = ["Help Center", "How to Buy", "Shipping & Delivery", "Returns & Refunds", "Kachi Guarantee", "Contact Us"];
const about = ["About Us", "Kachi Careers", "Kachi Policies", "Privacy Policy", "Flash Deals Guide"];
const chip = "flex h-8 items-center justify-center gap-1 rounded-md border border-surface-variant bg-surface-container-lowest px-2 shadow-sm";

function LinkList({ title, items }: { title: string; items: string[] }) {
  return (
    <nav aria-label={title} className="flex flex-col gap-2.5">
      <h2 className="font-heading text-headline-sm">{title}</h2>
      <ul className="flex flex-col gap-1 text-body-sm text-on-surface-variant">
        {items.map((item) => (
          <li key={item}>
            <Link href="#" className="transition-colors hover:text-primary">
              {item}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-6 bg-surface-container-low">
      <div className="mx-auto max-w-7xl px-3 py-6 md:px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <LinkList title="Customer Care" items={customerCare} />
          <LinkList title="About Kachi" items={about} />

          <div className="flex flex-col gap-2.5">
            <h2 className="font-heading text-headline-sm">Payment Partners</h2>
            <ul className="grid grid-cols-4 gap-1">
              <li className={chip} title="Visa">
                <span className="font-heading text-[11px] font-black text-[#1434CB] italic">VISA</span>
              </li>
              <li className={chip} title="Mastercard">
                <svg aria-label="Mastercard" role="img" className="h-5 w-auto" viewBox="0 0 24 16">
                  <circle cx="7" cy="8" r="7" fill="#EB001B" />
                  <circle cx="17" cy="8" r="7" fill="#F79E1B" fillOpacity="0.9" />
                  <path d="M12 2.7A7 7 0 0 1 14.6 8A7 7 0 0 1 12 13.3A7 7 0 0 1 9.4 8A7 7 0 0 1 12 2.7Z" fill="#FF5F00" />
                </svg>
              </li>
              <li className={chip} title="American Express">
                <span className="font-heading text-[10px] font-extrabold text-[#006FCF]">AMEX</span>
              </li>
              <li className={chip} title="PayPal">
                <span className="font-heading text-[10px] font-extrabold text-[#003087] italic">PayPal</span>
              </li>
            </ul>
            <h2 className="pt-1.5 font-heading text-headline-sm">Logistics Partners</h2>
            <ul className="grid grid-cols-2 gap-1 text-label-xs">
              <li className={chip}><span className="font-black text-[#D40511] italic">DHL</span><span className="text-[9px] text-tertiary uppercase">Express</span></li>
              <li className={chip}><span className="font-black text-[#4D148C]">Fed<span className="text-[#FF6600]">Ex</span></span></li>
              <li className={chip}><span className="font-black text-[#351C15]">UPS</span><span className="text-[9px] text-tertiary">Global</span></li>
              <li className={chip}><span className="font-bold">NinjaVan</span></li>
              <li className={chip}><span className="font-extrabold text-[#E60012] italic">J&amp;T</span><span className="text-[9px] font-semibold text-on-surface-variant">Express</span></li>
              <li className={`${chip} border-secondary/20 bg-secondary-fixed text-secondary`}>
                <TruckIcon aria-hidden className="size-3.5" />
                Kachi Express
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-2.5">
            <h2 className="font-heading text-headline-sm">Security &amp; Trust</h2>
            <div className="flex items-center gap-1.5 rounded-lg bg-surface-container-lowest p-1.5 shadow-sm">
              <ShieldCheckIcon aria-hidden className="size-5.5 text-secondary" />
              <div>
                <p className="text-label-md font-bold">100% Authentic</p>
                <p className="text-label-xs font-normal text-on-surface-variant">Direct from verified mall brands</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-surface-container-lowest p-1.5 shadow-sm">
              <ShieldIcon aria-hidden className="size-5.5 text-primary" />
              <div>
                <p className="text-label-md font-bold">PCI-DSS Compliant</p>
                <p className="text-label-xs font-normal text-on-surface-variant">Encrypted end-to-end checkout</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-2.5 pt-4 md:flex-row">
          <p className="text-center text-body-sm text-on-surface-variant md:text-left">
            © {new Date().getFullYear()} Kachi E-Commerce UAE. All rights reserved. Country &amp; Region: United Arab
            Emirates.
          </p>
          <ul className="flex items-center gap-2.5 text-label-xs text-on-surface-variant">
            <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
            <li aria-hidden className="opacity-40">•</li>
            <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
            <li aria-hidden className="opacity-40">•</li>
            <li><Link href="#" className="hover:text-primary">Merchant Agreement</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
