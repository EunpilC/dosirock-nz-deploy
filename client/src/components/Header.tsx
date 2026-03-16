import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "홈", href: "/" },
    { label: "메뉴", href: "/menu" },
    { label: "주문", href: "/orders" },
    { label: "갤러리", href: "/gallery" },
    { label: "문의", href: "/contact" },
  ];

  const isActive = (href: string) => location === href;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setLocation("/")}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[#1e7e34] to-[#2d9c4e] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-[#1e7e34]">Dosirock</h1>
            <p className="text-xs text-gray-600">Korean Lunch Box</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => setLocation(item.href)}
              className={`text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "text-[#1e7e34] border-b-2 border-[#1e7e34]"
                  : "text-gray-600 hover:text-[#1e7e34]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Auth & Admin */}
        <div className="flex items-center gap-4">
          {user?.role === "admin" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/admin")}
              className="hidden sm:inline-flex"
            >
              관리자
            </Button>
          )}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm text-gray-600">
                {user.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
              >
                로그아웃
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="bg-[#1e7e34] hover:bg-[#0d5a1f]"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              로그인
            </Button>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-gray-50 border-t">
          <div className="container py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  setLocation(item.href);
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2 px-3 rounded transition-colors ${
                  isActive(item.href)
                    ? "bg-[#1e7e34] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}
            {user?.role === "admin" && (
              <button
                onClick={() => {
                  setLocation("/admin");
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 px-3 rounded text-gray-600 hover:bg-gray-100"
              >
                관리자
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
