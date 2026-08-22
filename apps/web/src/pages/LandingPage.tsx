/** Landing 落地页：浮动导航 + Hero 区（warm off-white + 橙色渐变）。 */
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function ChevronDown() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** 浮动导航：全宽外层 + 白色圆角内导航条 */
export function LandingNavbar() {
  return (
    <div className="px-6 pt-4 lg:px-8">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-xl bg-white px-8 py-5 shadow-sm">
        {/* Logo */}
        <Link to="/landing" className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-[hsl(240,10%,10%)]">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(240,10%,10%)]">
            <span className="h-3 w-3 rounded-sm bg-white" />
          </span>
          nickel
        </Link>

        {/* 中间链接（移动端隐藏） */}
        <div className="hidden items-center gap-6 md:flex">
          <button className="flex items-center gap-1 text-base font-medium text-[hsl(240,10%,10%)]/80 transition-colors hover:text-[hsl(240,10%,10%)]">
            Products <ChevronDown />
          </button>
          <button className="flex items-center gap-1 text-base font-medium text-[hsl(240,10%,10%)]/80 transition-colors hover:text-[hsl(240,10%,10%)]">
            Company <ChevronDown />
          </button>
          <Link to="/landing" className="text-base font-medium text-[hsl(240,10%,10%)]/80 transition-colors hover:text-[hsl(240,10%,10%)]">
            Pricing
          </Link>
          <Link to="/landing" className="text-base font-medium text-[hsl(240,10%,10%)]/80 transition-colors hover:text-[hsl(240,10%,10%)]">
            For Accountants
          </Link>
        </div>

        {/* 右侧动作 */}
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="hidden text-base font-medium text-[hsl(240,10%,10%)]/80 transition-colors hover:text-[hsl(240,10%,10%)] sm:block"
          >
            Log in
          </Link>
          <Link to="/register">
            <Button variant="hero">Get started</Button>
          </Link>
        </div>
      </nav>
    </div>
  );
}

/** Hero 区：左文右视频 */
function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[hsl(249,18%,95%)]">
      {/* 内容 */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center px-6 lg:px-8">
        <div className="max-w-xl">
          <h1 className="text-5xl font-medium leading-[1.05] tracking-tight text-[hsl(240,10%,10%)] sm:text-6xl lg:text-7xl">
            Unlock growth with every payment
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[hsl(240,5%,46%)] sm:text-xl">
            Run payments, extend net terms and automate collections compliance.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button variant="hero" size="xl">
              Get started
            </Button>
            <Button variant="hero-outline" size="xl">
              Talk to a human
            </Button>
          </div>
        </div>
      </div>

      {/* 右侧视频 */}
      <div className="absolute right-0 top-0 hidden h-full w-[55%] lg:block">
        <video
          className="h-full w-full rounded-bl-2xl object-cover"
          autoPlay
          loop
          muted
          playsInline
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_192508_4eecde4c-f835-4f4b-b255-eafd1156da99.mp4"
        />
      </div>
    </section>
  );
}

/** Landing 页：Navbar + HeroSection */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(249,18%,95%)] font-[Inter,system-ui,sans-serif]">
      <LandingNavbar />
      <HeroSection />
    </div>
  );
}
