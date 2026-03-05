import svgPaths from "./svg-btgip5ewgi";

function Map() {
  return (
    <div className="relative shrink-0 size-[23.993px]" data-name="Map">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.9927 23.9927">
        <g id="Map">
          <path d={svgPaths.p1dbaa200} id="Vector" stroke="var(--stroke-0, #8B7E74)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49954" />
          <path d="M14.9954 5.76224V20.7577" id="Vector_2" stroke="var(--stroke-0, #8B7E74)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49954" />
          <path d="M8.99726 3.23501V18.2304" id="Vector_3" stroke="var(--stroke-0, #8B7E74)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49954" />
        </g>
      </svg>
    </div>
  );
}

function Span() {
  return (
    <div className="h-[16.497px] relative shrink-0 w-[22.986px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[16.5px] left-[11px] not-italic text-[#8b7e74] text-[11px] text-center top-[0.14px] tracking-[0.0645px] whitespace-nowrap">Map</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[3.993px] h-[60.472px] items-center left-[25.01px] py-[7.995px] rounded-[16px] top-[-5.99px] w-[71.978px]" data-name="button">
      <Map />
      <Span />
    </div>
  );
}

function Camera() {
  return (
    <div className="relative shrink-0 size-[23.993px]" data-name="Camera">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.9927 23.9927">
        <g id="Camera">
          <path d={svgPaths.p27658200} id="Vector" stroke="var(--stroke-0, #8B7E74)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49954" />
          <path d={svgPaths.p21e1b300} id="Vector_2" stroke="var(--stroke-0, #8B7E74)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49954" />
        </g>
      </svg>
    </div>
  );
}

function Div1() {
  return (
    <div className="bg-[#f5efe7] relative rounded-[19139600px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] shrink-0 size-[55.998px]" data-name="div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.009px] relative size-full">
        <Camera />
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[84.482px] items-center left-[147px] pb-[7.995px] rounded-[16px] top-[-30.62px] w-[103.983px]" data-name="button">
      <Div1 />
    </div>
  );
}

function Span1() {
  return (
    <div className="absolute h-[16.497px] left-[187px] top-[30.43px] w-[22.362px]" data-name="span">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[16.5px] left-[11px] not-italic text-[#a39b94] text-[11px] text-center top-[0.14px] tracking-[0.0645px] whitespace-nowrap">Feel</p>
    </div>
  );
}

function User() {
  return (
    <div className="relative shrink-0 size-[23.993px]" data-name="User">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.9927 23.9927">
        <g id="User">
          <path d={svgPaths.pf20da00} id="Vector" stroke="var(--stroke-0, #A39B94)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49954" />
          <path d={svgPaths.p180caa00} id="Vector_2" stroke="var(--stroke-0, #A39B94)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49954" />
        </g>
      </svg>
    </div>
  );
}

function Span2() {
  return (
    <div className="h-[16.497px] relative shrink-0 w-[19.822px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[16.5px] left-[10px] not-italic text-[#a39b94] text-[11px] text-center top-[0.14px] tracking-[0.0645px] whitespace-nowrap">You</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[3.993px] h-[60.472px] items-center left-[301px] py-[7.995px] rounded-[16px] top-[-5.99px] w-[71.978px]" data-name="button">
      <User />
      <Span2 />
    </div>
  );
}

function Div() {
  return (
    <div className="h-[84.482px] relative shrink-0 w-full" data-name="div">
      <Button />
      <Button1 />
      <Span1 />
      <Button2 />
    </div>
  );
}

export default function Nav() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start pt-[12.567px] px-[15.998px] relative size-full" data-name="nav">
      <div aria-hidden="true" className="absolute border-[rgba(139,126,116,0.15)] border-solid border-t-[0.57px] inset-0 pointer-events-none" />
      <Div />
    </div>
  );
}