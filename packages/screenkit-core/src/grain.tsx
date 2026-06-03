/* Shared diegetic film-grain overlay used by insert scenes. */
export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-screen"
      style={{
        backgroundImage:
          "radial-gradient(circle, #fff 0.5px, transparent 0.6px)",
        backgroundSize: "3px 3px",
      }}
    />
  )
}
