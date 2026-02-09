import {
  LogIn,
  LogOut,
  Menu,
  Package,
  PackagePlus,
  Search,
  Settings,
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
import { Separator } from "~/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 md:h-16 items-center justify-between gap-2 md:gap-4">
          {/* Logo — always visible */}
          <Link to={"/"} className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md">
              <span className="text-2xl sm:text-3xl font-bold">🎺</span>
            </div>
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
              Trompeventas.cl
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 lg:flex">
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
          <div className="hidden flex-1 max-w-md xl:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Busca productos"
                className="w-full pl-10 bg-secondary border-border focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Desktop Actions — hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
            {/* Search Toggle (visible md–xl, hidden on xl where inline search shows) */}
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span className="sr-only">Abrir busqueda</span>
            </Button>

            <Link to={user ? "/publish-product" : "/sign-in"}>
              <Button>
                <PackagePlus />
                Publica tu producto
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Avatar size="sm">
                      <AvatarImage
                        src={user.image ?? undefined}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                      />
                      <AvatarFallback>
                        <User className="h-3.5 w-3.5" />
                      </AvatarFallback>
                    </Avatar>
                    {user.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="h-4 w-4" />
                      Mi perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-products">
                      <Package className="h-4 w-4" />
                      Mis productos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="h-4 w-4" />
                      Configuracion
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} variant="destructive">
                    <LogOut className="h-4 w-4" />
                    Cerrar sesion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/sign-in">
                <Button variant="outline">
                  <LogIn />
                  Ingresar
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile: only hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background">
              <nav className="flex flex-col gap-1 mt-8 p-4">
                {/* Search inside sheet */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar productos..."
                    className="w-full pl-10 bg-secondary border-border"
                  />
                </div>

                <Separator className="mb-2" />

                {/* User info inside sheet */}
                {user && (
                  <div className="flex items-center gap-3 py-3">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="h-9 w-9 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                )}

                <Separator className="mb-2" />

                {/* Categories */}
                {categories.map((category) => (
                  <SheetClose asChild key={category}>
                    <Link
                      to={"#"}
                      className="rounded-md px-2 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {category}
                    </Link>
                  </SheetClose>
                ))}

                {/* Actions */}
                <div className="flex flex-col gap-2 border-t border-border pt-4 mt-3">
                  <SheetClose asChild>
                    <Link to={user ? "/publish-product" : "/sign-in"}>
                      <Button className="w-full">
                        <PackagePlus />
                        Publica tu producto
                      </Button>
                    </Link>
                  </SheetClose>
                  {user ? (
                    <>
                      <SheetClose asChild>
                        <Link to="/profile">
                          <Button variant="outline" className="w-full">
                            <User />
                            Mi perfil
                          </Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/my-products">
                          <Button variant="outline" className="w-full">
                            <Package />
                            Mis productos
                          </Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/settings">
                          <Button variant="outline" className="w-full">
                            <Settings />
                            Configuracion
                          </Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button
                          onClick={logout}
                          variant="outline"
                          className="w-full text-destructive hover:text-destructive"
                        >
                          <LogOut />
                          Cerrar sesion
                        </Button>
                      </SheetClose>
                    </>
                  ) : (
                    <SheetClose asChild>
                      <Link to="/sign-in">
                        <Button variant="outline" className="w-full">
                          <LogIn />
                          Ingresar
                        </Button>
                      </Link>
                    </SheetClose>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Search bar expandable — only for md–xl (desktop without inline search) */}
        {isSearchOpen && (
          <div className="hidden md:block xl:hidden pb-4">
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
