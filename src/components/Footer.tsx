import { siteConfig } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-foreground/10 py-8 text-center text-sm text-foreground/50">
      © {siteConfig.name}. All rights reserved.
    </footer>
  );
}
