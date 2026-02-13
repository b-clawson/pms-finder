import { useState, useEffect } from 'react';

const HEX_PATTERN = /^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

export function useHexInput(initialValue?: string) {
  const [hexInput, setHexInput] = useState(initialValue ?? '');
  const [previewColor, setPreviewColor] = useState('#FF6A00');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const hex = hexInput.trim();
    if (hex === '') {
      setPreviewColor('#FF6A00');
      setIsValid(true);
      return;
    }
    if (HEX_PATTERN.test(hex)) {
      setPreviewColor(hex.startsWith('#') ? hex : `#${hex}`);
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [hexInput]);

  const normalizedHex = (() => {
    const hex = hexInput.trim();
    return hex.startsWith('#') ? hex : `#${hex}`;
  })();

  return { hexInput, setHexInput, previewColor, isValid, normalizedHex };
}
