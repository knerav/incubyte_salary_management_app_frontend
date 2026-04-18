import AuthHero from "@/components/auth/AuthHero";
import SignInForm from "@/components/auth/SignInForm";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-neutral-50">
      <AuthHero />

      <div className="flex-1 lg:w-2/5 flex flex-col justify-center px-6 sm:px-12 lg:px-10 xl:px-14 py-10 bg-white lg:min-h-screen">
        <div className="lg:hidden mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-amber-600">HR</span>
            <span className="text-neutral-900">Pulse</span>
          </span>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-7 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-neutral-900">Welcome back</h2>
            <p className="mt-1 text-sm text-neutral-500">Sign in to your HR account</p>
          </div>

          <SignInForm />

          <p className="mt-6 text-center text-sm text-neutral-500">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-medium text-amber-700 hover:text-amber-600">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
