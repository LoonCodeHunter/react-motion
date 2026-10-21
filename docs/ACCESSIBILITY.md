# Accessibility and inclusive motion

Motion should communicate cause, hierarchy and feedback without limiting access. Preserve equivalents for system reduced-motion preferences, keyboard navigation and screen readers.

**Reduced motion:** The React `MotionConfig` policy supports `user`, `always` and `never`. Use `user` by default and explicitly test it. Non-essential translations/zoom should reduce to short fades or instantaneous state updates where suitable. Don't assume CSS-only preferences automatically stop every JS animation; test both layers.

**Keyboard and pointer:** Use `motion.button` for actions, not `motion.div` with an `onClick`. Gesture feedback isn't semantic interaction. Essential dragging requires keyboard/menu alternatives. Ensure `whileFocus` does not hide the native focus ring. Test mouse, touch and stylus inputs.

**Screen readers:** `MotionProgress` uses accessible progress semantics with labelled values. `MotionToggle` uses `aria-pressed` and must have a descriptive label. `MotionSkeleton` is decorative and must be accompanied by real status text. Presence exits should not trap focus or announce outdated content. Avoid unnecessary rapid motion and flashing.

**Manual verification:** Check keyboard-only navigation, real screen readers, mobile touch, 200% zoom, reduced-motion mode, focus restoration and color contrast. Motion Score does not measure these requirements.
