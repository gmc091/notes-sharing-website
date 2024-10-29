import React from "react";
import { Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Developer Info - Responsive text alignment */}
          <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2 text-center sm:text-left">
            <p className="text-sm text-muted-foreground">
              Sviluppato da{" "}
              <span className="font-medium text-primary hover:text-primary/90 transition-colors">
                Giovanni Max Croese
              </span>{" "}
              <span className="hidden sm:inline text-muted-foreground/40">
                •
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              4A <span className="text-muted-foreground/40">•</span>{" "}
              <span className="text-muted-foreground">Lista Dolce Vita</span>
            </p>
          </div>

          {/* Contact Link - Adaptive styling */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors group"
            asChild
          >
            <Link
              href="mailto:appunti.liceo.aprosio@gmail.com"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">
                appunti.liceo.aprosio@gmail.com
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
