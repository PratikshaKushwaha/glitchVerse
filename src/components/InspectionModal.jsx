import { sound } from '../utils/AudioEngine'

export default function InspectionModal({ object, onClose, onDiscoverClue }) {
  if (!object) return null

  const getDetails = (id) => {
    switch (id) {
      case 'terminal':
        onDiscoverClue && onDiscoverClue()
        return {
          title: 'GLITCHED COMPUTER TERMINAL',
          desc: 'A heavy cathode-ray monitor glows with an unstable phosphorescent green signal. Beneath the cracked screen casing, you discover a deeply carved code in the metal circuitry: [ 4 - 8 - 2 ]. The first digit "4" glows faintly gold.',
          isClue: true,
        }
      case 'cabinet':
        return {
          title: 'RUSTED FILING CABINET',
          desc: 'The drawers are rusted shut. Inside one half-open slot are water-damaged project logs titled "Project GlitchVerse - Core Architecture". No keycodes found here.',
          isClue: false,
        }
      case 'crates':
        return {
          title: 'STACKED CARGO CRATES',
          desc: 'Heavy wooden crates bound in steel bands. Stenciled markings read: "SECTOR 1 SUPPLIES - HAZARD CLASS 4". They appear empty.',
          isClue: false,
        }
      case 'bookshelf':
        return {
          title: 'ARCHIVAL BOOKSHELF',
          desc: 'Dusty reference manuals on dimensional computing and reality synthesis. A handwritten sticky note mentions: "Terminal by the wall holds the override cipher."',
          isClue: false,
        }
      case 'blueprint':
        return {
          title: 'TILTED FACILITY BLUEPRINT',
          desc: 'A framed architectural schematic of Sector 1. A faded red arrow points directly toward the terminal desk with the note: "Check the terminal screen".',
          isClue: false,
        }
      default:
        return {
          title: 'UNKNOWN OBJECT',
          desc: 'A mysterious object in the abandoned room.',
          isClue: false,
        }
    }
  }

  const details = getDetails(object.id)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none font-mono"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-cyan-500/40 bg-gradient-to-b from-[#09151e] to-[#04090e] p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-cyan-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <h3 className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
              {details.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-cyan-400/60 hover:text-cyan-200 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-cyan-100/90 bg-cyan-950/20 p-4 rounded border border-cyan-500/20">
          {details.desc}
        </p>

        {details.isClue && (
          <div className="mt-4 p-3 rounded bg-yellow-950/40 border border-yellow-500/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-yellow-400 uppercase tracking-widest font-bold block">
                ✨ SECRET CIPHER REVEALED
              </span>
              <span className="text-xl font-bold tracking-widest text-yellow-300">
                [ 4 - 8 - 2 ]
              </span>
            </div>
            <span className="text-[10px] text-yellow-200/80 max-w-[150px] text-right">
              Enter this on the exit blast door keypad!
            </span>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-black rounded cursor-pointer transition shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            Close [E]
          </button>
        </div>
      </div>
    </div>
  )
}
