import * as React from "react";

export default function Home() {
  return (
    <div className="flex flex-col bg-neutral-100">
      <div className="flex gap-5 justify-between px-7 py-3 w-full bg-white border-b border-solid border-neutral-200 max-md:flex-wrap max-md:px-5 max-md:max-w-full">
        <div className="my-auto text-xl font-semibold tracking-normal leading-8 text-black">
          MedX
        </div>
        <div className="flex gap-5 justify-between">
          <div className="flex gap-3">
            <div className="flex justify-center items-center px-4 py-2 rounded-lg bg-zinc-100">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/8d63a5fc2c5586a61568dadfd60e7fcc434fcc26de3d8c0acfaf3a36beb5dbc5?"
                className="w-6 aspect-square"
              />
            </div>
            <div className="justify-center px-4 py-2 text-base font-medium leading-6 text-black whitespace-nowrap rounded-lg bg-zinc-100">
              Button
            </div>
            <div className="justify-center px-4 py-2 text-base font-medium leading-6 text-white whitespace-nowrap bg-black rounded-lg">
              Share
            </div>
          </div>
          <div className="flex gap-2">
            <img
              loading="lazy"
              srcSet="..."
              className="shrink-0 w-10 aspect-square"
            />
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/245de0f0c45e9a16d332378bca3d5ff08d50f4cf294ae90ec616490145201c21?"
              className="shrink-0 my-auto w-6 aspect-square"
            />
          </div>
        </div>
      </div>
      <div className="w-full max-md:max-w-full">
        <div className="flex max-md:flex-col">
          <div className="flex flex-col w-[15%] max-md:w-full">
            <div className="flex flex-col grow px-7 pt-12 pb-5 mx-auto w-full text-base font-medium leading-6 bg-white border-r border-solid border-neutral-200 text-neutral-700 max-md:px-5 max-md:mt-9">
              <div className="flex gap-2 justify-center px-4 py-2 rounded-lg bg-zinc-100">
                <div className="flex-1 text-ellipsis">Segment and Remove</div>
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/89977c1d4ef13da42929ab430c40ed8fa7255aa2c08e82955f35a155d596d710?"
                  className="shrink-0 w-6 aspect-square"
                />
              </div>
              <div className="flex gap-2 justify-center px-4 py-2 mt-7 rounded-lg bg-zinc-100">
                <div className="flex-1 text-ellipsis">Add external object</div>
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/89977c1d4ef13da42929ab430c40ed8fa7255aa2c08e82955f35a155d596d710?"
                  className="shrink-0 w-6 aspect-square"
                />
              </div>
              <div className="flex gap-2 justify-center px-4 py-2 mt-7 whitespace-nowrap rounded-lg bg-zinc-100">
                <div className="flex-1 text-ellipsis">History</div>
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/89977c1d4ef13da42929ab430c40ed8fa7255aa2c08e82955f35a155d596d710?"
                  className="shrink-0 w-6 aspect-square"
                />
              </div>
              <div className="flex gap-4 px-4 py-2 whitespace-nowrap bg-white rounded-lg mt-[551px] max-md:mt-10">
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/44ca30a05a803d14713b8add7dae801d735cc5768d706b6cb4e8162654ad9477?"
                  className="shrink-0 w-6 aspect-square"
                />
                <div className="flex-1 text-ellipsis">Settings</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col ml-5 w-[85%] max-md:ml-0 max-md:w-full">
            <div className="flex-wrap justify-between content-between px-4 py-4 mx-12 my-12 text-2xl leading-10 text-black whitespace-nowrap rounded-lg border border-solid border-neutral-200 max-md:mt-10 max-md:max-w-full">
              Instructions:
              <br />
              vewfwewefew
              <br />
              dfefeferr
              <br />
              fewffefe
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
