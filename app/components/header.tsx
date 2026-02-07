import {
  LogIn,
  LogOut,
  Menu,
  PackagePlus,
  Search,
  User,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Link, useSubmit } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "~/components/ui/sheet";
import type { UserT } from "~/services/auth/auth";

const categories = [
  "Trompetas",
  "Trombones",
  "Saxofón",
  "Estuches",
  "Boquillas",
  "Accesorios",
];

interface HeaderProps {
  user: UserT | null;
}

export function Header({ user }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const submit = useSubmit();

  const logout = useCallback(() => {
    submit({}, { action: "/sign-out", method: "POST" });
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supportsbackdrop-filter:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to={"/"} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md">
              <span className="text-3xl font-bold">🎺</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground sm:block">
              Trompeventas.cl
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            {categories.slice(0, 5).map((category) => (
              <Link
                to={"#"}
                key={category}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {category}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden flex-1 max-w-md lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Busca productos"
                className="w-full pl-10 bg-secondary border-border focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span className="sr-only">Abrir busqueda</span>
            </Button>

            {/* Sell Button */}

            <Link to={user ? "/publish-product" : "/sign-in"}>
              <Button className="hidden sm:inline-flex">
                <PackagePlus />
                Publica tu producto
              </Button>
            </Link>
            {user ? (
              <>
                <Button variant={"outline"}>
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-5 w-5 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User />
                  )}
                  {user.name}
                </Button>
                <Button
                  onClick={() => {
                    logout();
                  }}
                  variant={"outline"}
                >
                  <LogOut />
                </Button>
              </>
            ) : (
              <Link to="/sign-in">
                <Button variant={"outline"} className="hidden sm:inline-flex">
                  <LogIn />
                  Ingresar
                </Button>
              </Link>
            )}
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-background">
                <nav className="flex flex-col gap-4 mt-8 p-4">
                  {categories.map((category) => (
                    <Link
                      key={category}
                      to={"#"}
                      className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {category}
                    </Link>
                  ))}
                  <div className="flex flex-col gap-2 border-t border-border pt-4 mt-4">
                    <SheetClose asChild>
                      <Link to="/signin">
                        <Button>
                          <PackagePlus />
                          Publica tu producto
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/signin">
                        <Button
                          onClick={() => setIsSearchOpen(false)}
                          variant={"outline"}
                        >
                          <LogIn />
                          Ingresar
                        </Button>
                      </Link>
                    </SheetClose>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="pb-4 lg:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="w-full pl-10 bg-secondary border-border"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
