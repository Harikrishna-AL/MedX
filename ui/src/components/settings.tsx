import * as React from "react";

function MyComponent() {
  return (
    <div className="flex gap-5 pr-20 text-base font-medium leading-6 bg-white text-slate-700 max-md:flex-wrap max-md:pr-5">
      <div className="flex flex-col self-start mt-36 max-md:mt-10 max-md:max-w-full">
        <div className="text-3xl font-semibold tracking-tight leading-8 max-md:max-w-full">
          My profile
        </div>
        <div className="mt-8 text-ellipsis max-md:max-w-full">Username</div>
        <div className="justify-center px-4 py-2 mt-2 whitespace-nowrap bg-white rounded-lg border border-solid border-neutral-200 text-ellipsis max-md:max-w-full">
          @username123
        </div>
        <div className="mt-8 text-ellipsis max-md:max-w-full">Email</div>
        <div className="justify-center px-4 py-2 mt-2 whitespace-nowrap bg-white rounded-lg border border-solid border-neutral-200 text-ellipsis max-md:max-w-full">
          email@domain.com
        </div>
        <div className="justify-center self-start px-4 py-2 mt-8 text-white rounded-lg bg-slate-700">
          Save changes
        </div>
      </div>
    </div>
  );
}

