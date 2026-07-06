// Mutable pose the GSAP scroll timeline writes into and the R3F frame
// loop reads from. x/y are in fractions of the R3F viewport so the
// motion scales with any screen size.
export type MotionTarget = {
  rx: number;
  ry: number;
  rz: number;
  x: number;
  y: number;
  scale: number;
};

export const INITIAL_TARGET: MotionTarget = {
  rx: 0,
  ry: -0.4,
  rz: 0,
  x: 0,
  y: -0.04,
  scale: 1,
};
