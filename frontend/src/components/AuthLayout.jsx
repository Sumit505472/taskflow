import { Link } from "react-router-dom";
import taskGif from "../assets/task.gif";

const AuthLayout = ({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLinkText,
}) => {
  return (
    <main className="min-h-screen bg-[#8F8CF7] flex items-center justify-center p-6">

      {/* MAIN CONTAINER */}
      <section className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl flex">

        {/* LEFT SECTION */}
        <div className="w-1/2 px-16 py-14 flex flex-col justify-center">

          {/* LOGO */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4338CA] text-2xl font-bold text-white">
              T
            </div>

            <h1 className="text-4xl font-bold text-[#4338CA]">
              TaskFlow
            </h1>
          </div>

          {/* TITLE */}
          <h2 className="text-5xl font-bold text-slate-900">
            {title}
          </h2>

          {/* SUBTITLE */}
          <p className="mt-4 text-lg text-slate-500">
            {subtitle}
          </p>

          {/* FORM */}
          <div className="mt-10">
            {children}
          </div>

          {/* FOOTER */}
          <p className="mt-10 text-center text-lg text-slate-500">
            {footerText}

            <Link
              className="ml-2 font-semibold text-[#4338CA] hover:underline"
              to={footerLink}
            >
              {footerLinkText}
            </Link>
          </p>
        </div>

        {/* RIGHT SECTION */}
        <div className="w-1/2 bg-[#8F8CF7] flex flex-col items-center justify-center p-10">

          {/* GIF */}
          <img
            src={taskGif}
            alt="Task Management"
            className="w-[90%] max-w-md object-contain"
          />

          {/* TEXT */}
          <h2 className="mt-6 text-4xl font-bold text-white text-center">
            Manage Tasks Smarter
          </h2>

          <p className="mt-4 max-w-md text-center text-lg leading-relaxed text-blue-100">
            Organize work, assign tasks, upload documents,
            and boost productivity with TaskFlow.
          </p>

          {/* DOTS */}
          <div className="mt-8 flex gap-3">
            <div className="h-4 w-4 rounded-full bg-white"></div>
            <div className="h-4 w-4 rounded-full bg-white/60"></div>
            <div className="h-4 w-4 rounded-full bg-white/60"></div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;