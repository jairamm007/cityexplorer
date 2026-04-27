const ToastCloseButton = ({ closeToast }) => (
  <button
    type="button"
    aria-label="Close notification"
    onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();
      closeToast?.();
    }}
    className="Toastify__close-button Toastify__close-button--light pointer-events-auto opacity-100 transition hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-slate-400"
  >
    <span aria-hidden="true" className="block text-3xl leading-5 text-slate-950">
      &times;
    </span>
  </button>
);

export const toastContainerProps = {
  position: 'top-right',
  autoClose: 3000,
  closeButton: ToastCloseButton,
  closeOnClick: false,
  pauseOnHover: true,
  newestOnTop: true,
};

export default ToastCloseButton;
