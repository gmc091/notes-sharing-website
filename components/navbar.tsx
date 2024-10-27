"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  ChevronDown,
  LogIn,
  UserPlus,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { CustomUserButton } from "./user-button";

const schoolTypes = [
  {
    name: "Liceo scientifico",
    subjects: [
      "Latino",
      "Matematica",
      "Scienze",
      "Fisica",
      "Italiano",
      "Storia",
      "Filosofia",
      "Inglese",
    ],
  },
  {
    name: "Liceo classico",
    subjects: [
      "Latino",
      "Greco",
      "Italiano",
      "Storia",
      "Filosofia",
      "Matematica",
      "Scienze",
      "Inglese",
    ],
  },
  {
    name: "Liceo linguistico",
    subjects: [
      "Italiano",
      "Inglese",
      "Francese",
      "Tedesco",
      "Spagnolo",
      "Storia",
      "Filosofia",
      "Matematica",
    ],
  },
  {
    name: "Scienze umane",
    subjects: [
      "Italiano",
      "Storia",
      "Filosofia",
      "Scienze umane",
      "Diritto",
      "Economia",
      "Matematica",
      "Inglese",
    ],
  },
];

export function Navbar() {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();
  const pathname = usePathname();

  const handleExpand = (index: number) => {
    setExpandedSection((prev) => (prev === index ? null : index));
  };

  const handleUserProfileOpen = () => {
    setIsSheetOpen(false);
  };

  const handleSubjectClick = (
    school: string,
    subject: string,
    e: React.MouseEvent
  ) => {
    e.preventDefault();

    // Build the search params
    const params = new URLSearchParams();
    params.append("schools", school);
    params.append("subjects", subject);
    params.append("page", "1");

    // If we're not on the home page, redirect to home with filters
    if (pathname !== "/") {
      router.push(`/?${params.toString()}`);
    } else {
      // If we're already on the home page, just update the URL
      router.push(`/?${params.toString()}`, { scroll: false });
    }

    // Close the mobile menu if open
    setIsSheetOpen(false);
  };

  const AuthButtons = ({ isMobile = false }) => {
    if (!isMobile) {
      return isSignedIn ? (
        <div onClick={handleUserProfileOpen}>
          <CustomUserButton />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <SignInButton mode="modal" fallbackRedirectUrl="/">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Accedi
            </Button>
          </SignInButton>
          <SignUpButton mode="modal" fallbackRedirectUrl="/">
            <Button size="sm" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Registrati
            </Button>
          </SignUpButton>
        </div>
      );
    }

    if (isSignedIn && user) {
      return (
        <div className="border-t p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative h-10 w-10">
              <img
                src={user.imageUrl}
                alt={user.fullName || "User avatar"}
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium">
                {user.fullName || user.username}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setIsSheetOpen(false);
                openUserProfile();
              }}
            >
              <UserIcon className="mr-2 h-4 w-4" />
              Il mio profilo
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => {
                setIsSheetOpen(false);
                signOut();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Esci
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="border-t p-4 space-y-2">
        <SignInButton mode="modal" fallbackRedirectUrl="/">
          <Button variant="outline" className="w-full justify-start">
            <LogIn className="mr-2 h-4 w-4" />
            Accedi
          </Button>
        </SignInButton>
        <SignUpButton mode="modal" fallbackRedirectUrl="/">
          <Button className="w-full justify-start">
            <UserPlus className="mr-2 h-4 w-4" />
            Registrati
          </Button>
        </SignUpButton>
      </div>
    );
  };

  const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a"> & {
      school: string;
      subject: string;
    }
  >(({ className, title, children, school, subject, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            onClick={(e) => handleSubjectClick(school, subject, e)}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  });
  ListItem.displayName = "ListItem";

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="font-semibold hidden sm:block">
              Appunti Liceo Aprosio
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:ml-6">
            <NavigationMenu>
              <NavigationMenuList>
                {schoolTypes.map((school) => (
                  <NavigationMenuItem key={school.name}>
                    <NavigationMenuTrigger>{school.name}</NavigationMenuTrigger>
                    <NavigationMenuContent className="bg-white">
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {school.subjects.map((subject) => (
                          <ListItem
                            key={subject}
                            title={subject}
                            school={school.name}
                            subject={subject}
                            href="#"
                          >
                            Esplora gli appunti di {subject} per {school.name}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:block">
            <AuthButtons />
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full sm:w-[400px] p-0 z-[100]"
              >
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <SheetTitle className="font-semibold text-lg">
                      Menu
                    </SheetTitle>
                  </div>
                  <nav className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {schoolTypes.map((school, index) => (
                        <div key={school.name} className="space-y-2">
                          <button
                            className="flex justify-between items-center w-full p-2 text-lg font-semibold rounded-md hover:bg-accent transition-colors"
                            onClick={() => handleExpand(index)}
                          >
                            {school.name}
                            <ChevronDown
                              className={cn(
                                "h-5 w-5 transition-transform duration-200",
                                expandedSection === index && "rotate-180"
                              )}
                            />
                          </button>
                          {expandedSection === index && (
                            <ul className="pl-4 space-y-2 mt-2">
                              {school.subjects.map((subject) => (
                                <li key={subject}>
                                  <a
                                    href="#"
                                    className="block p-2 text-sm rounded-md hover:bg-accent transition-colors"
                                    onClick={(e) =>
                                      handleSubjectClick(
                                        school.name,
                                        subject,
                                        e
                                      )
                                    }
                                  >
                                    {subject}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </nav>
                  <AuthButtons isMobile />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
