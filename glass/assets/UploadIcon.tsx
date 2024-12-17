export const UploadIcon = () => {
    return (
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dotted Circle */}
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
          
          {/* Arrow pointing up */}
          <path d="M12 16V8M8 12l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Plus sign in the center */}
          <path d="M12 10V14M10 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  };
  