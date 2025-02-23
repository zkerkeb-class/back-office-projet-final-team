import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, isDarkMode }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div
            className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3
                    className={`text-lg font-medium leading-6 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {title}
                  </h3>
                  <div className="mt-2">{children}</div>
                </div>
              </div>
            </div>
            <div
              className={`px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 ${
                isDarkMode ? 'border-t border-gray-700' : 'bg-gray-50'
              }`}
            >
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
