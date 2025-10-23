import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, User, LogOut, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [location] = useLocation();

  const isAdminPage = location.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-6 flex h-16 items-center justify-between gap-4">
        <Link href="/" data-testid="link-home">
          <div className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-3 py-2 -ml-3 cursor-pointer">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              FanAI
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2" data-testid="button-user-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
                        <AvatarFallback>
                          {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline-block">
                        {user?.firstName || user?.email?.split('@')[0] || 'User'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-3 p-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
                        <AvatarFallback>
                          {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">
                          {user?.firstName && user?.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user?.firstName || user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" data-testid="link-dashboard">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'admin' && !isAdminPage && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" data-testid="link-admin">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={async () => {
                      try {
                        await logout();
                      } catch (error) {
                        console.error('Logout error:', error);
                        window.location.href = '/';
                      }
                    }} data-testid="link-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild data-testid="button-login">
                  <Link href="/auth">Sign In</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
