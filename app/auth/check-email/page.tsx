import Link from "next/link";

export const dynamic = "force-dynamic";

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/60 p-8 shadow-2xl backdrop-blur">
        <div className="space-y-4 text-center">
          <div>
            <p className="text-2xl font-semibold text-white">Check Your Email</p>
            <p className="text-sm text-white/70">
              We&apos;ve sent you a confirmation email.
            </p>
          </div>
          <p className="text-sm text-white/80">
            Please open your inbox and click the confirmation link to activate your account. Once confirmed, you
            can return here to sign in.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex w-full items-center justify-center rounded-md bg-emerald-400/90 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-300"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
