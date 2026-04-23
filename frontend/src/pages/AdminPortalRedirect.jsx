import { useMemo } from 'react';

const AdminPortalRedirect = () => {
  const adminPortalUrl = useMemo(() => {
    return '/admin';
  }, []);

  if (typeof window !== 'undefined') {
    window.location.replace(adminPortalUrl);
  }

  return (
    <section className="mx-auto max-w-2xl rounded-[32px] bg-white p-8 shadow-xl">
      <h1 className="text-2xl font-semibold text-slate-900">Opening admin portal...</h1>
      <p className="mt-3 text-slate-600">If you are not redirected automatically, use the button below.</p>
      <a
        href={adminPortalUrl}
        className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
      >
        Open admin portal
      </a>
    </section>
  );
};

export default AdminPortalRedirect;