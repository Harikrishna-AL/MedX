import { useState } from 'react';

export function InteractiveSegment() {
  const [confidence, setConfidence] = useState(0.92);

  return (
    <div className="flex flex-col p-4 bg-white rounded-lg shadow-md">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Confidence</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          className="my-2"
        />
        <div className="text-gray-500 text-right">{confidence.toFixed(2)}</div>
      </div>
    </div>


  );
}

export function Segment() {
  return (
    <div className="flex flex-col h-full">
            <div className="flex flex-col grow max-md:max-w-full h-full">
              <div className="px-6 pt-6 bg-white max-md:px-5 max-md:max-w-full h-full">
                <div className="flex gap-5 max-md:flex-col max-md:gap-0">
                  <div className="flex flex-col w-6/12 max-md:ml-0 max-md:w-full h-full">
                    <div className="flex flex-col grow self-stretch pt-1.5 pb-20 max-md:mt-10 max-md:max-w-full h-full">
                      <div className="text-base font-medium leading-6 text-ellipsis text-neutral-700 max-md:max-w-full h-full">
                        Input
                      </div>
                      <div className="justify-center p-6 mt-3 text-2xl leading-8 bg-white rounded-lg border border-solid border-neutral-200 text-zinc-500 max-md:px-5 max-md:max-w-full">
                        What kind of image would you like to create? The more
                        detailed, the better.
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col ml-5 w-6/12 max-md:ml-0 max-md:w-full">
                    <div className="flex flex-col grow justify-center self-stretch pt-1.5 max-md:mt-10 max-md:max-w-full h-full">
                      <div className="text-base font-medium leading-6 text-ellipsis text-neutral-700 max-md:max-w-full h-full">
                        Output
                      </div>
                      <div className="flex flex-col justify-center px-16 py-20 mt-3 rounded-lg border border-solid bg-neutral-100 border-neutral-200 max-md:px-5 max-md:max-w-full h-full">
                        <img
                          loading="lazy"
                          srcSet="..."
                          className="mt-3.5 mr-7 mb-4 ml-7 w-full aspect-[0.75] max-md:mx-2.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-5 justify-end py-6 pr-8 pl-20 text-base font-medium leading-6 bg-white max-md:flex-wrap max-md:px-5">
                <div className="justify-center px-4 py-2 text-white whitespace-nowrap rounded-lg bg-neutral-700">
                  Save
                </div>
                <div className="justify-center px-4 py-2 rounded-lg bg-zinc-100 text-neutral-700">
                  Try again
                </div>
              </div>
            </div>
          </div>

    
  );
}
