import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo = ({ className = "h-16 w-auto" }: LogoProps) => {
  return (
    <svg 
      viewBox="0 0 800 600" 
      className={className}
      role="img"
      aria-label="L'Arche de Ringo"
    >
      <g>
        {/* Perroquet turquoise */}
        <path
          fill="#40E0D0"
          d="M150 150 C120 140, 100 160, 90 190 C80 220, 85 250, 110 270 C135 290, 170 280, 180 250 C190 220, 180 160, 150 150"
        />
        
        {/* Groupe d'animaux */}
        <g transform="translate(200, 250)">
          {/* Renard/chien jaune-orange avec dégradé */}
          <path
            fill="#FFB347"
            d="M50 100 C80 100, 100 80, 110 60 C120 40, 120 20, 110 0 C100 -20, 80 -30, 50 -30 C20 -30, 0 -20, -10 0 C-20 20, -20 40, -10 60 C0 80, 20 100, 50 100"
            style={{ opacity: 0.7 }}
          />
          
          {/* Lapin rose */}
          <path
            fill="#FF69B4"
            d="M160 80 C180 80, 190 70, 195 50 C200 30, 200 10, 195 0 C190 -10, 180 -20, 160 -20 C140 -20, 130 -10, 125 0 C120 10, 120 30, 125 50 C130 70, 140 80, 160 80"
            style={{ opacity: 0.7 }}
          />
          
          {/* Canard bleu */}
          <path
            fill="#4169E1"
            d="M240 60 C255 60, 265 50, 270 35 C275 20, 275 5, 270 -5 C265 -15, 255 -20, 240 -20 C225 -20, 215 -15, 210 -5 C205 5, 205 20, 210 35 C215 50, 225 60, 240 60"
            style={{ opacity: 0.7 }}
          />
        </g>
        
        {/* Texte "L'Arche de Ringo" */}
        <g transform="translate(400, 350)">
          <text
            textAnchor="middle"
            fill="#2F4F4F"
            style={{
              fontSize: '60px',
              fontFamily: 'Arial',
              fontWeight: 'bold'
            }}
          >
            <tspan x="0" y="0">L'Arche</tspan>
            <tspan x="0" y="70">de</tspan>
            <tspan x="0" y="140">Ringo</tspan>
          </text>
        </g>
        
        {/* Sous-titre */}
        <text
          x="400"
          y="550"
          textAnchor="middle"
          fill="#2F4F4F"
          style={{
            fontSize: '24px',
            fontFamily: 'Arial'
          }}
        >
          Refuge pour Animaux Domestiques
        </text>
        
        {/* Patte à la fin du texte Ringo */}
        <circle
          cx="510"
          cy="490"
          r="8"
          fill="#2F4F4F"
        />
      </g>
    </svg>
  );
};

export default Logo; 