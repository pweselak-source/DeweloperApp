import dom1 from '../assets/dom1.jpg'
import dom2 from '../assets/dom2.jpg'
import dom3 from '../assets/dom3.jpg'

const slideshowImages = [dom1, dom2, dom3]

/** Wspólne tło (slideshow) + blok tekstu jak w zwiniętym lewym menu na stronie głównej. */
export function ResidentIntroSlideshowPanel() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0">
          {slideshowImages.map((src, idx) => (
            <img
              key={src}
              src={src}
              alt="Dziennik budowy"
              className={`absolute h-full w-full object-cover ${
                idx === 0
                  ? 'animate-[slideshow1_24s_ease-in-out_infinite]'
                  : idx === 1
                    ? 'animate-[slideshow2_24s_ease-in-out_infinite]'
                    : 'animate-[slideshow3_24s_ease-in-out_infinite]'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative theme-domesta-colors-intro-text">
        <div className="menu-intro-glass rounded-2xl border border-white/30 bg-white/10 p-4 backdrop-blur-[12px]">
          <p className="text-[0.8125rem] font-semibold leading-tight text-[#1e293b]">
            Deweloper Domesta – Twój partner w podróży
          </p>
          <p className="mt-1 text-[0.6875rem] leading-tight text-slate-800">
            Aplikacja poprowadzi Cię krok po kroku – od podpisania umowy deweloperskiej aż po akt notarialny.
          </p>
        </div>
      </div>
    </>
  )
}
