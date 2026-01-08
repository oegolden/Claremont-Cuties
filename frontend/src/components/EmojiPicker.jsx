import React, { useState, useRef, useEffect } from 'react';

const COMMON_EMOJIS = ['😀','😂','😊','😍','👍','🎉','😢','🔥','👏','🙏','🙌','😎','😉','🤔','😴'];

// EmojiPicker will try to dynamically import `emoji-picker-react` (full UTF emoji set)
// if it's installed. If not, it falls back to a small built-in picker.
export default function EmojiPicker({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [Picker, setPicker] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    let mounted = true;
    import('emoji-picker-react')
      .then((mod) => {
        if (!mounted) return;
        setPicker(() => mod.default || mod);
      })
      .catch(() => {
        if (mounted) setPicker(null);
      });

    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => {
      mounted = false;
      document.removeEventListener('click', onDoc);
    };
  }, []);

  const handleSelect = (emoji) => {
    try { onSelect(emoji); } catch (e) { /* ignore */ }
    setOpen(false);
  };

  return (
    <div className="emoji-picker" ref={ref}>
      <button type="button" className="emoji-button" onClick={() => setOpen(!open)} aria-label="Open emoji picker">😊</button>
      {open && (
        <div className="emoji-panel" role="list">
          {Picker ? (
            <Picker
              emojiStyle="native"
              onEmojiClick={(e, data) => {
                const emoji = (data && data.emoji) || (e && e.emoji) || (data && data.unified) || String(e);
                handleSelect(emoji);
              }}
            />
          ) : (
            COMMON_EMOJIS.map(e => (
              <button key={e} type="button" className="emoji-item" onClick={() => handleSelect(e)} aria-label={`Insert ${e}`}>
                {e}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
