import VerifyEmail from "@/components/Auth/VerifyEmail";

export default function VerifyEmailPage() {
  return (
    <section className="py-20 lg:py-25 xl:py-30 bg-gray-50 dark:bg-gray-700">
      <div className="mx-auto max-w-[520px] px-4">
        <div className="rounded-3xl bg-white dark:bg-dark-2 shadow-card p-10">
          <VerifyEmail />
        </div>
      </div>
    </section>
  );
}