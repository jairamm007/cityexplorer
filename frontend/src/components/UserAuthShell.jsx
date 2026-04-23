import { Link } from 'react-router-dom';

const AuthShell = ({ eyebrow = 'Private Access', title, description, children, asideTitle, asideText }) => {
  return (
    <div className="relative min-h-[calc(100vh-10rem)] overflow-hidden rounded-[40px] bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.22),_transparent_30%),linear-gradient(135deg,#fff8ee_0%,#f5ede2_48%,#f8fafc_100%)] shadow-2xl shadow-amber-100/40">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.45)_38%,transparent_62%)]" />
      <div className="relative grid min-h-[calc(100vh-10rem)] gap-10 px-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
        <section className="flex flex-col justify-between rounded-[32px] bg-slate-950 px-7 py-8 text-white shadow-xl shadow-slate-900/20">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-amber-300">{eyebrow}</p>
            <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight">{title}</h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-300">{description}</p>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-amber-300">Protected Travel Hub</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Sign in to explore cities, discover attractions, and manage your saved plans.
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-amber-300">Verified Access</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Email, Google sign-in, and account settings all stay connected in one secure flow.
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">{asideTitle || 'Before you continue'}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {asideText || 'Only signed-in users can access the full CityExplorer website interface.'}
              </p>
              <Link
                to="/register"
                className="mt-4 inline-flex rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                Create account
              </Link>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-xl shadow-slate-200/60 backdrop-blur">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthShell;
