import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { InteractiveSegment, Segment } from '../components/segment_remove';
import { InteractiveAdd } from '../components/add_new';
import { PoissonCanvas } from '../components/PoissonCanvas';
import History from '../components/History';
import { FaCog } from 'react-icons/fa'; 

type CanvasData = {
  canvas: HTMLCanvasElement | null;
  image: HTMLImageElement | null;
  size: { width: number; height: number };
};

export default function Home() {
  const [selectedCard, setSelectedCard] = useState<{file: File, processedImage: string | null} | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [points, setPoints] = useState<{ x: number, y: number }[]>([]);
  const [test, setTest] = useState<string>('');
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  useEffect(() => {
    const authenticated = localStorage.getItem('authenticated') === 'true';
    if (!authenticated) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return null; 
  }

  const handleSectionClick = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleClick = (card: any) => {
    setSelectedCard(card);
  };

  return (
    <div className="bg-white min-h-screen flex">
      <div style={{backgroundColor: '#526F90'}} className="flex flex-col w-[15%] bg-slate-500 min-h-screen">
        <div className="flex flex-col grow px-6 pt-14 pb-9 w-full">
          <div className="text-4xl font-semibold tracking-tight leading-[10px] text-slate-300">
            MedX
          </div>
          <div
            style={{
              backgroundColor: activeSection === 'segment' ? '#D5E5E5' : '#EEEEEE',
              color: '#2D3F50'
            }}
            className="flex flex-col justify-center px-4 pt-2 pb-1.5 mt-14 w-full text-base font-medium leading-6 rounded-lg max-md:mt-10 cursor-pointer"
            onClick={() => handleSectionClick('segment')}
          >
            <div className="flex gap-2.5">
              <div className="grow my-auto text-ellipsis">Segment and Remove</div>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/89977c1d4ef13da42929ab430c40ed8fa7255aa2c08e82955f35a155d596d710?"
                className={`shrink-0 w-6 aspect-square ${activeSection === 'segment' ? 'rotate-90' : ''}`}
              />
            </div>
          </div>
          {activeSection === 'segment' && (
            <div className="mt-2">
              <InteractiveSegment points={points} setPoints={setPoints} setTest={setTest} test={test} />
            </div>
          )}
          <div
            style={{
              backgroundColor: activeSection === 'add' ? '#D5E5E5' : '#EEEEEE',
              color: '#2D3F50'
            }}
            className="flex gap-2 justify-center px-4 py-2 mt-6 text-base font-medium leading-6 rounded-lg bg-zinc-100 text-slate-700 cursor-pointer"
            onClick={() => handleSectionClick('add')}
          >
            <div className="flex-1 text-ellipsis">Add external object</div>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/89977c1d4ef13da42929ab430c40ed8fa7255aa2c08e82955f35a155d596d710?"
              className={`shrink-0 w-6 aspect-square ${activeSection === 'add' ? 'rotate-90' : ''}`}
            />
          </div>
          {activeSection === 'add' && (
            <div className="mt-2">
              <InteractiveAdd onCardClick={handleClick} />
            </div>
          )}
          <div
            style={{
              backgroundColor: activeSection === 'history' ? '#D5E5E5' : '#EEEEEE',
              color: '#2D3F50'
            }}
            className="flex gap-2 justify-center px-4 py-2 mt-6 text-base font-medium leading-6 whitespace-nowrap rounded-lg cursor-pointe"
            onClick={() => handleSectionClick('history')}
          >
            <div className="flex-1 text-ellipsis">History</div>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/89977c1d4ef13da42929ab430c40ed8fa7255aa2c08e82955f35a155d596d710?"
              className="shrink-0 w-6 aspect-square"
            />
          </div>
          <div 
            style={{
              backgroundColor: activeSection === 'settings' ? '#D5E5E5' : '#EEEEEE',
              color: '#2D3F50'
            }}
            className="flex items-center gap-4 px-4 py-2 mt-auto text-base font-medium leading-6 whitespace-nowrap rounded-lg max-md:mt-10"
            onClick={() => handleSectionClick('settings')}
            >
            <FaCog style={{ color: '#2D3F50' }} className="shrink-0 w-5 h-5" />
              <div className="flex-1 text-ellipsis">Settings</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-[85%] max-md:ml-0 max-md:w-full">
        {activeSection === 'segment' && (
          <div className="flex flex-col">
            <Segment points={points} setPoints={setPoints} setTest={setTest} test={test} />
          </div>
        )}
        {activeSection === 'add' && (
          <div className="flex flex-col">
            <PoissonCanvas selectedCard={selectedCard} />
          </div>
        )}
        {activeSection === 'history' && (
          <div className="flex-wrap justify-between content-between px-4 py-4 mx-12 my-12 text-2xl leading-10 text-black whitespace-nowrap rounded-lg max-md:mt-10 max-md:max-w-full">
            <History />
          </div>
        )}
        {!activeSection && (
          <div className="flex-wrap justify-between content-between px-4 py-4 mx-12 my-12 text-2xl leading-10 whitespace-nowrap rounded-lg border border-solid border-neutral-200 max-md:mt-10 max-md:max-w-full">
            Instructions:
            <br />
            Content here
            <br />
            <br />
          </div>
        )}
      </div>
    </div>
  );
}
