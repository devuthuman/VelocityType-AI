import { KeyboardLayout } from './types';

export const KEYBOARD_LAYOUTS: Record<KeyboardLayout, string[][]> = {
  [KeyboardLayout.QWERTY]: [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
    ['Space']
  ],
  [KeyboardLayout.AZERTY]: [
    ['²', '&', 'é', '"', "'", '(', '-', 'è', '_', 'ç', 'à', ')', '=', 'Backspace'],
    ['Tab', 'a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '^', '$', '*'],
    ['Caps', 'q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'ù', 'Enter'],
    ['Shift', '<', 'w', 'x', 'c', 'v', 'b', 'n', ',', ';', ':', '!', 'Shift'],
    ['Space']
  ],
  [KeyboardLayout.DVORAK]: [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '[', ']', 'Backspace'],
    ['Tab', "'", ',', '.', 'p', 'y', 'f', 'g', 'c', 'r', 'l', '/', '=', '\\'],
    ['Caps', 'a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's', '-', 'Enter'],
    ['Shift', ';', 'q', 'j', 'k', 'x', 'b', 'm', 'w', 'v', 'z', 'Shift'],
    ['Space']
  ]
};

// Finger mapping for QWERTY (approximate for visualization)
// 1: Left Pinky, 2: Left Ring, 3: Left Middle, 4: Left Index
// 5: Right Index, 6: Right Middle, 7: Right Ring, 8: Right Pinky, 9: Thumb
export const FINGER_MAP: Record<string, number> = {
  'q': 1, 'a': 1, 'z': 1, '1': 1,
  'w': 2, 's': 2, 'x': 2, '2': 2,
  'e': 3, 'd': 3, 'c': 3, '3': 3,
  'r': 4, 'f': 4, 'v': 4, '4': 4, 't': 4, 'g': 4, 'b': 4, '5': 4, '6': 4,
  'y': 5, 'h': 5, 'n': 5, '7': 5, 'u': 5, 'j': 5, 'm': 5, '8': 5,
  'i': 6, 'k': 6, ',': 6, '9': 6,
  'o': 7, 'l': 7, '.': 7, '0': 7,
  'p': 8, ';': 8, '/': 8, '-': 8, '[': 8, ']': 8, "'": 8,
  ' ': 9
};