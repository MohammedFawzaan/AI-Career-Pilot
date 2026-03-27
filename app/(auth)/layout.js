const AuthLayout = ({ children }) => {
  return (
    <div className="flex justify-center pt-24 md:pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
