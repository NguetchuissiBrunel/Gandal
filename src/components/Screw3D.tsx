'use client';

interface Screw3DProps {
  className?: string;
}

/**
 * Vis métallique 3D photoréaliste — tête plate (tiret)
 * Simule le rendu d'une vis inox sur rack de serveur physique.
 */
export default function Screw3D({ className = '' }: Screw3DProps) {
  return (
    <div
      className={`absolute w-6 h-6 rounded-full select-none z-10 flex items-center justify-center ${className}`}
      style={{
        background: 'radial-gradient(circle at 35% 30%, #e2e8f0, #94a3b8 60%, #475569)',
        boxShadow:
          'inset 0 1.5px 3px rgba(255,255,255,0.75), inset 0 -1px 2px rgba(0,0,0,0.25), 0 2px 5px rgba(0,0,0,0.28)',
        border: '1px solid #cbd5e1',
      }}
    >
      {/* Disque intérieur – cuvette de tête */}
      <div
        className="w-4 h-4 rounded-full flex items-center justify-center relative"
        style={{
          background: 'radial-gradient(circle at 40% 35%, #f1f5f9, #64748b)',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.22), inset 0 -0.5px 1px rgba(255,255,255,0.4)',
        }}
      >
        {/* Rainure plate — barre horizontale (tiret) */}
        <div
          className="absolute rounded-sm"
          style={{
            width: '70%',
            height: '2.5px',
            background: 'rgba(15,23,42,0.85)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.25), inset 0 1px 1px rgba(0,0,0,0.5)',
          }}
        />
      </div>
    </div>
  );
}
