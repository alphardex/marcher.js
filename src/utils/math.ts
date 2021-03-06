const rad2Deg = (rad: number) => (rad * 180.0) / Math.PI;

const deg2rad = (deg: number) => (deg * Math.PI) / 180.0;

const toFixed1 = (num: number) => Number(num).toFixed(1);

const toFixed2 = (num: number) => Number(num).toFixed(2);

const lerp = (x: number, y: number, t: number) => {
  return (1 - t) * x + t * y;
};

export { rad2Deg, deg2rad, toFixed1, toFixed2, lerp };
