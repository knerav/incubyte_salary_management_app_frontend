import SignInForm from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Sign in</h1>
        <SignInForm />
      </div>
    </main>
  );
}
