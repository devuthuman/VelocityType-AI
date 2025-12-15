import React, { useState, useEffect } from 'react';
import { KeyboardLayout } from '../types';
import { KEYBOARD_LAYOUTS } from '../constants';

interface VirtualKeyboardProps {
  layout: KeyboardLayout;
  activeKey: string | null;
  pressedKey: string | null;
  isCorrect: boolean | null;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ layout, activeKey, pressedKey, isCorrect }) => {
  const keys = KEYBOARD_LAYOUTS[layout];
  
  // State to track the momentarily "flashing" key for visual feedback
  const [flashingKey, setFlashingKey] = useState<string | null>(null);

  // Trigger the flash effect whenever pressedKey or activeKey changes.
  // We include activeKey to ensure repeated letters (like 'll') trigger the effect 
  // because the active cursor moves even if the pressed char is the same.
  useEffect(() => {
    if (pressedKey) {
      setFlashingKey(pressedKey);
      const timer = setTimeout(() => {
        setFlashingKey(null);
      }, 150); // Duration matches the CSS animation time roughly
      return () => clearTimeout(timer);
    }
  }, [pressedKey, activeKey]);

  const getKeyStyle = (keyLabel: string) => {
    const baseStyle = "flex items-center justify-center m-1 rounded transition-colors duration-100 font-mono text-sm shadow-md border-b-2 border-gray-900";
    let sizeStyle = "w-10 h-10";
    let colorStyle = "bg-gray-700 text-gray-300";
    let animationStyle = "";

    // Handle special key sizes
    if (keyLabel === "Space") sizeStyle = "w-64 h-10";
    else if (keyLabel === "Backspace" || keyLabel === "Tab" || keyLabel === "Enter" || keyLabel === "Caps" || keyLabel === "Shift") sizeStyle = "w-20 h-10 px-2";
    
    // Normalize keys for comparison (case insensitive for letters)
    const normalizedActive = activeKey?.toLowerCase();
    const normalizedPressed = pressedKey?.toLowerCase();
    const normalizedFlashing = flashingKey?.toLowerCase();
    const normalizedLabel = keyLabel.toLowerCase();

    // Logic for Highlighting
    if (normalizedLabel === normalizedActive || (keyLabel === 'Space' && activeKey === ' ')) {
       // This is the key the user SHOULD press
       colorStyle = "bg-brand-500 text-white border-brand-900 shadow-[0_0_15px_rgba(14,165,233,0.5)] transform translate-y-0.5";
    } else if (normalizedLabel === normalizedPressed || (keyLabel === 'Space' && pressedKey === ' ')) {
       // This is the key the user DID press (persistent status color)
       if (isCorrect === false) {
         colorStyle = "bg-red-500 text-white border-red-900";
       } else if (isCorrect === true) {
         colorStyle = "bg-green-500 text-white border-green-900";
       } else {
         colorStyle = "bg-gray-600 text-white";
       }
    }

    // Apply transient animation if this is the flashing key
    if (normalizedLabel === normalizedFlashing || (keyLabel === 'Space' && flashingKey === ' ')) {
      animationStyle = "animate-keypress ring-2 ring-white/30";
    }

    return `${baseStyle} ${sizeStyle} ${colorStyle} ${animationStyle}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-dark-800 rounded-xl shadow-2xl border border-gray-700 select-none mt-8">
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((keyLabel, keyIndex) => (
            <div key={`${rowIndex}-${keyIndex}`} className={getKeyStyle(keyLabel)}>
              {keyLabel === "Space" ? "␣" : keyLabel}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default VirtualKeyboard;